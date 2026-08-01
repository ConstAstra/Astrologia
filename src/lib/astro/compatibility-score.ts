import type { SynastryAspect } from "./synastry";
import type { AspectKey, PointKey } from "./types";

// Score de base par type d'aspect : les aspects harmonieux (trigone, sextile)
// tirent le score vers le haut, les aspects tendus (carré, opposition) vers
// le bas. La conjonction reste volontairement neutre-positive : elle fusionne
// deux énergies sans arbitrer si c'est un atout ou une friction, ce qui
// dépend surtout des planètes concernées plutôt que du type d'aspect lui-même.
const ASPECT_BASE_SCORE: Record<AspectKey, number> = {
  trine: 2,
  sextile: 1.5,
  conjunction: 1,
  "semi-sextile": 0.5,
  "semi-square": -0.8,
  sesquiquadrate: -1,
  quincunx: -1.2,
  opposition: -1.5,
  square: -2,
};

// Poids par point : les planètes personnelles (identité, affect, désir) et
// l'Ascendant pèsent le plus lourd dans une synastrie amoureuse ou humaine ;
// les planètes lentes (Uranus/Neptune/Pluton), largement partagées par toute
// une génération, pèsent peu — un aspect entre deux Plutons de la même
// tranche d'âge ne dit presque rien du couple en particulier.
const POINT_WEIGHT: Partial<Record<PointKey, number>> = {
  sun: 1,
  moon: 1,
  venus: 1,
  mars: 1,
  asc: 1,
  mc: 0.8,
  mercury: 0.7,
  jupiter: 0.7,
  saturn: 0.7,
  uranus: 0.4,
  neptune: 0.4,
  pluto: 0.4,
};

const DEFAULT_POINT_WEIGHT = 0.5;

// Échelle de la sigmoïde : calibrée empiriquement sur plusieurs paires de
// thèmes réels pour obtenir un étalement réaliste (environ 15 % à 85 %)
// plutôt que de coller la majorité des couples autour de 50 % ou de saturer
// trop vite vers 0/100. Le score ne touche jamais exactement 0 ou 100 : une
// synastrie n'est jamais un verdict absolu.
const SIGMOID_SCALE = 6;
const PERCENTAGE_FLOOR = 10;
const PERCENTAGE_RANGE = 85;

export interface CompatibilityScore {
  /** Pourcentage arrondi, toujours dans ]10, 95[. */
  percentage: number;
  /** Score brut avant normalisation, utile pour les tests et le débogage. */
  raw: number;
}

/**
 * Calcule un pourcentage de compatibilité "pour le fun" à partir des aspects
 * de synastrie : chaque aspect pèse selon sa nature (harmonieuse ou tendue),
 * l'importance des deux planètes concernées, et la précision de l'aspect
 * (plus il est proche de l'exact, plus il compte). Le résultat est une
 * indication ludique, pas une prédiction — cohérent avec le disclaimer déjà
 * affiché ailleurs dans l'app ("sans valeur prédictive garantie").
 */
export function computeCompatibilityScore(aspects: SynastryAspect[]): CompatibilityScore {
  let raw = 0;

  for (const asp of aspects) {
    const base = ASPECT_BASE_SCORE[asp.aspect] ?? 0;
    if (base === 0) continue;
    const weightA = POINT_WEIGHT[asp.personA] ?? DEFAULT_POINT_WEIGHT;
    const weightB = POINT_WEIGHT[asp.personB] ?? DEFAULT_POINT_WEIGHT;
    const importance = (weightA + weightB) / 2;
    const tightness = Math.max(0.15, 1 - Math.abs(asp.exact) / asp.orb);
    raw += base * importance * tightness;
  }

  const sigmoid = 1 / (1 + Math.exp(-raw / SIGMOID_SCALE));
  const percentage = Math.round(PERCENTAGE_FLOOR + sigmoid * PERCENTAGE_RANGE);

  return { percentage, raw };
}
