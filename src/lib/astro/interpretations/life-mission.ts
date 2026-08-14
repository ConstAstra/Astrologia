import type { Aspect, NatalChart, PlanetKey, PointKey, ZodiacSign } from "../types";
import { signOf } from "../signs";
import { SIGN_RULER } from "./rulership";
import {
  describeAspect,
  describePlanetInHouse,
  describePlanetInSign,
  oppositeHouse,
  oppositeSign,
  type Locale,
} from "./compose";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
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

export interface LifeMissionAspect {
  aspect: Aspect;
  otherPoint: PointKey;
  text: string;
}

export interface LifeMission {
  northSign: ZodiacSign;
  southSign: ZodiacSign;
  northHouse?: number;
  southHouse?: number;
  /** Résumé gratuit : la seule direction d'évolution (Nœud Nord en signe), sans le reste. */
  missionSignText: string;
  // Le reste ci-dessous compose le développement réservé au Premium.
  comfortSignText: string;
  missionHouseText?: string;
  comfortHouseText?: string;
  rulerPlanet: PlanetKey;
  rulerIntro: string;
  rulerSignText: string;
  rulerHouseText?: string;
  nodeAspects: LifeMissionAspect[];
  synthesis: string;
}

function rulerIntroText(rulerName: string, rulerSymbol: string, northSignName: string, locale: Locale): string {
  return locale === "en"
    ? `Your North Node sits in ${northSignName}, traditionally ruled by ${rulerName} ${rulerSymbol}. In astrology, this "dispositor" acts as a practical guide: its own sign and house show HOW to actually move toward this direction, not just where it points.`
    : `Ton Nœud Nord est en ${northSignName}, traditionnellement gouverné par ${rulerName} ${rulerSymbol}. En astrologie, cette planète "maîtresse" agit comme un guide concret : son propre signe et sa maison indiquent COMMENT avancer réellement vers cette direction, pas seulement vers où.`;
}

function synthesisText(
  northSignName: string,
  rulerName: string,
  houseKeyword: string | undefined,
  locale: Locale
): string {
  if (locale === "en") {
    return houseKeyword
      ? `In practice, this North Node in ${northSignName} plays out most concretely around ${houseKeyword}: that is where the discomfort is felt first, and where ${rulerName} shows the way to advance step by step rather than all at once.`
      : `In practice, this North Node in ${northSignName} is a direction to grow into gradually: ${rulerName}, its dispositor, shows the way to advance step by step rather than all at once.`;
  }
  return houseKeyword
    ? `En pratique, ce Nœud Nord en ${northSignName} se joue le plus concrètement autour de ${houseKeyword} : c'est là que l'inconfort se fait sentir en premier, et c'est ${rulerName} qui indique comment avancer pas à pas plutôt que d'un bond.`
    : `En pratique, ce Nœud Nord en ${northSignName} est une direction à apprivoiser progressivement : ${rulerName}, son maître, indique comment avancer pas à pas plutôt que d'un bond.`;
}

/**
 * "Mission de vie" lue sur l'axe des Nœuds lunaires : le Nœud Nord comme
 * direction d'évolution à apprivoiser, le Nœud Sud (toujours au signe et à
 * la maison opposés) comme terrain acquis à ne pas surinvestir. Au-delà du
 * signe/maison des deux nœuds (voir `lunar-nodes.ts`), le développement
 * ajoute deux techniques classiques d'analyse plus fine : le maître
 * ("dispositeur") du Nœud Nord — la planète qui gouverne son signe indique
 * concrètement comment avancer — et les aspects que reçoit le Nœud Nord
 * dans le thème, qui soutiennent ou compliquent cette trajectoire.
 */
export function describeLifeMission(chart: NatalChart, aspects: Aspect[], locale: Locale = "fr"): LifeMission {
  const northNode = chart.points.northNode;
  const northNodeSign = signOf(northNode.longitude);
  const northNodeHouse = chart.hasReliableHouses ? northNode.house : undefined;

  const southSign = oppositeSign(northNodeSign);
  const southHouse = northNodeHouse ? oppositeHouse(northNodeHouse) : undefined;

  const missionSign = locale === "en" ? NORTH_NODE_SIGN_MISSION_EN : NORTH_NODE_SIGN_MISSION;
  const comfortSign = locale === "en" ? SOUTH_NODE_SIGN_COMFORT_EN : SOUTH_NODE_SIGN_COMFORT;
  const missionHouse = locale === "en" ? NORTH_NODE_HOUSE_MISSION_EN : NORTH_NODE_HOUSE_MISSION;
  const comfortHouse = locale === "en" ? SOUTH_NODE_HOUSE_COMFORT_EN : SOUTH_NODE_HOUSE_COMFORT;

  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;

  const rulerPlanet = SIGN_RULER[northNodeSign];
  const rulerPoint = chart.points[rulerPlanet];
  const rulerSign = signOf(rulerPoint.longitude);
  const rulerHouse = chart.hasReliableHouses ? rulerPoint.house : undefined;

  const nodeAspects: LifeMissionAspect[] = aspects
    .filter((a) => a.a === "northNode" || a.b === "northNode")
    .map((a) => ({
      aspect: a,
      otherPoint: a.a === "northNode" ? a.b : a.a,
      text: describeAspect(a, "natal", undefined, locale),
    }));

  const houseKeyword = northNodeHouse ? houseList[northNodeHouse - 1]?.keyword : undefined;

  return {
    northSign: northNodeSign,
    southSign,
    northHouse: northNodeHouse,
    southHouse,
    missionSignText: missionSign[northNodeSign],
    comfortSignText: comfortSign[southSign],
    missionHouseText: northNodeHouse ? missionHouse[northNodeHouse] : undefined,
    comfortHouseText: southHouse ? comfortHouse[southHouse] : undefined,
    rulerPlanet,
    rulerIntro: rulerIntroText(planetMap[rulerPlanet].name, planetMap[rulerPlanet].symbol, signMap[northNodeSign].name, locale),
    rulerSignText: describePlanetInSign(rulerPlanet, rulerSign, undefined, locale),
    rulerHouseText: rulerHouse ? describePlanetInHouse(rulerPlanet, rulerHouse, locale) : undefined,
    nodeAspects,
    synthesis: synthesisText(signMap[northNodeSign].name, planetMap[rulerPlanet].name, houseKeyword, locale),
  };
}
