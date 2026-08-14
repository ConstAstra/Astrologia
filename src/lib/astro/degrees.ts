import { degreeInSign } from "./signs";
import { ZODIAC_SIGNS } from "./types";
import type { PointKey } from "./types";

/**
 * Interprétation du degré exact occupé par un point, indépendamment du
 * signe. Cinq couches classiques, toutes structurelles (calculées, pas
 * recopiées d'un texte tiers), et toutes chiffrées au degré-minute près —
 * pas de simple "précoce/médian/tardif" sans le nombre derrière :
 *
 * 1. Décan — chaque signe de 30° est divisé en 3 décans de 10°, chacun sous
 *    l'influence d'une planète selon l'ordre chaldéen (Mars, Soleil, Vénus,
 *    Mercure, Lune, Saturne, Jupiter), qui se répète en boucle sur les 36
 *    décans du zodiaque. C'est le système de décans le plus classique en
 *    astrologie occidentale.
 * 2. Tempérament du décan — la planète du décan a, dans la tradition
 *    classique, une nature chaude/froide et sèche/humide propre ; on la
 *    compare à celle de l'élément du signe pour dire si ce décan amplifie
 *    l'élément (mêmes qualités), le nuance (une qualité commune) ou lui
 *    fait vraiment contrepoint (aucune qualité commune) — plutôt que de
 *    répéter la même phrase de "coloration" pour un décan de Mars qu'on
 *    tombe en Bélier (Feu, la même nature) ou en Cancer (Eau, l'opposé).
 * 3. Phase dans le signe — précoce / médiane / tardive, avec la position
 *    exacte dans cette phase et ce qu'il reste avant la suivante.
 * 4. Degrés particuliers — le 29e degré ("anarétique", point de tension
 *    avant le changement de signe, avec le nombre de degrés-minutes
 *    restants) et les degrés dits "critiques" de la tradition classique,
 *    approchés avec un orbe d'1° plutôt qu'une correspondance au degré
 *    entier près, pour ne rien manquer d'un point tombé à quelques minutes
 *    d'un repère traditionnel.
 * 5. Connexion au maître du décan — quand la position réelle de la
 *    planète-maîtresse dans le thème de la personne est connue (voir
 *    describeDegree dans compose.ts, qui fait cette recherche), on indique
 *    où elle se trouve elle-même (signe, maison), et si elle y est chez
 *    elle (domicile classique) — pour que la lecture du décan renvoie à un
 *    point précis et personnel du thème plutôt qu'à une généralité valable
 *    pour tout le monde né avec le même décan.
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

const DECAN_RULER_FLAVOR_EN: Record<DecanRuler, string> = {
  Mars: "a Mars coloring: more direct, more impatient, more focused on immediate action than the rest of the sign.",
  Soleil: "a Sun coloring: more assertive, more centered on recognition and conscious self-expression.",
  Vénus: "a Venus coloring: gentler, more attuned to harmony, relationships and aesthetic pleasure.",
  Mercure: "a Mercury coloring: more mental, more curious, more attentive to detail and communication.",
  Lune: "a Moon coloring: more instinctive, more sensitive, more dependent on mood and the need for emotional security.",
  Saturne: "a Saturn coloring: more serious, more structured, more concerned with staying power and responsibility.",
  Jupiter: "a Jupiter coloring: broader, more optimistic, more focused on expansion and confidence.",
};

// Tempérament classique (chaud/froid, sec/humide) de la planète-maîtresse du
// décan et de l'élément du signe — comparés pour dire si le décan amplifie,
// nuance ou contredit la nature de base du signe, plutôt qu'une coloration
// identique qu'on tombe dans un signe qui la partage ou son opposé exact.
// Mercure est traditionnellement "variable" (prend la nature de ce qui
// l'entoure) ; retenu ici froid/sec par défaut, valeur la plus citée en
// l'absence d'autre configuration.
type Temperament = { heat: "hot" | "cold"; moisture: "dry" | "moist" };

const DECAN_RULER_TEMPERAMENT: Record<DecanRuler, Temperament> = {
  Mars: { heat: "hot", moisture: "dry" },
  Soleil: { heat: "hot", moisture: "dry" },
  Vénus: { heat: "hot", moisture: "moist" },
  Mercure: { heat: "cold", moisture: "dry" },
  Lune: { heat: "cold", moisture: "moist" },
  Saturne: { heat: "cold", moisture: "dry" },
  Jupiter: { heat: "hot", moisture: "moist" },
};

// Point du thème natal correspondant à chaque planète-maîtresse de décan —
// pour retrouver sa propre position réelle dans le thème de la personne
// (voir rulerConnectionText), plutôt que de parler du décan uniquement en
// général comme si la même chose valait pour tout le monde né à ce degré.
export const DECAN_RULER_TO_POINT_KEY: Record<DecanRuler, PointKey> = {
  Mars: "mars",
  Soleil: "sun",
  Vénus: "venus",
  Mercure: "mercury",
  Lune: "moon",
  Saturne: "saturn",
  Jupiter: "jupiter",
};

// Domicile classique (avant la co-régence des planètes modernes) — sert
// uniquement à signaler si la planète-maîtresse du décan est, dans le
// thème réel de la personne, sur l'un de ses propres signes : un fait
// structurel simple (correspondance de signe), pas un jugement de force.
export const DECAN_RULER_DOMICILE_SIGNS: Record<DecanRuler, string[]> = {
  Mars: ["belier", "scorpion"],
  Soleil: ["lion"],
  Vénus: ["taureau", "balance"],
  Mercure: ["gemeaux", "vierge"],
  Lune: ["cancer"],
  Saturne: ["capricorne", "verseau"],
  Jupiter: ["sagittaire", "poissons"],
};

const ELEMENT_TEMPERAMENT: Record<"Feu" | "Terre" | "Air" | "Eau", Temperament> = {
  Feu: { heat: "hot", moisture: "dry" },
  Terre: { heat: "cold", moisture: "dry" },
  Air: { heat: "hot", moisture: "moist" },
  Eau: { heat: "cold", moisture: "moist" },
};

const SIGN_ELEMENT: Record<string, "Feu" | "Terre" | "Air" | "Eau"> = {
  belier: "Feu",
  lion: "Feu",
  sagittaire: "Feu",
  taureau: "Terre",
  vierge: "Terre",
  capricorne: "Terre",
  gemeaux: "Air",
  balance: "Air",
  verseau: "Air",
  cancer: "Eau",
  scorpion: "Eau",
  poissons: "Eau",
};

const ELEMENT_LABEL_EN: Record<"Feu" | "Terre" | "Air" | "Eau", string> = {
  Feu: "Fire",
  Terre: "Earth",
  Air: "Air",
  Eau: "Water",
};

function elementInteractionText(decanRuler: DecanRuler, sign: string, locale: "fr" | "en"): string {
  const rulerTemp = DECAN_RULER_TEMPERAMENT[decanRuler];
  const element = SIGN_ELEMENT[sign];
  const elementTemp = ELEMENT_TEMPERAMENT[element];
  const matches = (rulerTemp.heat === elementTemp.heat ? 1 : 0) + (rulerTemp.moisture === elementTemp.moisture ? 1 : 0);
  const elementLabel = locale === "en" ? ELEMENT_LABEL_EN[element] : element;

  if (locale === "en") {
    if (matches === 2) {
      return ` This planet shares the very nature of the sign's element (${elementLabel}): rather than an outside note, it's a concentrated, almost amplified version of what the sign already does naturally.`;
    }
    if (matches === 1) {
      return ` This planet is only half in tune with the sign's element (${elementLabel}): part of this energy flows naturally, the other part asks for some adjustment.`;
    }
    return ` This planet has a nature opposite to the sign's element (${elementLabel}): it brings a real counterpoint here, a nuance that wouldn't have shown up on its own elsewhere in the sign.`;
  }
  if (matches === 2) {
    return ` Cette planète partage la nature même de l'élément du signe (${elementLabel}) : plutôt qu'une note étrangère, c'est une version concentrée, presque amplifiée, de ce que le signe fait déjà naturellement.`;
  }
  if (matches === 1) {
    return ` Cette planète n'est qu'à moitié en phase avec l'élément du signe (${elementLabel}) : une partie de cette énergie coule naturellement, l'autre demande un ajustement.`;
  }
  return ` Cette planète a une nature opposée à celle de l'élément du signe (${elementLabel}) : elle introduit ici un vrai contrepoint, une nuance qui ne serait pas venue spontanément ailleurs dans le signe.`;
}

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

export function computeDegreeReading(longitude: number, locale: "fr" | "en" = "fr"): DegreeReading {
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

  // Décan et phase découpent le signe selon les 3 mêmes tranches de 10° —
  // deux angles de lecture sur le même tiers plutôt que deux systèmes
  // indépendants. Le décan explique pourquoi ce tiers a un chose en plus
  // (l'influence d'une autre planète) ; la phase explique juste où on en
  // est dans la maturité du signe, sans reformuler le calcul en degrés déjà
  // donné juste avant, pour ne pas noyer quelqu'un qui découvre le sujet
  // sous deux blocs de chiffres qui disent la même position.
  const decanText =
    (locale === "en"
      ? `Every 30° sign splits into three 10° slices called decans, each carrying a touch of a different planet. You're in the ${decanNumberLabelEn(decanIndex)} decan (${decanStart}°-${decanStart + 10}°), ${formatDegMin(
          posInDecan
        )} past its start, ${formatDegMin(remainingInDecan)} left before the next one. That adds ${DECAN_RULER_FLAVOR_EN[decanRuler]}`
      : `Chaque signe de 30° se découpe en trois tranches de 10° appelées décans, chacune teintée par l'influence d'une autre planète. Vous êtes dans le ${decanNumberLabel(decanIndex)} décan (${decanStart}°-${decanStart + 10}°), à ${formatDegMin(
          posInDecan
        )} de son début, encore ${formatDegMin(remainingInDecan)} avant le suivant. Cela ajoute ${DECAN_RULER_FLAVOR[decanRuler]}`) + elementInteractionText(decanRuler, sign, locale);

  const phaseText =
    locale === "en"
      ? `That same third of the sign is also its ${phaseLabelEn(phase).toLowerCase()} phase: ${
          phase === "précoce"
            ? "the energy shows up here still raw and spontaneous, the most instinctive, least filtered version of the sign."
            : phase === "tardive"
              ? "the energy here has matured, sometimes already leaning toward the next sign's theme, a more conscious, occasionally more world-weary, version of it."
              : "the energy here is fully settled into its most stable, most typical version of the sign."
        }`
      : `Ce même tiers du signe correspond aussi à sa phase ${phase} : ${
          phase === "précoce"
            ? "l'énergie s'exprime ici de façon encore brute et spontanée, la version la plus instinctive, la moins filtrée du signe."
            : phase === "tardive"
              ? "l'énergie est ici mûrie, parfois déjà tournée vers la thématique du signe suivant, une forme plus consciente, parfois plus lasse, de cette même énergie."
              : "l'énergie est ici pleinement installée, dans sa version la plus stable et la plus typique du signe."
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
      ? locale === "en"
        ? `You're at the very last degree of the sign (29°, ${formatDegMin(remainingInSign)} from the switch to the next one): what tradition calls the "anaretic" degree, a point of maximum tension before the sign changes, often felt as an urgency to "wrap up" what this sign had to teach before moving on, a raw, sometimes rushed, energy.`
        : `Vous êtes au tout dernier degré du signe (29e, à ${formatDegMin(remainingInSign)} du passage au signe suivant) : ce que la tradition appelle le degré "anarétique", point de tension maximale avant le changement de signe, souvent vécu comme une urgence à "boucler" ce que ce signe avait à enseigner avant de passer à autre chose, une énergie à vif, parfois précipitée.`
      : undefined,
    nearestCriticalDegree,
    criticalOrb,
    isCritical,
    criticalText: isCritical
      ? locale === "en"
        ? `You're ${
            criticalOrb <= EXACT_THRESHOLD ? "almost exactly on" : `${formatDegMin(criticalOrb)} from`
          } ${nearestCriticalDegree}°, a marker classical tradition calls a "critical" degree: a point astrologers have long considered charged, where the sign's theme shows up with particular intensity or sharpness.`
        : `Vous êtes ${
            criticalOrb <= EXACT_THRESHOLD ? "quasi exactement sur" : `à ${formatDegMin(criticalOrb)} de`
          } ${nearestCriticalDegree}°, un repère que la tradition classique appelle degré "critique" : un point que les astrologues considèrent de longue date comme chargé, où le thème du signe se manifeste avec une intensité ou une netteté particulière.`
      : undefined,
  };
}

function phaseLabelEn(phase: DegreeReading["phase"]): string {
  return phase === "précoce" ? "Early" : phase === "tardive" ? "Late" : "Middle";
}

function decanNumberLabel(decanIndex: number): string {
  return decanIndex === 0 ? "1er" : `${decanIndex + 1}e`;
}

function decanNumberLabelEn(decanIndex: number): string {
  return decanIndex === 0 ? "1st" : decanIndex === 1 ? "2nd" : "3rd";
}
