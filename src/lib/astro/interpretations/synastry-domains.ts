import type { NatalChart, PointKey, ZodiacSign } from "../types";
import type { SynastryResult } from "../synastry";
import { signOf } from "../signs";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { describeHouseOverlay, describePlanetInSign, type Locale } from "./compose";
import { type ChartDomains, elementNuance, dedupeChartDomains } from "./chart-domains";

function sn(sign: ZodiacSign, locale: Locale) {
  const m = locale === "en" ? SIGN_META_EN : SIGN_META;
  return m[sign].name;
}
function sk(sign: ZodiacSign, locale: Locale) {
  const m = locale === "en" ? SIGN_META_EN : SIGN_META;
  return m[sign].keyword;
}

function personSign(chart: NatalChart, key: PointKey): ZodiacSign | null {
  const p = chart.points[key];
  return p ? signOf(p.longitude) : null;
}

function generalChapter(
  labelA: string,
  labelB: string,
  sunA: ZodiacSign,
  sunB: ZodiacSign,
  moonA: ZodiacSign,
  moonB: ZodiacSign,
  locale: Locale
): string {
  if (locale === "en") {
    return `${labelA}'s Sun in ${sn(sunA, locale)} (${sk(sunA, locale)}) meets ${labelB}'s Sun in ${sn(sunB, locale)} (${sk(sunB, locale)}), two identities that don't merge into one, they stay two people standing side by side. Underneath, ${labelA}'s Moon in ${sn(moonA, locale)} and ${labelB}'s Moon in ${sn(moonB, locale)} decide how each of you actually feels safe, often the real engine of a bond long after the initial spark fades.`;
  }
  return `Le Soleil de ${labelA} en ${sn(sunA, locale)} (${sk(sunA, locale)}) rencontre le Soleil de ${labelB} en ${sn(sunB, locale)} (${sk(sunB, locale)}), deux identités qui ne fusionnent pas en une seule, elles restent deux personnes côte à côte. En dessous, la Lune de ${labelA} en ${sn(moonA, locale)} et la Lune de ${labelB} en ${sn(moonB, locale)} décident de ce qui rassure vraiment chacun·e, souvent le vrai moteur d'un lien longtemps après que l'étincelle initiale s'est estompée.`;
}

/**
 * Recouvrements de maisons ciblés, décrits en profondeur via
 * describeHouseOverlay (déjà écrit, planète par planète, réutilisé aussi
 * dans la section "Planètes de X dans les maisons de Y" plus bas sur la
 * page) plutôt qu'une simple liste de noms de planètes.
 */
function overlayTexts(
  synastry: SynastryResult,
  labelA: string,
  labelB: string,
  targetHouses: number[],
  bothHouses: boolean,
  locale: Locale
): string[] {
  if (!bothHouses) return [];
  const bInA = synastry.bPlanetsInAHouses
    .filter((o) => targetHouses.includes(o.house))
    .map((o) => describeHouseOverlay(o.point, o.house, labelB, labelA, locale));
  const aInB = synastry.aPlanetsInBHouses
    .filter((o) => targetHouses.includes(o.house))
    .map((o) => describeHouseOverlay(o.point, o.house, labelA, labelB, locale));
  return [...bInA, ...aInB];
}

function loveChapter(
  labelA: string,
  labelB: string,
  venusA: ZodiacSign | null,
  venusB: ZodiacSign | null,
  marsA: ZodiacSign | null,
  marsB: ZodiacSign | null,
  overlays: string[],
  locale: Locale
): string {
  const nuance = venusA && marsB ? elementNuance(venusA, marsB, locale === "en" ? `What ${labelA} is drawn to` : `Ce à quoi ${labelA} est attiré·e`, locale === "en" ? `how ${labelB} actually pursues` : `la façon dont ${labelB} poursuit réellement`, locale) : "";
  if (overlays.length > 0) {
    const intro =
      locale === "en"
        ? `The couple's own houses, pleasure and partnership, are directly activated between you:`
        : `Les maisons propres au couple, plaisir et partenariat, sont directement activées entre vous :`;
    return `${intro} ${overlays.join(" ")}${nuance ? ` ${nuance}` : ""}`;
  }
  const venusText = venusA && venusB ? `${describePlanetInSign("venus", venusA, undefined, locale)} ${describePlanetInSign("venus", venusB, undefined, locale)}` : "";
  const marsText = marsA && marsB ? `${describePlanetInSign("mars", marsA, undefined, locale)} ${describePlanetInSign("mars", marsB, undefined, locale)}` : "";
  return `${venusText}${marsText ? ` ${marsText}` : ""}${nuance ? ` ${nuance}` : ""}`;
}

function moneyChapter(
  labelA: string,
  labelB: string,
  jupiterA: ZodiacSign | null,
  jupiterB: ZodiacSign | null,
  saturnA: ZodiacSign | null,
  saturnB: ZodiacSign | null,
  overlays: string[],
  locale: Locale
): string {
  const nuance = jupiterA && saturnB ? elementNuance(jupiterA, saturnB, locale === "en" ? `${labelA}'s instinct to expand` : `L'instinct d'expansion de ${labelA}`, locale === "en" ? `${labelB}'s instinct to consolidate` : `l'instinct de consolidation de ${labelB}`, locale) : "";
  if (overlays.length > 0) {
    const intro =
      locale === "en"
        ? `Resources and shared money, this bond's 2nd and 8th houses, are directly activated between you:`
        : `Les ressources et l'argent partagé, les maisons II et VIII de ce lien, sont directement activés entre vous :`;
    return `${intro} ${overlays.join(" ")}${nuance ? ` ${nuance}` : ""}`;
  }
  const jupiterText = jupiterA && jupiterB ? `${describePlanetInSign("jupiter", jupiterA, undefined, locale)} ${describePlanetInSign("jupiter", jupiterB, undefined, locale)}` : "";
  const saturnText = saturnA && saturnB ? `${describePlanetInSign("saturn", saturnA, undefined, locale)} ${describePlanetInSign("saturn", saturnB, undefined, locale)}` : "";
  return `${jupiterText}${saturnText ? ` ${saturnText}` : ""}${nuance ? ` ${nuance}` : ""}`;
}

