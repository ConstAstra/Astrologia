import { degreeInSign } from "./signs";
import { ZODIAC_SIGNS } from "./types";

/**
 * Interprétation du degré exact occupé par un point, indépendamment du
 * signe. Trois couches classiques, toutes structurelles (calculées, pas
 * recopiées d'un texte tiers), et toutes chiffrées au degré-minute près —
 * pas de simple "précoce/médian/tardif" sans le nombre derrière :
 *
 * 1. Décan — chaque signe de 30° est divisé en 3 décans de 10°, chacun sous
 *    l'influence d'une planète selon l'ordre chaldéen (Mars, Soleil, Vénus,
 *    Mercure, Lune, Saturne, Jupiter), qui se répète en boucle sur les 36
 *    décans du zodiaque. C'est le système de décans le plus classique en
 *    astrologie occidentale.
 * 2. Phase dans le signe — précoce / médiane / tardive, avec la position
 *    exacte dans cette phase et ce qu'il reste avant la suivante.
 * 3. Degrés particuliers — le 29e degré ("anarétique", point de tension
 *    avant le changement de signe, avec le nombre de degrés-minutes
 *    restants) et les degrés dits "critiques" de la tradition classique,
 *    approchés avec un orbe d'1° plutôt qu'une correspondance au degré
 *    entier près, pour ne rien manquer d'un point tombé à quelques minutes
 *    d'un repère traditionnel.
 */

const CHALDEAN_SEQUENCE = ["Mars", "Soleil", "Vénus", "Mercure", "Lune", "Saturne", "Jupiter"] as const;
export type DecanRuler = (typeof CHALDEAN_SEQUENCE)[number];

const DECAN_RULER_FLAVOR: Record<DecanRuler, string> = {
  Mars: "une coloration Mars : plus direct, plus impatient, plus tourné vers l'action immédiate que le reste du signe.",
  Soleil: "une coloration Soleil : plus affirmé, plus centré sur la reconnaissance et l'expression consciente de soi.",
  Vénus: "une coloration Vénus : plus doux, plus sensible à l'harmonie, aux relations et au plaisir esthétique.",
  Mercure: "une coloration Mercure : plus mental, plus curieux, plus attentif au détail et à la communication.",
  Lune: "une coloration Lune : plus instinctif, plus sensible, plus dépendant de l'humeur et du besoin de sécurité affective.",
  Saturne: "une coloration Saturne : plus sérieux, plus structuré, plus concerné par la durée et la responsabilité.",
  Jupiter: "une coloration Jupiter : plus ample, plus optimiste, plus tourné vers l'expansion et la confiance.",
};

// Degrés critiques classiques (tradition occidentale), par modalité.
const CRITICAL_DEGREES_BY_MODALITY: Record<"Cardinal" | "Fixe" | "Mutable", number[]> = {
  Cardinal: [0, 13, 26],
  Fixe: [8, 21],
  Mutable: [4, 17],
};

const CRITICAL_ORB = 1; // dans un rayon d'1°, on considère le degré critique "actif"
const EXACT_THRESHOLD = 1 / 6; // 10' d'arc : en dessous, on parle d'un degré critique "exact"

const SIGN_MODALITY: Record<string, "Cardinal" | "Fixe" | "Mutable"> = {
  belier: "Cardinal",
  cancer: "Cardinal",
  balance: "Cardinal",
  capricorne: "Cardinal",
  taureau: "Fixe",
  lion: "Fixe",
  scorpion: "Fixe",
  verseau: "Fixe",
  gemeaux: "Mutable",
  vierge: "Mutable",
  sagittaire: "Mutable",
  poissons: "Mutable",
};

/** Formate une valeur en degrés (0-30, fraction) en "12°34'". */
function formatDegMin(value: number): string {
  const deg = Math.floor(value);
  let min = Math.round((value - deg) * 60);
  let d = deg;
  if (min === 60) {
    min = 0;
    d += 1;
  }
  return `${d}°${String(min).padStart(2, "0")}'`;
}

