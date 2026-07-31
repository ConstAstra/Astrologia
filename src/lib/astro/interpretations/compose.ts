import { ZODIAC_SIGNS } from "../types";
import type { Aspect, AspectKey, HouseCusps, PointKey, ZodiacSign } from "../types";
import type { SynastryAspect } from "../synastry";
import type { TransitAspect } from "../transits";
import type { ActivatedSynastryAspect } from "../synastry-transits";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import { PLANET_IN_SIGN } from "./planet-in-sign";
import { PLANET_IN_SIGN_EN } from "./planet-in-sign.en";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import { ASTROCARTO_TEXT, LINE_TYPE_META } from "./astrocartography-content";
import type { LineTypeKey } from "./astrocartography-content";
import { ASTROCARTO_TEXT_EN, LINE_TYPE_META_EN } from "./astrocartography-content.en";
import {
  NORTH_NODE_HOUSE_MISSION,
  NORTH_NODE_SIGN_MISSION,
  SOUTH_NODE_HOUSE_COMFORT,
  SOUTH_NODE_SIGN_COMFORT,
} from "./lunar-nodes";
import {
  NORTH_NODE_HOUSE_MISSION_EN,
  NORTH_NODE_SIGN_MISSION_EN,
  SOUTH_NODE_HOUSE_COMFORT_EN,
  SOUTH_NODE_SIGN_COMFORT_EN,
} from "./lunar-nodes.en";
import { getPairTheme, isRomanticCodedPair } from "./pair-themes";
import { getPairThemeEn } from "./pair-themes.en";
import { computeDegreeReading } from "../degrees";
import { signOf } from "../signs";
import type { RelationshipType } from "./relationship";

export type Locale = "fr" | "en";

const GENERATIONAL_POINTS = new Set<PointKey>(["uranus", "neptune", "pluto"]);

// Placements dont le texte personnalisé est formulé en langage de couple
// (désir, séduction, attachement amoureux) — Vénus dans son ensemble, plus
// le Mars en Scorpion qui mentionne explicitement l'énergie sexuelle. À
// éviter pour interpréter le thème composite d'une relation non romantique
// (le composite existe aussi pour la famille, l'amitié, le professionnel).
const ROMANTIC_CODED_PLANET_IN_SIGN: Partial<Record<PointKey, true | Set<ZodiacSign>>> = {
  venus: true,
  mars: new Set(["scorpion"]),
};

function isRomanticCodedPlanetInSign(point: PointKey, sign: ZodiacSign): boolean {
  const flagged = ROMANTIC_CODED_PLANET_IN_SIGN[point];
  if (!flagged) return false;
  return flagged === true || flagged.has(sign);
}

export function describePlanetInSign(
  point: PointKey,
  sign: ZodiacSign,
  relationshipType?: RelationshipType,
  locale: Locale = "fr"
): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const customMap = locale === "en" ? PLANET_IN_SIGN_EN : PLANET_IN_SIGN;
  const planet = planetMap[point];
  const suppressRomantic =
    relationshipType !== undefined && relationshipType !== "romantique" && isRomanticCodedPlanetInSign(point, sign);
  const custom = suppressRomantic ? undefined : customMap[point]?.[sign];
  if (custom) return custom;
  const signMeta = signMap[sign];

  if (locale === "en") {
    const base = `${planet.name} expresses here ${planet.keyword}, colored by the ${signMeta.name} tone (${signMeta.keyword}). ${signMeta.paragraph}`;
    if (GENERATIONAL_POINTS.has(point)) {
      return `${base} Since ${planet.name} stays for years (even decades) in the same sign, this placement marks an entire generation rather than a strictly personal trait: what's truly yours plays out mainly through its house and aspects, read below.`;
    }
    return base;
  }

  const base = `${planet.name} exprime ici ${planet.keyword}, teinté${
    planet.name.endsWith("e") ? "e" : ""
  } par la tonalité ${signMeta.name} (${signMeta.keyword}). ${signMeta.paragraph}`;

  if (GENERATIONAL_POINTS.has(point)) {
    return `${base} ${planet.name} restant des années (voire des décennies) dans le même signe, ce placement marque toute une génération plutôt qu'un trait strictement personnel : ce qui vous est propre se joue surtout dans sa maison et ses aspects, à lire ci-dessous.`;
  }
  return base;
}