function careerChapter(
  labelA: string,
  labelB: string,
  sunA: ZodiacSign,
  sunB: ZodiacSign,
  overlays: string[],
  locale: Locale
): string {
  const nuance = elementNuance(sunA, sunB, locale === "en" ? `What ${labelA} is trying to prove` : `Ce que ${labelA} essaie de prouver`, locale === "en" ? `what ${labelB} is trying to prove` : `ce que ${labelB} essaie de prouver`, locale);
  if (overlays.length > 0) {
    const intro =
      locale === "en"
        ? `Daily work and public ambition, this bond's 6th and 10th houses, are directly activated between you:`
        : `Le travail quotidien et l'ambition publique, les maisons VI et X de ce lien, sont directement activés entre vous :`;
    return `${intro} ${overlays.join(" ")} ${nuance}`;
  }
  const sunText = `${describePlanetInSign("sun", sunA, undefined, locale)} ${describePlanetInSign("sun", sunB, undefined, locale)}`;
  return `${sunText} ${nuance}`;
}

function spiritualChapter(
  labelA: string,
  labelB: string,
  neptuneA: ZodiacSign | null,
  neptuneB: ZodiacSign | null,
  moonA: ZodiacSign,
  moonB: ZodiacSign,
  overlays: string[],
  locale: Locale
): string {
  const nuance = elementNuance(moonA, moonB, locale === "en" ? `What soothes ${labelA}` : `Ce qui apaise ${labelA}`, locale === "en" ? `what soothes ${labelB}` : `ce qui apaise ${labelB}`, locale);
  if (overlays.length > 0) {
    const intro =
      locale === "en"
        ? `The search for meaning and the more private, inward houses of this bond are directly activated between you:`
        : `La quête de sens et les maisons les plus intimes de ce lien sont directement activées entre vous :`;
    return `${intro} ${overlays.join(" ")} ${nuance}`;
  }
  const neptuneText = neptuneA && neptuneB ? `${describePlanetInSign("neptune", neptuneA, undefined, locale)} ${describePlanetInSign("neptune", neptuneB, undefined, locale)}` : "";
  return `${neptuneText ? `${neptuneText} ` : ""}${nuance}`;
}

/**
 * Synthèse "grimoire" pour la synastrie : réutilise la même matière que la
 * section "Planètes de X dans les maisons de Y" (describeHouseOverlay,
 * déjà écrite en profondeur) regroupée par thème de vie, avec un repli sur
 * les positions en signe complètes (describePlanetInSign, pas de simples
 * mots-clés) quand aucun recouvrement de maison ne tombe dans les maisons
 * ciblées. Jamais construite à partir de synastry.aspects, pour ne pas
 * empiéter sur la section d'aspects détaillés plus bas sur la page.
 */
export function composeSynastryChartDomains(
  synastry: SynastryResult,
  chartA: NatalChart,
  chartB: NatalChart,
  labelA: string,
  labelB: string,
  locale: Locale = "fr"
): ChartDomains {
  const sunA = personSign(chartA, "sun")!;
  const sunB = personSign(chartB, "sun")!;
  const moonA = personSign(chartA, "moon")!;
  const moonB = personSign(chartB, "moon")!;
  const venusA = personSign(chartA, "venus");
  const venusB = personSign(chartB, "venus");
  const marsA = personSign(chartA, "mars");
  const marsB = personSign(chartB, "mars");
  const jupiterA = personSign(chartA, "jupiter");
  const jupiterB = personSign(chartB, "jupiter");
  const saturnA = personSign(chartA, "saturn");
  const saturnB = personSign(chartB, "saturn");
  const neptuneA = personSign(chartA, "neptune");
  const neptuneB = personSign(chartB, "neptune");

  const bothHouses = chartA.hasReliableHouses && chartB.hasReliableHouses;

  return dedupeChartDomains({
    general: generalChapter(labelA, labelB, sunA, sunB, moonA, moonB, locale),
    love: loveChapter(labelA, labelB, venusA, venusB, marsA, marsB, overlayTexts(synastry, labelA, labelB, [5, 7], bothHouses, locale), locale),
    money: moneyChapter(labelA, labelB, jupiterA, jupiterB, saturnA, saturnB, overlayTexts(synastry, labelA, labelB, [2, 8], bothHouses, locale), locale),
    career: careerChapter(labelA, labelB, sunA, sunB, overlayTexts(synastry, labelA, labelB, [6, 10], bothHouses, locale), locale),
    spiritual: spiritualChapter(labelA, labelB, neptuneA, neptuneB, moonA, moonB, overlayTexts(synastry, labelA, labelB, [9, 12], bothHouses, locale), locale),
  });
}
