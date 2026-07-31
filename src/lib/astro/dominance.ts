import { signOf } from "./signs";
import { SIGN_META } from "./interpretations/signs";
import { PLANET_KEYS } from "./types";
import type { EclipticPoint, PointKey, ZodiacSign } from "./types";

const ELEMENTS = ["Feu", "Terre", "Air", "Eau"] as const;
const MODALITIES = ["Cardinal", "Fixe", "Mutable"] as const;

// Compte les 10 corps classiques + modernes (Soleil à Pluton) : une
// pondération égale et transparente, plutôt qu'un système de points
// propriétaire difficile à justifier précisément.
const DOMINANCE_POINTS: PointKey[] = PLANET_KEYS.filter((k) => k !== "northNode");

export interface DominanceReading {
  elementCounts: Record<(typeof ELEMENTS)[number], number>;
  modalityCounts: Record<(typeof MODALITIES)[number], number>;
  dominantElements: (typeof ELEMENTS)[number][];
  dominantModalities: (typeof MODALITIES)[number][];
}

export function computeDominance(points: Partial<Record<PointKey, EclipticPoint>>): DominanceReading {
  const elementCounts: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const modalityCounts: Record<string, number> = { Cardinal: 0, Fixe: 0, Mutable: 0 };

  for (const key of DOMINANCE_POINTS) {
    const point = points[key];
    if (!point) continue;
    const sign = signOf(point.longitude);
    const meta = SIGN_META[sign];
    elementCounts[meta.element] += 1;
    modalityCounts[meta.modality === "Fixe" ? "Fixe" : meta.modality] += 1;
  }

  const maxElement = Math.max(...ELEMENTS.map((e) => elementCounts[e]));
  const maxModality = Math.max(...MODALITIES.map((m) => modalityCounts[m]));

  return {
    elementCounts: elementCounts as DominanceReading["elementCounts"],
    modalityCounts: modalityCounts as DominanceReading["modalityCounts"],
    dominantElements: ELEMENTS.filter((e) => elementCounts[e] === maxElement && maxElement > 0),
    dominantModalities: MODALITIES.filter((m) => modalityCounts[m] === maxModality && maxModality > 0),
  };
}

export interface BigThree {
  sun: ZodiacSign;
  moon: ZodiacSign;
  ascendant: ZodiacSign | null;
}

export function computeBigThree(points: Partial<Record<PointKey, EclipticPoint>>, hasReliableHouses: boolean): BigThree {
  return {
    sun: signOf(points.sun!.longitude),
    moon: signOf(points.moon!.longitude),
    ascendant: hasReliableHouses && points.asc ? signOf(points.asc.longitude) : null,
  };
}
