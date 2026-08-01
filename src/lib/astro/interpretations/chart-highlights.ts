import type { NatalChart, PointKey } from "../types";
import { computeAspects } from "../aspects";
import { computeBigThree, computeDominance } from "../dominance";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import type { Locale } from "./compose";

const ELEMENT_PUNCHLINE: Record<string, string> = {
  Feu: "Vous carburez à l'instinct : vous agissez avant de trop réfléchir.",
  Terre: "Vous avancez pas à pas, sur du concret plutôt que sur des promesses.",
  Air: "Vous pensez à voix haute : comprendre et échanger, c'est votre moteur.",
  Eau: "Vous sentez avant de comprendre : l'émotion mène, la raison suit.",
};

const ELEMENT_PUNCHLINE_EN: Record<string, string> = {
  Feu: "You run on instinct — you act before overthinking.",
  Terre: "You move step by step, on solid ground rather than promises.",
  Air: "You think out loud — understanding and exchanging is what drives you.",
  Eau: "You feel before you understand — emotion leads, reason follows.",
};

const ASPECT_TAG: Record<string, string> = {
  harmonieux: "votre plus grande facilité intérieure",
  tendu: "votre plus grande tension intérieure — un moteur, pas un défaut",
  neutre: "un point de bascule à observer",
};

const ASPECT_TAG_EN: Record<string, string> = {
  harmonieux: "your greatest inner ease",
  tendu: "your greatest inner tension — a driver, not a flaw",
  neutre: "a pivot point worth watching",
};

/**
 * Trois lignes courtes et percutantes qui donnent le sens du thème d'un
 * coup d'œil (signature Soleil/Lune/Ascendant, dominante, aspect le plus
 * serré) — le "TL;DR" affiché avant les paragraphes détaillés, et réutilisé
 * tel quel sur la carte d'identité partageable.
 */
export function composeChartHighlights(chart: NatalChart, aspectKeys: PointKey[], locale: Locale = "fr"): string[] {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const elementPunchline = locale === "en" ? ELEMENT_PUNCHLINE_EN : ELEMENT_PUNCHLINE;
  const aspectTag = locale === "en" ? ASPECT_TAG_EN : ASPECT_TAG;

  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const dominance = computeDominance(chart.points, chart.hasReliableHouses);
  const aspects = computeAspects(chart.points, aspectKeys);
  const tightest = aspects.find((a) => a.major);

  const lines: string[] = [];

  lines.push(
    locale === "en"
      ? `${planetMap.sun.symbol} ${signMap[big3.sun].name} · ${planetMap.moon.symbol} ${signMap[big3.moon].name}${
          big3.ascendant ? ` · AS ${signMap[big3.ascendant].name}` : ""
        } — your core trio.`
      : `${planetMap.sun.symbol} ${signMap[big3.sun].name} · ${planetMap.moon.symbol} ${signMap[big3.moon].name}${
          big3.ascendant ? ` · AS ${signMap[big3.ascendant].name}` : ""
        } — votre trio de base.`
  );

  const dominantElement = dominance.dominantElements[0];
  if (dominantElement) {
    lines.push(elementPunchline[dominantElement]);
  }

  if (tightest) {
    const tone = aspectMap[tightest.aspect].tone;
    const pa = planetMap[tightest.a];
    const pb = planetMap[tightest.b];
    lines.push(
      `${pa.symbol} ${pa.name} ${aspectMap[tightest.aspect].symbol} ${pb.symbol} ${pb.name} (${Math.abs(tightest.exact).toFixed(1)}°) — ${aspectTag[tone]}.`
    );
  }

  return lines;
}
