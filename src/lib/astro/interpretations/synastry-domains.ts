import type { NatalChart, PointKey, ZodiacSign } from "../types";
import type { SynastryResult } from "../synastry";
import { signOf } from "../signs";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import type { Locale } from "./compose";
import type { ChartDomains } from "./chart-domains";

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

/** Planètes de `guestChart` tombées dans une des maisons cibles de `hostChart`, avec leur nom localisé. */
function overlaysInHouses(
  overlays: { point: PointKey; house: number }[],
  targetHouses: number[],
  locale: Locale
): { name: string; house: number }[] {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  return overlays
    .filter((o) => targetHouses.includes(o.house))
    .map((o) => ({ name: planetMap[o.point].name, house: o.house }));
}

function houseName(houseNumber: number, locale: Locale) {
  const list = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  return list[houseNumber - 1].name;
}

function listNames(names: string[], locale: Locale): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  const sep = locale === "en" ? " and " : " et ";
  return `${names.slice(0, -1).join(", ")}${sep}${names[names.length - 1]}`;
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

function loveChapter(
  labelA: string,
  labelB: string,
  venusA: ZodiacSign | null,
  venusB: ZodiacSign | null,
  marsA: ZodiacSign | null,
  marsB: ZodiacSign | null,
  overlayHouseNames: string[],
  locale: Locale
): string {
  const houseBit =
    overlayHouseNames.length > 0
      ? locale === "en"
        ? ` Planets land directly in the partnership houses on both sides (${listNames(overlayHouseNames, locale)}), the terrain of the couple itself is directly activated between you.`
        : ` Des planètes atterrissent directement dans les maisons du couple des deux côtés (${listNames(overlayHouseNames, locale)}), le terrain du couple lui-même est directement activé entre vous.`
      : "";
  if (locale === "en") {
    return `${venusA && venusB ? `${labelA}'s Venus in ${sn(venusA, locale)} and ${labelB}'s Venus in ${sn(venusB, locale)} show what each of you is drawn to and how affection actually gets shown, not always the same language.` : ""}${
      marsA && marsB ? ` ${labelA}'s Mars in ${sn(marsA, locale)} and ${labelB}'s Mars in ${sn(marsB, locale)} show how each of you pursues what you want, matching paces or not.` : ""
    }${houseBit}`;
  }
  return `${venusA && venusB ? `La Vénus de ${labelA} en ${sn(venusA, locale)} et la Vénus de ${labelB} en ${sn(venusB, locale)} montrent ce à quoi chacun·e est attiré·e et comment l'affection se montre réellement, pas toujours le même langage.` : ""}${
    marsA && marsB ? ` Le Mars de ${labelA} en ${sn(marsA, locale)} et le Mars de ${labelB} en ${sn(marsB, locale)} montrent comment chacun·e poursuit ce qu'il ou elle veut, au même rythme ou non.` : ""
  }${houseBit}`;
}

function moneyChapter(
  labelA: string,
  labelB: string,
  jupiterA: ZodiacSign | null,
  jupiterB: ZodiacSign | null,
  saturnA: ZodiacSign | null,
  saturnB: ZodiacSign | null,
  overlayHouseNames: string[],
  locale: Locale
): string {
  const houseBit =
    overlayHouseNames.length > 0
      ? locale === "en"
        ? ` Planets fall in the resource-and-value houses on both sides (${listNames(overlayHouseNames, locale)}): money and shared resources are a real, active topic between you, not a side issue.`
        : ` Des planètes tombent dans les maisons de ressources et de valeurs des deux côtés (${listNames(overlayHouseNames, locale)}) : l'argent et les ressources partagées sont un vrai sujet actif entre vous, pas un détail.`
      : "";
  if (locale === "en") {
    return `${jupiterA && jupiterB ? `${labelA}'s Jupiter in ${sn(jupiterA, locale)} and ${labelB}'s Jupiter in ${sn(jupiterB, locale)} show where each of you naturally expects things to expand.` : ""}${
      saturnA && saturnB ? ` ${labelA}'s Saturn in ${sn(saturnA, locale)} and ${labelB}'s Saturn in ${sn(saturnB, locale)} show what each of you takes seriously before trusting it.` : ""
    }${houseBit}`;
  }
  return `${jupiterA && jupiterB ? `Le Jupiter de ${labelA} en ${sn(jupiterA, locale)} et le Jupiter de ${labelB} en ${sn(jupiterB, locale)} montrent où chacun·e s'attend naturellement à ce que les choses grandissent.` : ""}${
    saturnA && saturnB ? ` Le Saturne de ${labelA} en ${sn(saturnA, locale)} et le Saturne de ${labelB} en ${sn(saturnB, locale)} montrent ce que chacun·e prend au sérieux avant d'y faire confiance.` : ""
  }${houseBit}`;
}

function careerChapter(
  labelA: string,
  labelB: string,
  sunA: ZodiacSign,
  sunB: ZodiacSign,
  mcA: ZodiacSign | null,
  mcB: ZodiacSign | null,
  overlayHouseNames: string[],
  locale: Locale
): string {
  const houseBit =
    overlayHouseNames.length > 0
      ? locale === "en"
        ? ` Planets land in the public-facing, ambition houses on both sides (${listNames(overlayHouseNames, locale)}): this bond has a real effect on how each of you shows up professionally, not just privately.`
        : ` Des planètes atterrissent dans les maisons d'ambition et d'image publique des deux côtés (${listNames(overlayHouseNames, locale)}) : ce lien a un vrai effet sur la façon dont chacun·e se présente professionnellement, pas seulement en privé.`
      : "";
  if (locale === "en") {
    const main =
      mcA && mcB
        ? `${labelA}'s Midheaven in ${sn(mcA, locale)} and ${labelB}'s Midheaven in ${sn(mcB, locale)} rarely aim at the exact same public role, and don't need to.`
        : `${labelA}'s Sun in ${sn(sunA, locale)} and ${labelB}'s Sun in ${sn(sunB, locale)} rarely chase the exact same kind of recognition, and don't need to.`;
    return `${main}${houseBit}`;
  }
  const main =
    mcA && mcB
      ? `Le Milieu du Ciel de ${labelA} en ${sn(mcA, locale)} et celui de ${labelB} en ${sn(mcB, locale)} visent rarement exactement le même rôle public, et n'ont pas besoin de le viser.`
      : `Le Soleil de ${labelA} en ${sn(sunA, locale)} et le Soleil de ${labelB} en ${sn(sunB, locale)} recherchent rarement exactement le même type de reconnaissance, et n'ont pas besoin de le rechercher.`;
  return `${main}${houseBit}`;
}

