import { NextResponse } from "next/server";
import tzLookup from "tz-lookup";

export interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
  tzName: string;
}

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
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Astrologia/1.0 (contact via app settings)",
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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
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
