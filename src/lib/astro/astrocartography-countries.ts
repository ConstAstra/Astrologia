import { geoContains, geoBounds } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import world from "world-atlas/countries-110m.json";
import { MAJOR_COUNTRIES } from "@/components/map/majorCountries";
import type { AstroCartoLine, AstroCartoLineType } from "./astrocartography";
import type { PlanetKey } from "./types";
import { getThemeTags, type ThemeCategory } from "./interpretations/astrocartography-categories";

export interface CountryLineMatch {
  planet: PlanetKey;
  type: AstroCartoLineType;
}

export interface CountryRanking {
  countryId: string;
  score: number;
  supportingLines: CountryLineMatch[];
}

// Géométries réelles des pays (frontières), construites une seule fois par
// process — utilisées uniquement pour tester si une ligne d'astrocartographie
// traverse un pays donné (test point-dans-polygone via geoContains), jamais
// pour le rendu de la carte (voir worldPaths.ts pour ça).
const countryFeatureByTopoName: Map<string, Feature<Geometry>> = (() => {
  const topology = world as unknown as Topology;
  const countries = feature(topology, topology.objects.countries as GeometryCollection);
  const map = new Map<string, Feature<Geometry>>();
  for (const f of countries.features) {
    const name = (f.properties as { name?: string } | null)?.name;
    if (name) map.set(name, f as Feature<Geometry>);
  }
  return map;
})();

const COUNTRY_LAT_SAMPLE_STEP = 2;

/** Teste si une ligne MC/IC (droite verticale, longitude constante) traverse ce pays. */
function meridianCrossesCountry(longitude: number, feat: Feature<Geometry>): boolean {
  const bounds = geoBounds(feat);
  const [[, minLat], [, maxLat]] = bounds;
  for (let lat = minLat; lat <= maxLat; lat += COUNTRY_LAT_SAMPLE_STEP) {
    if (geoContains(feat, [longitude, lat])) return true;
  }
  return geoContains(feat, [longitude, maxLat]);
}

/** Teste si une ligne AC/DC (courbe échantillonnée) traverse ce pays. */
function pathCrossesCountry(path: { lat: number; lon: number }[], feat: Feature<Geometry>): boolean {
  const [[minLon, minLat], [maxLon, maxLat]] = geoBounds(feat);
  for (const p of path) {
    // Filtre rapide sur la boîte englobante avant le test point-dans-polygone,
    // plus coûteux — la plupart des points d'une courbe globale sont loin du
    // pays testé.
    if (p.lat < minLat - 1 || p.lat > maxLat + 1) continue;
    if (minLon <= maxLon ? p.lon < minLon - 1 || p.lon > maxLon + 1 : false) continue;
    if (geoContains(feat, [p.lon, p.lat])) return true;
  }
  return false;
}

/**
 * Pour chaque pays de la liste `MAJOR_COUNTRIES`, détermine quelles lignes
 * d'astrocartographie (planète × type MC/IC/AC/DC) le traversent réellement,
 * en s'appuyant sur les frontières géographiques exactes (topojson) plutôt
 * que sur une simple proximité de coordonnées.
 */
export function computeCountryLineMatches(lines: AstroCartoLine[]): Record<string, CountryLineMatch[]> {
  const result: Record<string, CountryLineMatch[]> = {};

  for (const country of MAJOR_COUNTRIES) {
    const feat = countryFeatureByTopoName.get(country.topoName);
    if (!feat) continue;

    const matches: CountryLineMatch[] = [];
    for (const line of lines) {
      const crosses =
        line.longitude !== undefined
          ? meridianCrossesCountry(line.longitude, feat)
          : line.path
            ? pathCrossesCountry(line.path, feat)
            : false;
      if (crosses) matches.push({ planet: line.planet, type: line.type });
    }
    result[country.id] = matches;
  }

  return result;
}

/**
 * Classe les pays de `MAJOR_COUNTRIES` pour un thème donné (amour, carrière,
 * spirituel, voyage), à partir des lignes qui les traversent réellement.
 * Score = nombre de lignes favorables au thème moins nombre de lignes
 * difficiles pour ce même thème ; seules les lignes favorables sont
 * remontées comme "raison" (on ne recommande jamais un pays sur la base
 * d'une ligne qu'on qualifie nous-même de difficile).
 */
export function rankCountriesForCategory(
  category: ThemeCategory,
  countryMatches: Record<string, CountryLineMatch[]>
): CountryRanking[] {
  const rankings: CountryRanking[] = [];

  for (const [countryId, matches] of Object.entries(countryMatches)) {
    let score = 0;
    const supportingLines: CountryLineMatch[] = [];

    for (const match of matches) {
      const tags = getThemeTags(match.planet, match.type).filter((t) => t.category === category);
      for (const tag of tags) {
        if (tag.valence === "positive") {
          score += 1;
          supportingLines.push(match);
        } else {
          score -= 1;
        }
      }
    }

    if (score > 0) rankings.push({ countryId, score, supportingLines });
  }

  return rankings.sort((a, b) => b.score - a.score);
}
