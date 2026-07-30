import { aspectBetweenPoints } from "./aspects";
import { houseOfLongitude } from "./houses";
import { ANGLE_KEYS, MAJOR_ASPECTS, MINOR_ASPECTS, PLANET_KEYS } from "./types";
import type { AspectKey, NatalChart, PointKey } from "./types";

export const SYNASTRY_POINT_KEYS: PointKey[] = [...PLANET_KEYS, "asc", "mc"];

export interface SynastryAspect {
  personA: PointKey;
  personB: PointKey;
  aspect: AspectKey;
  angle: number;
  orb: number;
  exact: number;
  applying: boolean;
  major: boolean;
}

export interface HouseOverlay {
  point: PointKey;
  house: number;
}

export interface SynastryResult {
  aspects: SynastryAspect[];
  /** Dans quelles maisons de A tombent les planètes de B. */
  bPlanetsInAHouses: HouseOverlay[];
  /** Dans quelles maisons de B tombent les planètes de A. */
  aPlanetsInBHouses: HouseOverlay[];
}

export function computeSynastry(
  chartA: NatalChart,
  chartB: NatalChart,
  options: { includeMinor?: boolean } = {}
): SynastryResult {
  const defs = options.includeMinor === false ? MAJOR_ASPECTS : [...MAJOR_ASPECTS, ...MINOR_ASPECTS];
  const aspects: SynastryAspect[] = [];

  for (const keyA of SYNASTRY_POINT_KEYS) {
    const pointA = chartA.points[keyA];
    if (!pointA) continue;
    for (const keyB of SYNASTRY_POINT_KEYS) {
      const pointB = chartB.points[keyB];
      if (!pointB) continue;
      const found = aspectBetweenPoints(pointA, pointB, defs, 1);
      if (found) {
        aspects.push({
          personA: keyA,
          personB: keyB,
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

  aspects.sort((a, b) => Math.abs(a.exact) - Math.abs(b.exact));

  const bPlanetsInAHouses: HouseOverlay[] = chartA.hasReliableHouses
    ? [...PLANET_KEYS, ...ANGLE_KEYS]
        .filter((k) => chartB.points[k])
        .map((k) => ({ point: k, house: houseOfLongitude(chartB.points[k].longitude, chartA.houses.cusps) }))
    : [];

  const aPlanetsInBHouses: HouseOverlay[] = chartB.hasReliableHouses
    ? [...PLANET_KEYS, ...ANGLE_KEYS]
        .filter((k) => chartA.points[k])
        .map((k) => ({ point: k, house: houseOfLongitude(chartA.points[k].longitude, chartB.houses.cusps) }))
    : [];

  return { aspects, bPlanetsInAHouses, aPlanetsInBHouses };
}
