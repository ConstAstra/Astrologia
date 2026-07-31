import { Astronomy, computeNorthNodePoint, computePlanetPoint } from "./ephemeris";
import { aspectBetweenPoints } from "./aspects";
import { MAJOR_ASPECTS, MINOR_ASPECTS, PLANET_KEYS } from "./types";
import type { AspectKey, EclipticPoint, NatalChart, PlanetKey, PointKey } from "./types";

export interface TransitAspect {
  transitingPlanet: PlanetKey;
  natalPoint: PointKey;
  aspect: AspectKey;
  angle: number;
  orb: number;
  exact: number;
  applying: boolean;
  major: boolean;
}

const TRANSIT_ORB_FACTOR = 0.4; // orbes resserrées : un transit se joue sur quelques jours, pas quelques semaines
const NATAL_TARGETS: PointKey[] = [...PLANET_KEYS, "asc", "mc"];

/** Positions planétaires "en transit" à un instant donné (par défaut : maintenant). */
export function computeTransitingPositions(date: Date = new Date()): Record<PlanetKey, EclipticPoint> {
  const time = new Astronomy.AstroTime(date);
  const points = {} as Record<PlanetKey, EclipticPoint>;
  for (const key of PLANET_KEYS) {
    points[key] = key === "northNode" ? computeNorthNodePoint(time) : computePlanetPoint(key, time);
  }
  return points;
}

/** Aspects entre les planètes en transit et les points d'un thème natal. */
export function computeTransitAspects(
  natalChart: NatalChart,
  date: Date = new Date(),
  options: { includeMinor?: boolean } = {}
): TransitAspect[] {
  const transiting = computeTransitingPositions(date);
  const defs = options.includeMinor === false ? MAJOR_ASPECTS : [...MAJOR_ASPECTS, ...MINOR_ASPECTS];
  const targets = natalChart.hasReliableHouses ? NATAL_TARGETS : [...PLANET_KEYS];

  const results: TransitAspect[] = [];
  for (const transitKey of PLANET_KEYS) {
    const transitPoint = transiting[transitKey];
    for (const natalKey of targets) {
      const natalPoint = natalChart.points[natalKey];
      if (!natalPoint) continue;
      const found = aspectBetweenPoints(transitPoint, natalPoint, defs, TRANSIT_ORB_FACTOR);
      if (found) {
        results.push({
          transitingPlanet: transitKey,
          natalPoint: natalKey,
          aspect: found.aspect,
          angle: found.angle,
          orb: found.orb,
          exact: found.exact,
          applying: found.applying,
          major: found.major,
        });
      }
    }
  }

  return results.sort((a, b) => Math.abs(a.exact) - Math.abs(b.exact));
}
