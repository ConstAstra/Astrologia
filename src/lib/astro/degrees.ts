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

// Formulées comme un complément à "touche" (nom féminin) plutôt qu'à la
// personne elle-même : ça affirme clairement l'impact sur la personnalité
// ("plus directe, plus impatiente...") sans avoir à gérer l'accord de genre
// de la personne qui lit, jamais connu par l'app.
const DECAN_RULER_FLAVOR: Record<DecanRuler, string> = {
  Mars: "une touche Mars à votre personnalité : plus directe, plus impatiente, plus tournée vers l'action immédiate que le reste du signe ne le laisse deviner.",
  Soleil: "une touche Soleil à votre personnalité : plus affirmée, plus centrée sur le besoin de reconnaissance et sur l'expression consciente de qui vous êtes.",
  Vénus: "une touche Vénus à votre personnalité : plus douce, plus sensible à l'harmonie, aux relations et au plaisir esthétique.",
  Mercure: "une touche Mercure à votre personnalité : plus mentale, plus curieuse, plus attentive au détail et à la communication.",
  Lune: "une touche Lune à votre personnalité : plus instinctive, plus sensible, plus dépendante de l'humeur et du besoin de sécurité affective.",
  Saturne: "une touche Saturne à votre personnalité : plus sérieuse, plus structurée, plus concernée par la durée et la responsabilité.",
  Jupiter: "une touche Jupiter à votre personnalité : plus ample dans ses vues, plus optimiste, plus tournée vers l'expansion et la confiance.",
};

const DECAN_RULER_FLAVOR_EN: Record<DecanRuler, string> = {
  Mars: "a Mars touch to your personality: more direct, more impatient, more focused on immediate action than the rest of the sign would suggest.",
  Soleil: "a Sun touch to your personality: more assertive, more centered on the need for recognition and on consciously expressing who you are.",
  Vénus: "a Venus touch to your personality: gentler, more attuned to harmony, relationships, and aesthetic pleasure.",
  Mercure: "a Mercury touch to your personality: more mental, more curious, more attentive to detail and communication.",
  Lune: "a Moon touch to your personality: more instinctive, more sensitive, more dependent on mood and the need for emotional security.",
  Saturne: "a Saturn touch to your personality: more serious, more structured, more concerned with staying power and responsibility.",
  Jupiter: "a Jupiter touch to your personality: broader in outlook, more optimistic, more focused on expansion and confidence.",
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

  // Un seul paragraphe plutôt que deux : le "décan" et la "phase" classiques
  // découpent le signe selon les 3 mêmes tranches de 10°, donc les présenter
  // comme deux blocs séparés répète en substance la même position en deux
  // vocabulaires différents. Ici, la maturité de l'énergie (brute, stable,
  // mûrie) sert d'accroche en langage courant, et le nom technique "décan"
  // n'arrive qu'ensuite, avec sa propre définition entre parenthèses plutôt
  // que supposée connue.
  const maturityText =
    locale === "en"
      ? phase === "précoce"
        ? "this portion of the sign pushes you to express a still-raw, spontaneous version of it, the most instinctive, least filtered one there is"
        : phase === "tardive"
          ? "this portion of the sign pushes you to express a matured version of it, sometimes already leaning toward the next sign's theme, a more conscious, occasionally more world-weary form of that same energy"
          : "this portion of the sign pushes you to express its most stable, most typical version, fully settled into its usual way of working"
      : phase === "précoce"
        ? "cette portion du signe vous pousse à en exprimer une version encore brute et spontanée, la plus instinctive, la moins filtrée qui soit"
        : phase === "tardive"
          ? "cette portion du signe vous pousse à en exprimer une version mûrie, parfois déjà tournée vers la thématique du signe suivant, une forme plus consciente, parfois plus lasse, de cette même énergie"
          : "cette portion du signe vous pousse à en exprimer la version la plus stable et la plus typique, pleinement installée dans son fonctionnement habituel";

  const decanText =
    locale === "en"
      ? `You're in the ${decanNumberLabelEn(decanIndex)} third of this sign (${decanStart}°-${decanStart + 10}°): ${maturityText}. Classical astrology also calls this third a "decan", and this one adds ${DECAN_RULER_FLAVOR_EN[decanRuler]}`
      : `Vous êtes dans le ${decanNumberLabel(decanIndex)} tiers de ce signe (${decanStart}°-${decanStart + 10}°) : ${maturityText}. Ce tiers est aussi appelé "décan" en astrologie classique, et il ajoute ${DECAN_RULER_FLAVOR[decanRuler]}`;

  return {
    exactDegreeInSign: exact,
    degreeLabel: formatDegMin(exact),
    decanNumber: (decanIndex + 1) as 1 | 2 | 3,
    decanRuler,
    decanText,
    phase,
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

function decanNumberLabel(decanIndex: number): string {
  return decanIndex === 0 ? "premier" : decanIndex === 1 ? "deuxième" : "troisième";
}

function decanNumberLabelEn(decanIndex: number): string {
  return decanIndex === 0 ? "first" : decanIndex === 1 ? "second" : "third";
}