function spiritualChapter(
  labelA: string,
  labelB: string,
  neptuneA: ZodiacSign | null,
  neptuneB: ZodiacSign | null,
  overlayHouseNames: string[],
  locale: Locale
): string {
  const houseBit =
    overlayHouseNames.length > 0
      ? locale === "en"
        ? ` Planets fall in the more private, inward houses on both sides (${listNames(overlayHouseNames, locale)}), an intimacy that operates beneath what either of you says out loud.`
        : ` Des planètes tombent dans les maisons les plus intimes et intérieures des deux côtés (${listNames(overlayHouseNames, locale)}), une intimité qui fonctionne en dessous de ce que l'un ou l'autre dit à voix haute.`
      : "";
  if (locale === "en") {
    return `${neptuneA && neptuneB ? `${labelA}'s Neptune in ${sn(neptuneA, locale)} and ${labelB}'s Neptune in ${sn(neptuneB, locale)} mark generational, not personal, undertones here, what's actually yours together plays out through house and aspect, not sign alone.` : ""}${houseBit}`;
  }
  return `${neptuneA && neptuneB ? `Le Neptune de ${labelA} en ${sn(neptuneA, locale)} et celui de ${labelB} en ${sn(neptuneB, locale)} marquent ici une tonalité générationnelle plus que personnelle, ce qui vous appartient vraiment à deux se joue dans la maison et l'aspect, pas dans le seul signe.` : ""}${houseBit}`;
}

/**
 * Synthèse "grimoire" pour la synastrie : construite uniquement à partir des
 * signes propres à chacun·e et des recouvrements de maisons (déjà une
 * lecture légitime, distincte d'un aspect), jamais à partir de
 * synastry.aspects, pour ne jamais empiéter sur la section d'aspects
 * détaillés plus bas sur la page.
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
  const mcA = chartA.hasReliableHouses ? personSign(chartA, "mc") : null;
  const mcB = chartB.hasReliableHouses ? personSign(chartB, "mc") : null;

  const bothHouses = chartA.hasReliableHouses && chartB.hasReliableHouses;

  const collectOverlayNames = (targetHouses: number[]) => {
    if (!bothHouses) return [];
    const inA = overlaysInHouses(synastry.bPlanetsInAHouses, targetHouses, locale);
    const inB = overlaysInHouses(synastry.aPlanetsInBHouses, targetHouses, locale);
    const names = new Set<string>();
    for (const o of inA) names.add(`${o.name} ${locale === "en" ? "in" : "en"} ${houseName(o.house, locale)}`);
    for (const o of inB) names.add(`${o.name} ${locale === "en" ? "in" : "en"} ${houseName(o.house, locale)}`);
    return [...names];
  };

  return {
    general: generalChapter(labelA, labelB, sunA, sunB, moonA, moonB, locale),
    love: loveChapter(labelA, labelB, venusA, venusB, marsA, marsB, collectOverlayNames([5, 7]), locale),
    money: moneyChapter(labelA, labelB, jupiterA, jupiterB, saturnA, saturnB, collectOverlayNames([2, 8]), locale),
    career: careerChapter(labelA, labelB, sunA, sunB, mcA, mcB, collectOverlayNames([10]), locale),
    spiritual: spiritualChapter(labelA, labelB, neptuneA, neptuneB, collectOverlayNames([12]), locale),
  };
}
