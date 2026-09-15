import { acosD, tanD } from "./trig";
import { eclipticToEquatorial, normalizeDegrees } from "./ephemeris";
import { ANGULAR_PLANET_KEYS } from "./interpretations/astrocartography-content";
import type { NatalChart, PlanetKey } from "./types";

export type AstroCartoLineType = "MC" | "IC" | "AC" | "DC";

export interface LatLon {
  lat: number;
  lon: number;
}

export interface AstroCartoLine {
  planet: PlanetKey;
  type: AstroCartoLineType;
  /** MC/IC : droites verticales (longitude constante). */
  longitude?: number;
  /** AC/DC : courbes, un point par latitude échantillonnée. */
  path?: LatLon[];
}

function to180(lonDeg: number): number {
  const n = normalizeDegrees(lonDeg);
  return n > 180 ? n - 360 : n;
}

export interface AstrocartographyOptions {
  latStep?: number;
  latRange?: number;
  planets?: PlanetKey[];
}

/**
 * Calcule les lignes d'astrocartographie (MC, IC, AC, DC) d'un thème natal,
 * projetées sur toute la surface du globe.
 *
 * Principe : la position d'une planète (ascension droite / déclinaison) ne
 * dépend pas du lieu d'observation — seul le lieu détermine, à un instant
 * donné, QUEL point du ciel se trouve au Milieu du Ciel, à l'Ascendant, etc.
 * On "retourne" donc les formules des angles (voir houses.ts) : au lieu de
 * calculer l'angle à partir du lieu, on calcule pour chaque lieu (longitude
 * pour MC/IC, courbe latitude→longitude pour AC/DC) où la planète occuperait
 * cet angle exactement au moment de la naissance.
 */
export function computeAstrocartography(
  chart: NatalChart,
  options: AstrocartographyOptions = {}
): AstroCartoLine[] {
  const latStep = options.latStep ?? 0.5;
  const latRange = options.latRange ?? 80;
  const planets = options.planets ?? ANGULAR_PLANET_KEYS;

  // GST (temps sidéral de Greenwich) déduit du RAMC déjà calculé pour ce
  // thème : RAMC = GST + longitude géographique du lieu de naissance.
  const gst = normalizeDegrees(chart.ramc - chart.input.longitude);

  const lines: AstroCartoLine[] = [];

  for (const key of planets) {
    const point = chart.points[key];
    if (!point) continue;
    const { ra, dec } = eclipticToEquatorial(point.longitude, point.latitude ?? 0, chart.obliquity);

    const mcLon = to180(ra - gst);
    const icLon = to180(ra + 180 - gst);
    lines.push({ planet: key, type: "MC", longitude: mcLon });
    lines.push({ planet: key, type: "IC", longitude: icLon });

    const acPath: LatLon[] = [];
    const dcPath: LatLon[] = [];
    for (let lat = -latRange; lat <= latRange + 1e-9; lat += latStep) {
      const arg = -tanD(lat) * tanD(dec);
      if (arg < -1 || arg > 1) continue; // planète circumpolaire à cette latitude : pas de lever/coucher
      const dsa = acosD(arg);
      acPath.push({ lat, lon: to180(ra - dsa - gst) });
      dcPath.push({ lat, lon: to180(ra + dsa - gst) });
    }
    lines.push({ planet: key, type: "AC", path: acPath });
    lines.push({ planet: key, type: "DC", path: dcPath });
  }

  return lines;
}