/** Lecture du degré exact (décan, phase précoce/médiane/tardive, degré anarétique ou critique). */
export function describeDegree(longitude: number, locale: Locale = "fr"): string {
  const r = computeDegreeReading(longitude, locale);
  const parts =
    locale === "en" ? [`${r.degreeLabel} into the sign.`, r.decanText, r.phaseText] : [`À ${r.degreeLabel} du signe.`, r.decanText, r.phaseText];
  if (r.isAnaretic) parts.push(r.anareticText!);
  if (r.isCritical) parts.push(r.criticalText!);
  return parts.join(" ");
}

export function describePlanetInHouse(point: PointKey, houseNumber: number, locale: Locale = "fr"): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const planet = planetMap[point];
  const house = houseList[houseNumber - 1];
  if (!house) return "";
  if (locale === "en") {
    return `${planet.name} in ${house.name}: this energy (${planet.keyword}) expresses itself above all through ${house.keyword}. ${house.paragraph}`;
  }
  return `${planet.name} en ${house.name} : cette énergie (${planet.keyword}) s'exprime avant tout à travers ${house.keyword}. ${house.paragraph}`;
}

export function describeAspect(
  aspect: Aspect | SynastryAspect,
  context: "natal" | "synastry" | "composite" = "natal",
  relationshipType?: RelationshipType,
  locale: Locale = "fr"
): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const meta = aspectMap[aspect.aspect as AspectKey];
  const keyA = "a" in aspect ? aspect.a : aspect.personA;
  const keyB = "b" in aspect ? aspect.b : aspect.personB;
  const nameA = planetMap[keyA]?.name ?? keyA;
  const nameB = planetMap[keyB]?.name ?? keyB;
  const gap = Math.abs(aspect.exact).toFixed(1);

  // Les thèmes de fond formulés en langage de couple (désir, séduction,
  // attachement amoureux) n'ont rien à faire dans une lecture famille,
  // amitié ou professionnelle — on ne les affiche qu'en lecture natale
  // (auto-description) ou en cadrage romantique.
  const suppressRomantic =
    context !== "natal" && relationshipType !== undefined && relationshipType !== "romantique" && isRomanticCodedPair(keyA, keyB);

  if (locale === "en") {
    const subject =
      context === "synastry"
        ? `The first person's ${nameA} and the second person's ${nameB}`
        : context === "composite"
          ? `The composite chart's ${nameA} and ${nameB}`
          : `${nameA} and ${nameB}`;
    const pairTheme = suppressRomantic ? undefined : getPairThemeEn(keyA, keyB);
    const themeSentence = pairTheme ? ` Underlying theme: ${pairTheme}` : "";
    return `${subject} form ${meta.name.toLowerCase()} ${meta.symbol} (gap to exact: ${gap}°). ${meta.description}${themeSentence}`;
  }

  const subject =
    context === "synastry"
      ? `Le ${nameA} de la première personne et le ${nameB} de la seconde`
      : context === "composite"
        ? `Le ${nameA} et le ${nameB} du thème composite`
        : `${nameA} et ${nameB}`;

  const pairTheme = suppressRomantic ? undefined : getPairTheme(keyA, keyB);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";

  return `${subject} forment ${meta.name.toLowerCase()} ${meta.symbol} (écart à l'exact : ${gap}°). ${meta.description}${themeSentence}`;
}

/** Aspect entre une planète en transit (aujourd'hui) et un point du thème natal. */
export function describeTransitAspect(aspect: TransitAspect, locale: Locale = "fr"): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const meta = aspectMap[aspect.aspect];
  const transitName = planetMap[aspect.transitingPlanet].name;
  const natalName = planetMap[aspect.natalPoint]?.name ?? aspect.natalPoint;
  const gap = Math.abs(aspect.exact).toFixed(1);

  if (locale === "en") {
    const timing = aspect.applying
      ? "The aspect is tightening: its influence is building over the coming days."
      : "The aspect is loosening: its influence was stronger a few days ago and is now fading.";
    const pairTheme = getPairThemeEn(aspect.transitingPlanet, aspect.natalPoint);
    const themeSentence = pairTheme ? ` Underlying theme: ${pairTheme}` : "";
    return `Transiting ${transitName} forms ${meta.name.toLowerCase()} ${meta.symbol} with your natal ${natalName} (orb: ${gap}°). ${meta.description}${themeSentence} ${timing}`;
  }

  const timing = aspect.applying
    ? "L'aspect se resserre : son influence monte en puissance dans les prochains jours."
    : "L'aspect se relâche : son influence était plus forte il y a quelques jours et s'estompe désormais.";

  const pairTheme = getPairTheme(aspect.transitingPlanet, aspect.natalPoint);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";

  return `${transitName} en transit forme ${meta.name.toLowerCase()} ${meta.symbol} avec votre ${natalName} natal${
    natalName.endsWith("e") ? "e" : ""
  } (écart à l'exact : ${gap}°). ${meta.description}${themeSentence} ${timing}`;
}

