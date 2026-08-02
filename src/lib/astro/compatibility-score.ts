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

// Planètes "chaudes" : ce qui se ressent au quotidien dans une relation
// (identité, affect, désir, façon de se présenter à l'autre), par
// opposition aux planètes lentes (Uranus/Neptune/Pluton) ou secondaires
// (Mercure, Jupiter, Saturn, MC) qui pèsent peu ici — voir POINT_WEIGHT.
// Restreindre le signal d'intensité à ce sous-ensemble est nécessaire : sur
// l'ensemble complet des points, deux thèmes quelconques génèrent toujours
// 60 à 80 aspects mineurs et majeurs confondus, harmonieux et tendus à peu
// près à parts égales (loi des grands nombres) — un signal "intensité" basé
// sur tous les aspects ne discrimine donc presque rien entre deux paires
// réelles. Restreint aux aspects majeurs entre points chauds, la variation
// redevient significative (calibré empiriquement sur plusieurs paires
// réelles : entre ~4 et ~10 pour l'amplitude, 0 à ~1 pour l'équilibre).
const HOT_POINTS: ReadonlySet<PointKey> = new Set(["sun", "moon", "venus", "mars", "asc"]);
const INTENSITY_CHARGED_THRESHOLD = 7;
const INTENSITY_BALANCE_THRESHOLD = 0.5;

interface SynastryIntensity {
  /** Somme des contributions absolues des aspects majeurs entre points chauds. */
  amplitude: number;
  /** 0 = les aspects chauds tirent tous dans le même sens ; 1 = harmonie et tension s'équilibrent. */
  balance: number;
}

function computeSynastryIntensity(aspects: SynastryAspect[]): SynastryIntensity {
  let pos = 0;
  let neg = 0;

  for (const asp of aspects) {
    if (!asp.major || !HOT_POINTS.has(asp.personA) || !HOT_POINTS.has(asp.personB)) continue;
    const base = ASPECT_BASE_SCORE[asp.aspect] ?? 0;
    if (base === 0) continue;
    const tightness = Math.max(0.15, 1 - Math.abs(asp.exact) / asp.orb);
    const contribution = base * tightness;
    if (contribution > 0) pos += contribution;
    else neg += Math.abs(contribution);
  }

  const amplitude = pos + neg;
  const balance = amplitude === 0 ? 0 : Math.min(pos, neg) / Math.max(pos, neg);
  return { amplitude, balance };
}

interface ArchetypeTier {
  minPercentage: number;
  fr: string;
  en: string;
  color: string;
}

// Deux jeux de libellés par tranche de pourcentage, selon que les points
// chauds (voir ci-dessus) tirent dans des directions opposées à peu près à
// force égale ("chaotic": beaucoup d'attirance ET de friction en même
// temps) ou consistent ("calm": ce qui domine domine nettement, qu'il y ait
// beaucoup ou peu en jeu). Le pourcentage affiché reste calculé sur
// l'ensemble des aspects (computeCompatibilityScore) — ces libellés
// n'en changent jamais le sens, ils qualifient la texture en plus du score.
const ARCHETYPE_CALM: ArchetypeTier[] = [
  { minPercentage: 70, fr: "Fusion rare", en: "Rare fusion", color: "#f2b799" },
  { minPercentage: 45, fr: "Ça se construit", en: "Worth building", color: "#9fc0a3" },
  { minPercentage: 0, fr: "Mondes différents", en: "Different worlds", color: "#c96b4a" },
];

const ARCHETYPE_CHAOTIC: ArchetypeTier[] = [
  { minPercentage: 70, fr: "Grande passion, montagnes russes", en: "Big passion, rollercoaster", color: "#e6237a" },
  { minPercentage: 45, fr: "Intense mais chaotique", en: "Intense but chaotic", color: "#c77b8a" },
  { minPercentage: 0, fr: "Attraction électrique, friction garantie", en: "Electric pull, guaranteed friction", color: "#c96b4a" },
];

/**
 * Punchline courte + couleur associée à une synastrie — utilisée sur la
 * carte de partage publique, où il n'y a la place que pour un score et une
 * phrase, sans le détail des aspects qui le justifie. Croise le pourcentage
 * global (computeCompatibilityScore) avec la texture "chaude" du duo
 * (computeSynastryIntensity) : à score égal, une paire dont les planètes
 * personnelles s'équilibrent entre harmonie et friction lit très
 * différemment d'une paire qui penche nettement d'un seul côté.
 */
export function compatibilityPunchline(
  percentage: number,
  aspects: SynastryAspect[],
  locale: "fr" | "en" = "fr"
): { text: string; color: string } {
  const { amplitude, balance } = computeSynastryIntensity(aspects);
  const isChaotic = amplitude >= INTENSITY_CHARGED_THRESHOLD && balance >= INTENSITY_BALANCE_THRESHOLD;
  const tiers = isChaotic ? ARCHETYPE_CHAOTIC : ARCHETYPE_CALM;
  const tier = tiers.find((t) => percentage >= t.minPercentage) ?? tiers[tiers.length - 1];
  return { text: locale === "en" ? tier.en : tier.fr, color: tier.color };
}
