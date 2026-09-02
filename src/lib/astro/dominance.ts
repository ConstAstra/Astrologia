import { signOf } from "./signs";
import { SIGN_META } from "./interpretations/signs";
import { ascendantRulerOf } from "./interpretations/rulership";
import type { EclipticPoint, PointKey, ZodiacSign } from "./types";

const ELEMENTS = ["Feu", "Terre", "Air", "Eau"] as const;
const MODALITIES = ["Cardinal", "Fixe", "Mutable"] as const;

// Les planètes "personnelles" (Soleil à Mars) bougent vite et distinguent un
// individu de ses pairs — contrairement aux planètes lentes (Jupiter à
// Pluton), quasi identiques pour toute une génération née à quelques années
// d'écart. Compter les 9-10 planètes à poids égal (comme dans une première
// version de ce module) peut donc faire ressortir une "dominante" qui ne
// dit en réalité rien de la personne, seulement de son époque.
//
// La dominante est donc calculée uniquement sur : les 5 planètes
// personnelles + le maître de l'Ascendant (la planète qui gouverne le signe
// levant, considérée en astrologie comme le "chef d'orchestre" du thème,
// qu'elle soit rapide ou lente — sa lenteur ne change rien à sa pertinence
// individuelle puisqu'elle est choisie pour son rôle, pas pour sa vitesse).
export const PERSONAL_PLANET_KEYS: PointKey[] = ["sun", "moon", "mercury", "venus", "mars"];

export interface DominanceReading {
  elementCounts: Record<(typeof ELEMENTS)[number], number>;
  modalityCounts: Record<(typeof MODALITIES)[number], number>;
  /** Quels points précis composent chaque total, pour que le décompte soit vérifiable plutôt qu'une boîte noire. */
  elementPlanets: Record<(typeof ELEMENTS)[number], PointKey[]>;
  modalityPlanets: Record<(typeof MODALITIES)[number], PointKey[]>;
  dominantElements: (typeof ELEMENTS)[number][];
  dominantModalities: (typeof MODALITIES)[number][];
  /** Le maître de l'Ascendant utilisé dans le calcul, s'il a pu être déterminé (heure de naissance connue). */
  ascendantRuler: PointKey | null;
}

/** Vrai si aucune planète personnelle (Soleil-Mars) ne contribue à ce total. Conservé pour usage défensif : la nouvelle méthode de calcul (personnelles + maître d'Ascendant) rend ce cas rare en pratique. */
export function isGenerationalOnly(planets: PointKey[]): boolean {
  return planets.length > 0 && !planets.some((p) => PERSONAL_PLANET_KEYS.includes(p));
}

export function computeDominance(
  points: Partial<Record<PointKey, EclipticPoint>>,
  hasReliableHouses = true
): DominanceReading {
  const elementCounts: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const modalityCounts: Record<string, number> = { Cardinal: 0, Fixe: 0, Mutable: 0 };
  const elementPlanets: Record<string, PointKey[]> = { Feu: [], Terre: [], Air: [], Eau: [] };
  const modalityPlanets: Record<string, PointKey[]> = { Cardinal: [], Fixe: [], Mutable: [] };

  const ascendantRuler =
    hasReliableHouses && points.asc ? ascendantRulerOf(signOf(points.asc.longitude)) : null;

  const dominancePoints: PointKey[] = ascendantRuler
    ? [...PERSONAL_PLANET_KEYS, ...(PERSONAL_PLANET_KEYS.includes(ascendantRuler) ? [] : [ascendantRuler])]
    : PERSONAL_PLANET_KEYS;

  for (const key of dominancePoints) {
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
    ascendantRuler,
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