/** Aspect entre une planète en transit (aujourd'hui) et un point du thème composite d'un couple. */
export function describeCompositeTransitAspect(aspect: TransitAspect, locale: Locale = "fr"): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const meta = aspectMap[aspect.aspect];
  const transitName = planetMap[aspect.transitingPlanet].name;
  const compositeName = planetMap[aspect.natalPoint]?.name ?? aspect.natalPoint;
  const gap = Math.abs(aspect.exact).toFixed(1);

  // Le thème composite existe pour tout type de relation (famille, amitié,
  // pro, pas seulement les couples) et cette fonction n'a pas connaissance
  // du cadrage choisi : on écarte par prudence les thèmes de fond formulés
  // en langage de couple plutôt que de risquer d'en afficher un à tort.
  const suppressRomantic = isRomanticCodedPair(aspect.transitingPlanet, aspect.natalPoint);

  if (locale === "en") {
    const timing = aspect.applying
      ? "The aspect is tightening: its influence is building over the coming days for the relationship."
      : "The aspect is loosening: its influence was stronger a few days ago and is now fading.";
    const pairTheme = suppressRomantic ? undefined : getPairThemeEn(aspect.transitingPlanet, aspect.natalPoint);
    const themeSentence = pairTheme ? ` Underlying theme: ${pairTheme}` : "";
    return `Transiting ${transitName} forms ${meta.name.toLowerCase()} ${meta.symbol} with the ${compositeName} of your relationship's composite chart (orb: ${gap}°). ${meta.description}${themeSentence} ${timing}`;
  }

  const timing = aspect.applying
    ? "L'aspect se resserre : son influence monte en puissance dans les prochains jours pour la relation."
    : "L'aspect se relâche : son influence était plus forte il y a quelques jours et s'estompe désormais.";
  const pairTheme = suppressRomantic ? undefined : getPairTheme(aspect.transitingPlanet, aspect.natalPoint);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";

  return `${transitName} en transit forme ${meta.name.toLowerCase()} ${meta.symbol} avec le ${compositeName} du thème composite de votre relation (écart à l'exact : ${gap}°). ${meta.description}${themeSentence} ${timing}`;
}

/** Aspect de synastrie réactivé aujourd'hui par un transit sur le point natal de l'un des deux partenaires. */
export function describeActivatedSynastryAspect(
  activated: ActivatedSynastryAspect,
  labelA: string,
  labelB: string,
  locale: Locale = "fr"
): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const { synastryAspect, transit, side } = activated;
  const personLabel = side === "A" ? labelA : labelB;
  const partnerLabel = side === "A" ? labelB : labelA;
  const personPoint = side === "A" ? synastryAspect.personA : synastryAspect.personB;
  const partnerPoint = side === "A" ? synastryAspect.personB : synastryAspect.personA;
  const personName = planetMap[personPoint]?.name ?? personPoint;
  const partnerName = planetMap[partnerPoint]?.name ?? partnerPoint;

  const synMeta = aspectMap[synastryAspect.aspect];
  const transitMeta = aspectMap[transit.aspect];
  const transitPlanetName = planetMap[transit.transitingPlanet].name;
  const gap = Math.abs(transit.exact).toFixed(1);

  // Même prudence que pour le composite : cette fonction ne sait pas si le
  // lien est romantique, familial, amical ou professionnel.
  const suppressRomantic = isRomanticCodedPair(personPoint, partnerPoint);

  if (locale === "en") {
    const pairTheme = suppressRomantic ? undefined : getPairThemeEn(personPoint, partnerPoint);
    const themeSentence = pairTheme ? ` Underlying theme of the bond: ${pairTheme}` : "";
    return `Your ${synMeta.name.toLowerCase()} ${synMeta.symbol} between ${personLabel}'s ${personName} and ${partnerLabel}'s ${partnerName} is reactivated today: transiting ${transitPlanetName} forms ${transitMeta.name.toLowerCase()} with ${personLabel}'s ${personName} (orb: ${gap}°).${themeSentence} This is the moment when this dynamic between you two is most likely to manifest concretely.`;
  }

  const pairTheme = suppressRomantic ? undefined : getPairTheme(personPoint, partnerPoint);
  const themeSentence = pairTheme ? ` Thème de fond du lien : ${pairTheme}` : "";

  return `Votre ${synMeta.name.toLowerCase()} ${synMeta.symbol} entre le ${personName} de ${personLabel} et le ${partnerName} de ${partnerLabel} est réactivé aujourd'hui : ${transitPlanetName} en transit forme ${transitMeta.name.toLowerCase()} avec le ${personName} de ${personLabel} (écart à l'exact : ${gap}°).${themeSentence} C'est le moment où cette dynamique entre vous deux a le plus de chances de se manifester concrètement.`;
}

