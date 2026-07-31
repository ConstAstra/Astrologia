import { ZODIAC_SIGNS } from "../types";
import type { Aspect, AspectKey, HouseCusps, PointKey, ZodiacSign } from "../types";
import type { SynastryAspect } from "../synastry";
import type { TransitAspect } from "../transits";
import { PLANET_META } from "./planets";
import { SIGN_META } from "./signs";
import { HOUSE_META } from "./houses";
import { PLANET_IN_SIGN } from "./planet-in-sign";
import { ASPECT_META } from "./aspects";
import { ASTROCARTO_TEXT, LINE_TYPE_META } from "./astrocartography-content";
import type { LineTypeKey } from "./astrocartography-content";
import {
  NORTH_NODE_HOUSE_MISSION,
  NORTH_NODE_SIGN_MISSION,
  SOUTH_NODE_HOUSE_COMFORT,
  SOUTH_NODE_SIGN_COMFORT,
} from "./lunar-nodes";
import { getPairTheme } from "./pair-themes";
import { computeDegreeReading } from "../degrees";
import { signOf } from "../signs";

const GENERATIONAL_POINTS = new Set<PointKey>(["uranus", "neptune", "pluto"]);

export function describePlanetInSign(point: PointKey, sign: ZodiacSign): string {
  const planet = PLANET_META[point];
  const custom = PLANET_IN_SIGN[point]?.[sign];
  if (custom) return custom;
  const signMeta = SIGN_META[sign];
  const base = `${planet.name} exprime ici ${planet.keyword}, teinté${
    planet.name.endsWith("e") ? "e" : ""
  } par la tonalité ${signMeta.name} (${signMeta.keyword}). ${signMeta.paragraph}`;

  if (GENERATIONAL_POINTS.has(point)) {
    return `${base} ${planet.name} restant des années (voire des décennies) dans le même signe, ce placement marque toute une génération plutôt qu'un trait strictement personnel : ce qui vous est propre se joue surtout dans sa maison et ses aspects, à lire ci-dessous.`;
  }
  return base;
}

/** Lecture du degré exact (décan, phase précoce/médiane/tardive, degré anarétique ou critique). */
export function describeDegree(longitude: number): string {
  const r = computeDegreeReading(longitude);
  const parts = [`À ${r.degreeLabel} du signe.`, r.decanText, r.phaseText];
  if (r.isAnaretic) parts.push(r.anareticText!);
  if (r.isCritical) parts.push(r.criticalText!);
  return parts.join(" ");
}

export function describePlanetInHouse(point: PointKey, houseNumber: number): string {
  const planet = PLANET_META[point];
  const house = HOUSE_META[houseNumber - 1];
  if (!house) return "";
  return `${planet.name} en ${house.name} : cette énergie (${planet.keyword}) s'exprime avant tout à travers ${house.keyword}. ${house.paragraph}`;
}

export function describeAspect(aspect: Aspect | SynastryAspect, context: "natal" | "synastry" | "composite" = "natal"): string {
  const meta = ASPECT_META[aspect.aspect as AspectKey];
  const keyA = "a" in aspect ? aspect.a : aspect.personA;
  const keyB = "b" in aspect ? aspect.b : aspect.personB;
  const nameA = PLANET_META[keyA]?.name ?? keyA;
  const nameB = PLANET_META[keyB]?.name ?? keyB;
  const gap = Math.abs(aspect.exact).toFixed(1);

  const subject =
    context === "synastry"
      ? `Le ${nameA} de la première personne et le ${nameB} de la seconde`
      : context === "composite"
        ? `Le ${nameA} et le ${nameB} du couple`
        : `${nameA} et ${nameB}`;

  const pairTheme = getPairTheme(keyA, keyB);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";

  return `${subject} forment ${meta.name.toLowerCase()} ${meta.symbol} (écart à l'exact : ${gap}°). ${meta.description}${themeSentence}`;
}

/** Aspect entre une planète en transit (aujourd'hui) et un point du thème natal. */
export function describeTransitAspect(aspect: TransitAspect): string {
  const meta = ASPECT_META[aspect.aspect];
  const transitName = PLANET_META[aspect.transitingPlanet].name;
  const natalName = PLANET_META[aspect.natalPoint]?.name ?? aspect.natalPoint;
  const gap = Math.abs(aspect.exact).toFixed(1);
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
export function describeCompositeTransitAspect(aspect: TransitAspect): string {
  const meta = ASPECT_META[aspect.aspect];
  const transitName = PLANET_META[aspect.transitingPlanet].name;
  const compositeName = PLANET_META[aspect.natalPoint]?.name ?? aspect.natalPoint;
  const gap = Math.abs(aspect.exact).toFixed(1);
  const timing = aspect.applying
    ? "L'aspect se resserre : son influence monte en puissance dans les prochains jours pour la relation."
    : "L'aspect se relâche : son influence était plus forte il y a quelques jours et s'estompe désormais.";

  const pairTheme = getPairTheme(aspect.transitingPlanet, aspect.natalPoint);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";

  return `${transitName} en transit forme ${meta.name.toLowerCase()} ${meta.symbol} avec le ${compositeName} du thème composite de votre relation (écart à l'exact : ${gap}°). ${meta.description}${themeSentence} ${timing}`;
}

export function describeAstroCartoLine(planet: PointKey, type: LineTypeKey): string {
  const planetMeta = PLANET_META[planet];
  const lineMeta = LINE_TYPE_META[type];
  const text = ASTROCARTO_TEXT[planet as keyof typeof ASTROCARTO_TEXT]?.[type];
  return `${planetMeta.name} — ${lineMeta.name} : ${text ?? lineMeta.explanation}`;
}

export function describeHouseSystem(houses: HouseCusps): string {
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
export function describeLifeMission(northNodeSign: ZodiacSign, northNodeHouse?: number): LifeMission {
  const southSign = oppositeSign(northNodeSign);
  const southHouse = northNodeHouse ? oppositeHouse(northNodeHouse) : undefined;
  return {
    northSign: northNodeSign,
    southSign,
    northHouse: northNodeHouse,
    southHouse,
    missionSignText: NORTH_NODE_SIGN_MISSION[northNodeSign],
    comfortSignText: SOUTH_NODE_SIGN_COMFORT[southSign],
    missionHouseText: northNodeHouse ? NORTH_NODE_HOUSE_MISSION[northNodeHouse] : undefined,
    comfortHouseText: southHouse ? SOUTH_NODE_HOUSE_COMFORT[southHouse] : undefined,
  };
}
