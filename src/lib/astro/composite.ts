import { angleDiff, normalizeDegrees } from "./ephemeris";
import { houseOfLongitude } from "./houses";
import { ANGLE_KEYS, ASTEROID_KEYS, PLANET_KEYS, VERTEX_KEYS } from "./types";
import type { CompositeChart, EclipticPoint, NatalChart, PointKey } from "./types";

/** Point médian circulaire (arc le plus court) entre deux longitudes. */
export function circularMidpoint(a: number, b: number): number {
  return normalizeDegrees(a + angleDiff(a, b) / 2);
}

function equalCuspsFrom(asc: number): number[] {
  return Array.from({ length: 12 }, (_, i) => normalizeDegrees(asc + i * 30));
}

/**
 * Thème composite par la méthode des points médians (Robert Hand) : chaque
 * planète du composite est le point médian circulaire des deux thèmes
 * natals ; l'Ascendant et le Milieu du Ciel composites sont eux-mêmes des
 * points médians des deux Ascendants/MC.
 *
 * Comme il n'existe pas de lieu géographique réel pour ce couple, les
 * maisons intermédiaires sont réparties en maisons égales à partir de
 * l'Ascendant composite (convention la plus répandue pour ce type de
 * thème). Une alternative existante — le "thème relationnel" de Davison,
 * qui recalcule un vrai thème pour la date/lieu moyens du couple — n'est
 * pas encore proposée ; voir la feuille de route.
 */
export function computeComposite(chartA: NatalChart, chartB: NatalChart): CompositeChart {
  const points: Partial<Record<PointKey, EclipticPoint>> = {};

  const keys: PointKey[] = [...PLANET_KEYS, ...ANGLE_KEYS, ...ASTEROID_KEYS, ...VERTEX_KEYS];
  for (const key of keys) {
    const a = chartA.points[key];
    const b = chartB.points[key];
    if (!a || !b) continue;
    points[key] = {
      key,
      longitude: circularMidpoint(a.longitude, b.longitude),
      latitude: 0,
    };
  }

  const asc = points.asc!.longitude;
  const mc = points.mc?.longitude ?? normalizeDegrees(asc - 90);
  const cusps = equalCuspsFrom(asc);

  const hasReliableHouses = chartA.hasReliableHouses && chartB.hasReliableHouses;
  if (hasReliableHouses) {
    for (const point of Object.values(points) as EclipticPoint[]) {
      point.house = houseOfLongitude(point.longitude, cusps);
    }
  }

  return {
    points: points as Record<PointKey, EclipticPoint>,
    houses: { system: "equal", cusps, ascendant: asc, midheaven: mc },
    hasReliableHouses,
  };
}
