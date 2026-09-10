import { NextResponse } from "next/server";
import tzLookup from "tz-lookup";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

export interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
  tzName: string;
}

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
const geocodeLimiter = createRateLimiter({ max: 10, windowMs: 60_000 });

// 3) Petit cache en mémoire : les recherches de lieux de naissance se
// répètent beaucoup (villes courantes) — évite un aller-retour Nominatim
// (et sa contrainte de débit) pour une requête déjà vue récemment.
const CACHE_TTL_MS = 10 * 60_000;
const resultCache = new Map<string, { results: GeocodeResult[]; expiresAt: number }>();

function resultsFromNominatimShape(data: Array<{ display_name: string; lat: string; lon: string }>): GeocodeResult[] {
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
}

/**
 * LocationIQ (fournisseur payant, clé API requise) exécute Nominatim en
 * interne : mêmes paramètres de requête, même forme de réponse
 * (display_name/lat/lon) — d'où la réutilisation directe de
 * resultsFromNominatimShape. Pas de sérialisation façon
 * scheduleNominatimCall ici : c'est un service payant avec son propre
 * quota par clé (2 req/s sur le palier gratuit, plus sur les palier
 * payants), pas une ressource communautaire à ménager tous utilisateurs
 * confondus.
 */
async function geocodeViaLocationIq(query: string, apiKey: string): Promise<GeocodeResult[]> {
  const url = new URL("https://us1.locationiq.com/v1/search");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`LocationIQ a répondu ${res.status}`);
  }
  const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json();
  return resultsFromNominatimShape(data);
}

/**
 * Nominatim (OpenStreetMap), sans clé d'API — pratique pour démarrer, mais
 * sa politique d'usage limite à 1 requête/seconde tous utilisateurs
 * confondus et interdit un usage commercial intensif sans instance
 * auto-hébergée. Repli automatique tant que LOCATIONIQ_API_KEY n'est pas
 * configurée (voir .env.example) — au-delà d'un certain volume, ajouter la
 * clé bascule silencieusement vers LocationIQ, sans changement de code.
 *
 * Remarque : cet appel réseau n'a pas pu être testé en conditions réelles
 * dans l'environnement de développement de cette session (accès sortant
 * restreint à une liste blanche qui n'inclut pas nominatim.openstreetmap.org) ;
 * l'implémentation suit néanmoins fidèlement le contrat documenté de
 * l'API Nominatim.
 */
async function geocodeViaNominatim(query: string): Promise<GeocodeResult[]> {
  return scheduleNominatimCall(async () => {
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
    return resultsFromNominatimShape(data);
  });
}

async function geocode(query: string): Promise<GeocodeResult[]> {
  const cacheKey = query.trim().toLowerCase();
  const cached = resultCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.results;

  const apiKey = process.env.LOCATIONIQ_API_KEY;
  const results = apiKey ? await geocodeViaLocationIq(query, apiKey) : await geocodeViaNominatim(query);

  resultCache.set(cacheKey, { results, expiresAt: Date.now() + CACHE_TTL_MS });
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (geocodeLimiter.isLimited(clientIp(request))) {
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
