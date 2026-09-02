import { ZODIAC_SIGNS } from "../types";
import type { PlanetKey, PointKey, ZodiacSign } from "../types";
import { normalizeDegrees } from "../ephemeris";
import { computeTransitingPositions } from "../transits";
import { computeAspects } from "../aspects";
import { computeMoonPhase } from "../moonphase";
import { describeAspect, type Locale } from "./compose";
import { ASPECT_META } from "./aspects";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { MOON_PHASE_TEXT } from "./moonphase-content";
import { MOON_PHASE_TEXT_EN, MOON_PHASE_LABEL_EN } from "./moonphase-content.en";

// Technique du "thème solaire" (aussi appelé thème par signe) : la méthode
// classique derrière tout horoscope par signe grand public, en astrologie
// occidentale comme dans la presse depuis des décennies. On pose le signe
// lui-même comme Maison I (comme un Ascendant symbolique à 0°), puis on lit
// en maisons entières (whole sign) où tombent aujourd'hui les planètes en
// transit. Contrairement au thème natal, ça ne prétend jamais remplacer une
// vraie heure de naissance — voir `precisionNote` dans le retour, qui le
// rappelle explicitement à chaque lecture.
const FEATURED_PLANETS: PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter"];
const MUNDANE_ASPECT_KEYS: PointKey[] = ["sun", "moon", "mercury", "venus", "mars"];

export interface SignHousePlacement {
  planet: PlanetKey;
  house: number;
  houseName: string;
  houseKeyword: string;
}

export interface SignHoroscope {
  sign: ZodiacSign;
  date: Date;
  headline: string;
  /** Phrase courte et citable (pensée pour être partagée telle quelle), dérivée de la même donnée réelle que `headline` — jamais un texte séparé inventé. */
  punchline: string;
  moonPhaseLine: string;
  housePlacements: SignHousePlacement[];
  skyAspectText: string | null;
  precisionNote: string;
}

// Une phrase courte par maison (indexée maison I = 0), pensée pour être
// citable telle quelle plutôt que descriptive — la version "screenshot" du
// thème de la maison, complémentaire des textes plus longs de houses.ts.
const PUNCHLINE_PHRASE: Record<Locale, string[]> = {
  fr: [
    "un jour pour s'affirmer",
    "un jour pour compter ce qui compte vraiment",
    "un jour pour dire les choses clairement",
    "un jour pour rentrer à la maison, au sens propre ou figuré",
    "un jour pour créer plutôt qu'attendre",
    "un jour pour mettre de l'ordre",
    "un jour pour se tourner vers l'autre",
    "un jour pour lâcher ce qui doit l'être",
    "un jour pour voir plus loin que d'habitude",
    "un jour pour viser haut",
    "un jour pour compter sur les autres",
    "un jour pour se retirer un peu",
  ],
  en: [
    "a day to show up as yourself",
    "a day to take stock of what actually matters",
    "a day to say what needs saying",
    "a day to go home, literally or not",
    "a day to create rather than wait",
    "a day to get things in order",
    "a day to turn toward someone else",
    "a day to let go of what needs letting go",
    "a day to see further than usual",
    "a day to aim high",
    "a day to lean on others",
    "a day to pull back a little",
  ],
};

const PUNCHLINE_TONE_SUFFIX: Record<Locale, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  fr: {
    harmonieux: ", le terrain est porteur.",
    tendu: ", pas sans un peu de friction.",
    neutre: ".",
  },
  en: {
    harmonieux: ", the ground is favorable.",
    tendu: ", not without a little friction.",
    neutre: ".",
  },
};

function wholeSignHouse(anchorSignIndex: number, longitude: number): number {
  const planetSignIndex = Math.floor(normalizeDegrees(longitude) / 30);
  return ((planetSignIndex - anchorSignIndex + 12) % 12) + 1;
}

const PRECISION_NOTE: Record<Locale, string> = {
  fr: "Cette lecture se base sur votre signe solaire seul (méthode des maisons entières depuis ce signe) : la même pour tout le monde né sous ce signe. Avec votre heure et lieu de naissance exacts, votre thème natal personnel affine considérablement cette image.",
  en: "This reading is based on your sun sign alone (whole-sign houses from that sign): the same for everyone born under it. With your exact birth time and place, your personal natal chart refines this picture considerably.",
};

export function composeSignHoroscope(sign: ZodiacSign, date: Date = new Date(), locale: Locale = "fr"): SignHoroscope {
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const moonTextMap = locale === "en" ? MOON_PHASE_TEXT_EN : MOON_PHASE_TEXT;

  const anchorIndex = ZODIAC_SIGNS.indexOf(sign);
  const transiting = computeTransitingPositions(date);
  const moon = computeMoonPhase(date);
  const signMeta = signMap[sign];

  const housePlacements: SignHousePlacement[] = FEATURED_PLANETS.map((planet) => {
    const house = wholeSignHouse(anchorIndex, transiting[planet].longitude);
    const houseMeta = houseList[house - 1];
    return { planet, house, houseName: houseMeta.name, houseKeyword: houseMeta.keyword };
  });

  // Aspects "mondains" : entre planètes en transit elles-mêmes, sans thème
  // natal — le même ciel pour tout le monde aujourd'hui, mais présenté sous
  // l'angle de ce signe. describeAspect() accepte n'importe quel Aspect
  // {a, b, aspect, exact...}, ici construit à partir des positions en
  // transit plutôt que d'un vrai thème.
  const mundaneAspects = computeAspects(transiting, MUNDANE_ASPECT_KEYS, { includeMinor: false });
  const featuredAspect = mundaneAspects.find((a) => a.major) ?? null;
  const skyAspectText = featuredAspect ? describeAspect(featuredAspect, "natal", undefined, locale) : null;

  const moonLabel = locale === "en" ? MOON_PHASE_LABEL_EN[moon.name] : moon.name;
  const moonPhaseLine =
    locale === "en"
      ? `${moonLabel} (${Math.round(moon.illuminatedFraction * 100)}% illuminated): ${moonTextMap[moon.name]}`
      : `${moonLabel} (${Math.round(moon.illuminatedFraction * 100)}% illuminée) : ${moonTextMap[moon.name]}`;

  const featuredHouse = housePlacements.find((p) => p.planet === "sun") ?? housePlacements[0];
  const headline =
    locale === "en"
      ? `${signMeta.name} ${signMeta.symbol}: today's focus falls on ${featuredHouse.houseName.replace(/^House [IVX]+: /, "")}`
      : `${signMeta.name} ${signMeta.symbol} : le foyer du jour tombe en ${featuredHouse.houseName.replace(/^Maison [IVX]+ : /, "")}`;

  const toneKey = featuredAspect ? ASPECT_META[featuredAspect.aspect].tone : "neutre";
  const punchline = `${signMeta.symbol} ${signMeta.name} : ${PUNCHLINE_PHRASE[locale][featuredHouse.house - 1]}${PUNCHLINE_TONE_SUFFIX[locale][toneKey]}`;

  return {
    sign,
    date,
    headline,
    punchline,
    moonPhaseLine,
    housePlacements,
    skyAspectText,
    precisionNote: PRECISION_NOTE[locale],
  };
}
