import { NextResponse } from "next/server";
import tzLookup from "tz-lookup";

export interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
  tzName: string;
}

// Limiteur en mémoire (process unique) : suffisant pour une seule instance
// serveur, mais ne protège pas un déploiement multi-instance — dans ce cas,
// remplacer par un store partagé (Redis, etc.).

// 1) Débit global vers Nominatim : sa politique d'usage impose au plus 1
// requête/seconde tous utilisateurs confondus, pas par utilisateur — on
// sérialise donc tous les appels sortants derrière une file d'attente qui
// respecte cet espacement minimal.
let nominatimQueueTail: Promise<void> = Promise.resolve();
let lastNominatimCallAt = 0;
const MIN_NOMINATIM_INTERVAL_MS = 1100;

function scheduleNominatimCall<T>(task: () => Promise<T>): Promise<T> {
  const run = nominatimQueueTail.then(async () => {
    const wait = MIN_NOMINATIM_INTERVAL_MS - (Date.now() - lastNominatimCallAt);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastNominatimCallAt = Date.now();
  });
  nominatimQueueTail = run.catch(() => {});
  return run.then(task);
}

// 2) Débit par IP côté client : empêche un seul utilisateur (ou bot) de
// monopoliser le quota global partagé ci-dessus.
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const requestTimestampsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestTimestampsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestTimestampsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

// 3) Petit cache en mémoire : les recherches de lieux de naissance se
// répètent beaucoup (villes courantes) — évite un aller-retour Nominatim
// (et sa contrainte de débit) pour une requête déjà vue récemment.
const CACHE_TTL_MS = 10 * 60_000;
const resultCache = new Map<string, { results: GeocodeResult[]; expiresAt: number }>();

/**
 * Géocodage du lieu de naissance via Nominatim (OpenStreetMap), qui ne
 * demande pas de clé d'API — pratique pour démarrer. Sa politique d'usage
 * limite cependant à 1 requête/seconde et interdit un usage commercial
 * intensif sans instance auto-hébergée : au-delà d'un certain volume
 * d'utilisateurs, prévoir de migrer vers un fournisseur payant (Google
 * Places, Mapbox, LocationIQ...) — ce module est conçu pour être remplacé
 * facilement (une seule fonction `geocode`).
 *
 * Remarque : cet appel réseau n'a pas pu être testé en conditions réelles
 * dans l'environnement de développement de cette session (accès sortant
 * restreint à une liste blanche qui n'inclut pas nominatim.openstreetmap.org) ;
 * l'implémentation suit néanmoins fidèlement le contrat documenté de
 * l'API Nominatim.
 */
async function geocode(query: string): Promise<GeocodeResult[]> {
  const cacheKey = query.trim().toLowerCase();
  const cached = resultCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.results;

  const results = await scheduleNominatimCall(async () => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "0");

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Astrologium/1.0 (contact via app settings)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Nominatim a répondu ${res.status}`);
    }

    const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json();

    return data.map((entry) => {
      const latitude = parseFloat(entry.lat);
      const longitude = parseFloat(entry.lon);
      return {
        label: entry.display_name,
        latitude,
        longitude,
        tzName: tzLookup(latitude, longitude),
      };
    });
  });

  resultCache.set(cacheKey, { results, expiresAt: Date.now() + CACHE_TTL_MS });
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Trop de recherches, merci de patienter quelques secondes." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const results = await geocode(q);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json(
      { error: "Impossible de contacter le service de géocodage pour le moment." },
      { status: 502 }
    );
  }
}