export interface DegreeReading {
  /** Position exacte dans le signe, en degrés décimaux (0-30). */
  exactDegreeInSign: number;
  degreeLabel: string;
  decanNumber: 1 | 2 | 3;
  decanRuler: DecanRuler;
  decanText: string;
  phase: "précoce" | "médiane" | "tardive";
  phaseText: string;
  isAnaretic: boolean;
  anareticText?: string;
  nearestCriticalDegree: number;
  criticalOrb: number; // écart absolu en degrés au degré critique le plus proche
  isCritical: boolean;
  criticalText?: string;
}

export function computeDegreeReading(longitude: number): DegreeReading {
  const l = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(l / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const exact = degreeInSign(l); // 0-30, fraction incluse
  const wholeDeg = Math.floor(exact);

  const decanIndex = Math.floor(wholeDeg / 10); // 0,1,2
  const globalDecan = signIndex * 3 + decanIndex; // 0-35
  const decanRuler = CHALDEAN_SEQUENCE[globalDecan % 7];
  const decanStart = decanIndex * 10;
  const posInDecan = exact - decanStart;
  const remainingInDecan = 10 - posInDecan;

  const phase: DegreeReading["phase"] = exact < 10 ? "précoce" : exact < 20 ? "médiane" : "tardive";
  const phaseStart = phase === "précoce" ? 0 : phase === "médiane" ? 10 : 20;
  const posInPhase = exact - phaseStart;
  const remainingInPhase = phaseStart + 10 - exact;

  const remainingInSign = 30 - exact;
  const isAnaretic = exact >= 29;

  const modality = SIGN_MODALITY[sign];
  const criticalCandidates = CRITICAL_DEGREES_BY_MODALITY[modality];
  let nearestCriticalDegree = criticalCandidates[0];
  let criticalOrb = Math.abs(exact - criticalCandidates[0]);
  for (const c of criticalCandidates.slice(1)) {
    const orb = Math.abs(exact - c);
    if (orb < criticalOrb) {
      criticalOrb = orb;
      nearestCriticalDegree = c;
    }
  }
  const isCritical = criticalOrb <= CRITICAL_ORB;

  const decanText = `${decanNumberLabel(decanIndex)} décan (${decanStart}°-${decanStart + 10}°), à ${formatDegMin(
    posInDecan
  )} de son entrée (encore ${formatDegMin(remainingInDecan)} avant le décan suivant) : ${DECAN_RULER_FLAVOR[decanRuler]}`;

  const phaseText = `Phase ${phase} du signe (${formatDegMin(posInPhase)} depuis son entrée dans cette phase, encore ${formatDegMin(
    remainingInPhase
  )} avant la phase suivante) : ${
    phase === "précoce"
      ? "l'énergie s'exprime ici de façon encore brute et spontanée — la version la plus \"pure\", et parfois la moins maîtrisée, du signe."
      : phase === "tardive"
        ? "l'énergie est ici mûrie, parfois déjà en transition vers la thématique du signe suivant — une forme plus consciente, parfois plus lasse, de cette énergie."
        : "l'énergie est ici pleinement installée, dans sa version la plus stable et la plus caractéristique du signe."
  }`;

  return {
    exactDegreeInSign: exact,
    degreeLabel: formatDegMin(exact),
    decanNumber: (decanIndex + 1) as 1 | 2 | 3,
    decanRuler,
    decanText,
    phase,
    phaseText,
    isAnaretic,
    anareticText: isAnaretic
      ? `Degré anarétique (29e degré, à ${formatDegMin(remainingInSign)} de la fin du signe) : point de tension maximale avant le changement de signe, souvent vécu comme une urgence à "boucler" ce que ce signe avait à enseigner avant de passer à autre chose — une énergie à vif, parfois précipitée.`
      : undefined,
    nearestCriticalDegree,
    criticalOrb,
    isCritical,
    criticalText: isCritical
      ? `Degré "critique" selon la tradition classique : à ${formatDegMin(criticalOrb)} ${
          criticalOrb <= EXACT_THRESHOLD ? "quasi exactement" : "du repère traditionnel"
        } de ${nearestCriticalDegree}°, un point que les astrologues considèrent de longue date comme chargé, où le thème du signe se manifeste avec une intensité ou une netteté particulière.`
      : undefined,
  };
}

function decanNumberLabel(decanIndex: number): string {
  return decanIndex === 0 ? "1er" : `${decanIndex + 1}e`;
}
