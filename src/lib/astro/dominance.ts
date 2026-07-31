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

// Les planètes "personnelles" (Soleil à Mars) bougent vite et distinguent un
// individu de ses pairs ; Uranus, Neptune et Pluton bougent si lentement
// qu'ils sont quasi identiques pour toute une génération née à quelques
// années d'écart. Une dominante portée uniquement par ces trois-là décrit
// donc surtout une époque, pas la personne — d'où l'intérêt d'exposer cette
// distinction plutôt que de la laisser noyée dans un compte à poids égal.
export const PERSONAL_PLANET_KEYS: PointKey[] = ["sun", "moon", "mercury", "venus", "mars"];

export interface DominanceReading {
  elementCounts: Record<(typeof ELEMENTS)[number], number>;
  modalityCounts: Record<(typeof MODALITIES)[number], number>;
  /** Quels points précis composent chaque total, pour que le décompte soit vérifiable plutôt qu'une boîte noire. */
  elementPlanets: Record<(typeof ELEMENTS)[number], PointKey[]>;
  modalityPlanets: Record<(typeof MODALITIES)[number], PointKey[]>;
  dominantElements: (typeof ELEMENTS)[number][];
  dominantModalities: (typeof MODALITIES)[number][];
}

/** Vrai si aucune planète personnelle (Soleil-Mars) ne contribue à ce total — la dominante reflète alors surtout la génération, pas l'individu. */
export function isGenerationalOnly(planets: PointKey[]): boolean {
  return planets.length > 0 && !planets.some((p) => PERSONAL_PLANET_KEYS.includes(p));
}

export function computeDominance(points: Partial<Record<PointKey, EclipticPoint>>): DominanceReading {
  const elementCounts: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const modalityCounts: Record<string, number> = { Cardinal: 0, Fixe: 0, Mutable: 0 };
  const elementPlanets: Record<string, PointKey[]> = { Feu: [], Terre: [], Air: [], Eau: [] };
  const modalityPlanets: Record<string, PointKey[]> = { Cardinal: [], Fixe: [], Mutable: [] };

  for (const key of DOMINANCE_POINTS) {
    const point = points[key];
    if (!point) continue;
    const sign = signOf(point.longitude);
    const meta = SIGN_META[sign];
    elementCounts[meta.element] += 1;
    elementPlanets[meta.element].push(key);
    const modality = meta.modality === "Fixe" ? "Fixe" : meta.modality;
    modalityCounts[modality] += 1;
    modalityPlanets[modality].push(key);
  }

  const maxElement = Math.max(...ELEMENTS.map((e) => elementCounts[e]));
  const maxModality = Math.max(...MODALITIES.map((m) => modalityCounts[m]));

  return {
    elementCounts: elementCounts as DominanceReading["elementCounts"],
    modalityCounts: modalityCounts as DominanceReading["modalityCounts"],
    elementPlanets: elementPlanets as DominanceReading["elementPlanets"],
    modalityPlanets: modalityPlanets as DominanceReading["modalityPlanets"],
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
