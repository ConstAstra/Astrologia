import { degreeInSign } from "./signs";
import { ZODIAC_SIGNS } from "./types";

/**
 * Interprétation du degré exact occupé par un point, indépendamment du
 * signe. Trois couches classiques, toutes structurelles (calculées, pas
 * recopiées d'un texte tiers) :
 *
 * 1. Décan — chaque signe de 30° est divisé en 3 décans de 10°, chacun sous
 *    l'influence d'une planète selon l'ordre chaldéen (Mars, Soleil, Vénus,
 *    Mercure, Lune, Saturne, Jupiter), qui se répète en boucle sur les 36
 *    décans du zodiaque. C'est le système de décans le plus classique en
 *    astrologie occidentale.
 * 2. Phase dans le signe — précoce / médiane / tardive.
 * 3. Degrés particuliers — le 29e degré ("anarétique", point de tension
 *    avant le changement de signe) et les degrés dits "critiques" dans la
 *    tradition classique.
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

export interface DegreeReading {
  degreeInSign: number; // 0-29 (partie entière)
  decanNumber: 1 | 2 | 3;
  decanRuler: DecanRuler;
  decanText: string;
  phase: "précoce" | "médiane" | "tardive";
  phaseText: string;
  isAnaretic: boolean;
  anareticText?: string;
  isCritical: boolean;
  criticalText?: string;
}

function phaseText(phase: DegreeReading["phase"]): string {
  if (phase === "précoce") {
    return "Degré précoce du signe : l'énergie s'exprime ici de façon encore brute et spontanée — la version la plus \"pure\", et parfois la moins maîtrisée, du signe.";
  }
  if (phase === "tardive") {
    return "Degré tardif du signe : l'énergie est ici mûrie, parfois déjà en transition vers la thématique du signe suivant — une forme plus consciente, parfois plus lasse, de cette énergie.";
  }
  return "Degré médian du signe : l'énergie est ici pleinement installée, dans sa version la plus stable et la plus caractéristique du signe.";
}

export function computeDegreeReading(longitude: number): DegreeReading {
  const l = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(l / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const inSign = degreeInSign(l);
  const wholeDeg = Math.floor(inSign);

  const decanIndex = Math.floor(wholeDeg / 10); // 0,1,2
  const globalDecan = signIndex * 3 + decanIndex; // 0-35
  const decanRuler = CHALDEAN_SEQUENCE[globalDecan % 7];

  const phase: DegreeReading["phase"] = wholeDeg < 10 ? "précoce" : wholeDeg < 20 ? "médiane" : "tardive";

  const isAnaretic = wholeDeg === 29;
  const modality = SIGN_MODALITY[sign];
  const isCritical = CRITICAL_DEGREES_BY_MODALITY[modality].includes(wholeDeg);

  return {
    degreeInSign: wholeDeg,
    decanNumber: (decanIndex + 1) as 1 | 2 | 3,
    decanRuler,
    decanText: `${decanIndex + 1}${decanIndex === 0 ? "er" : "e"} décan (0-10°/10-20°/20-30°) : ${DECAN_RULER_FLAVOR[decanRuler]}`,
    phase,
    phaseText: phaseText(phase),
    isAnaretic,
    anareticText: isAnaretic
      ? "Degré anarétique (29e degré) : point de tension maximale avant le changement de signe, souvent vécu comme une urgence à \"boucler\" ce que ce signe avait à enseigner avant de passer à autre chose — une énergie à vif, parfois précipitée."
      : undefined,
    isCritical,
    criticalText: isCritical
      ? "Degré \"critique\" selon la tradition classique : un repère que les astrologues considèrent de longue date comme chargé, où le thème du signe se manifeste avec une intensité ou une netteté particulière."
      : undefined,
  };
}
