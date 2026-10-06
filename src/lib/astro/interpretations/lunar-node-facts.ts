import type { Aspect, NatalChart } from "../types";
import { signOf, formatLongitude } from "../signs";
import { SIGN_RULER } from "./rulership";
import { dignitiesOf, dignityLabel } from "./dignities";
import { oppositeSign, oppositeHouse, type Locale } from "./compose";
import { pointDisplayName, formatOrb } from "./chart-facts";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";

export interface LunarNodeAspectFact {
  otherPointName: string;
  aspectName: string;
  orb: string;
  applying: boolean;
  major: boolean;
}

export interface LunarNodeFacts {
  northNode: { signName: string; degree: string; house: number | null };
  southNode: { signName: string; degree: string; house: number | null };
  rulerName: string;
  rulerSignName: string;
  rulerDegree: string;
  rulerHouse: number | null;
  rulerDignityLabel: string | null;
  aspects: LunarNodeAspectFact[];
}

/**
 * Faits exacts de l'axe des Nœuds lunaires (signe, maison, degré du Nœud
 * Nord et du Nœud Sud, maître du Nœud Nord et son placement, aspects reçus
 * par le Nœud Nord avec orbe exact) : la seule matière transmise au LLM pour
 * la synthèse Mission de vie, jamais de texte tout fait. Le Nœud Sud n'est
 * pas un point calculé séparément dans le thème, il est toujours à l'exact
 * opposé du Nœud Nord (signe et maison), comme dans describeLifeMission().
 */
export function buildLunarNodeFacts(chart: NatalChart, aspects: Aspect[], locale: Locale = "fr"): LunarNodeFacts {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;

  const northPoint = chart.points.northNode;
  const northSign = signOf(northPoint.longitude);
  const northHouse = chart.hasReliableHouses ? (northPoint.house ?? null) : null;

  const southSign = oppositeSign(northSign);
  const southHouse = northHouse ? oppositeHouse(northHouse) : null;
  const southLongitude = (northPoint.longitude + 180) % 360;

  const rulerPlanet = SIGN_RULER[northSign];
  const rulerPoint = chart.points[rulerPlanet];
  const rulerSign = signOf(rulerPoint.longitude);
  const rulerHouse = chart.hasReliableHouses ? (rulerPoint.house ?? null) : null;
  const rulerDignities = dignitiesOf(rulerPlanet, rulerSign);

  const nodeAspects: LunarNodeAspectFact[] = aspects
    .filter((a) => a.a === "northNode" || a.b === "northNode")
    .map((a) => {
      const otherKey = a.a === "northNode" ? a.b : a.a;
      return {
        otherPointName: pointDisplayName(otherKey, locale),
        aspectName: aspectMap[a.aspect].name,
        orb: formatOrb(a.exact),
        applying: a.applying,
        major: a.major,
      };
    });

  return {
    northNode: { signName: signMap[northSign].name, degree: formatLongitude(northPoint.longitude), house: northHouse },
    southNode: { signName: signMap[southSign].name, degree: formatLongitude(southLongitude), house: southHouse },
    rulerName: pointDisplayName(rulerPlanet, locale),
    rulerSignName: signMap[rulerSign].name,
    rulerDegree: formatLongitude(rulerPoint.longitude),
    rulerHouse,
    rulerDignityLabel:
      rulerDignities.length > 0 ? rulerDignities.map((d) => dignityLabel(d, locale)).join(locale === "en" ? " and " : " et ") : null,
    aspects: nodeAspects,
  };
}