export function describeAstroCartoLine(planet: PointKey, type: LineTypeKey, locale: Locale = "fr"): string {
  const planetMeta = (locale === "en" ? PLANET_META_EN : PLANET_META)[planet];
  const lineMetaMap = locale === "en" ? LINE_TYPE_META_EN : LINE_TYPE_META;
  const textMap = locale === "en" ? ASTROCARTO_TEXT_EN : ASTROCARTO_TEXT;
  const lineMeta = lineMetaMap[type];
  const text = textMap[planet as keyof typeof textMap]?.[type];
  return locale === "en"
    ? `${planetMeta.name} — ${lineMeta.name}: ${text ?? lineMeta.explanation}`
    : `${planetMeta.name} — ${lineMeta.name} : ${text ?? lineMeta.explanation}`;
}

export function describeHouseSystem(houses: HouseCusps, locale: Locale = "fr"): string {
  if (locale === "en") {
    const labelsEn: Record<string, string> = {
      "whole-sign": "whole sign",
      equal: "equal houses",
      porphyry: "Porphyry",
      placidus: "Placidus",
    };
    const labelEn = labelsEn[houses.system] ?? houses.system;
    if (houses.fellBackToWholeSign) {
      return `The Placidus system can't be calculated at this latitude (too close to the polar circle): the chart automatically falls back to whole sign houses, a traditional system that's always defined, to stay reliable rather than showing a false precision.`;
    }
    return `House system used: ${labelEn}.`;
  }

  const labels: Record<string, string> = {
    "whole-sign": "signes entiers",
    equal: "maisons égales",
    porphyry: "Porphyre",
    placidus: "Placidus",
  };
  const label = labels[houses.system] ?? houses.system;
  if (houses.fellBackToWholeSign) {
    return `Le système Placidus n'est pas calculable à cette latitude (trop proche du cercle polaire) : le thème utilise automatiquement les signes entiers, un système traditionnel et toujours défini, pour rester fiable plutôt que d'afficher une fausse précision.`;
  }
  return `Système de maisons utilisé : ${label}.`;
}

export function signOfPoint(longitude: number) {
  return signOf(longitude);
}

function oppositeSign(sign: ZodiacSign): ZodiacSign {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return ZODIAC_SIGNS[(idx + 6) % 12];
}

function oppositeHouse(house: number): number {
  return ((house + 5) % 12) + 1;
}

export interface LifeMission {
  northSign: ZodiacSign;
  southSign: ZodiacSign;
  northHouse?: number;
  southHouse?: number;
  missionSignText: string;
  comfortSignText: string;
  missionHouseText?: string;
  comfortHouseText?: string;
}

/**
 * "Mission de vie" lue sur l'axe des Nœuds lunaires : le Nœud Nord comme
 * direction d'évolution à apprivoiser, le Nœud Sud (toujours au signe et à
 * la maison opposés) comme terrain acquis à ne pas surinvestir. Voir
 * `lunar-nodes.ts` pour le détail de chaque texte.
 */
export function describeLifeMission(northNodeSign: ZodiacSign, northNodeHouse?: number, locale: Locale = "fr"): LifeMission {
  const southSign = oppositeSign(northNodeSign);
  const southHouse = northNodeHouse ? oppositeHouse(northNodeHouse) : undefined;
  const missionSign = locale === "en" ? NORTH_NODE_SIGN_MISSION_EN : NORTH_NODE_SIGN_MISSION;
  const comfortSign = locale === "en" ? SOUTH_NODE_SIGN_COMFORT_EN : SOUTH_NODE_SIGN_COMFORT;
  const missionHouse = locale === "en" ? NORTH_NODE_HOUSE_MISSION_EN : NORTH_NODE_HOUSE_MISSION;
  const comfortHouse = locale === "en" ? SOUTH_NODE_HOUSE_COMFORT_EN : SOUTH_NODE_HOUSE_COMFORT;
  return {
    northSign: northNodeSign,
    southSign,
    northHouse: northNodeHouse,
    southHouse,
    missionSignText: missionSign[northNodeSign],
    comfortSignText: comfortSign[southSign],
    missionHouseText: northNodeHouse ? missionHouse[northNodeHouse] : undefined,
    comfortHouseText: southHouse ? comfortHouse[southHouse] : undefined,
  };
}
