import type { NatalChart } from "../types";
import { gatherSignals, sn, sk, dominanceClause, elementNuance, type ChartDomains, type Signals } from "./chart-domains";
import { describeHouseDomain } from "./synthesis";
import type { Locale } from "./compose";

/**
 * Synthèse "grimoire" pour la révolution solaire : réutilise exactement la
 * même matière que la synthèse natale (describeHouseDomain, déjà écrite en
 * profondeur signe + maison) plutôt qu'une liste de mots-clés, mais lit le
 * thème du retour comme un mini-thème pour l'année plutôt que comme une
 * redite du thème natal. Le Soleil y revient par définition sur son degré
 * natal (ce n'est donc jamais l'information intéressante ici) : ce qui
 * change d'une année à l'autre, et donc ce qui porte le vrai contenu de
 * cette lecture, ce sont la Lune, l'Ascendant, le Milieu du Ciel et les
 * maisons du thème du retour, propres à cette année précise.
 */

function generalSolarReturn(s: Signals, year: number, locale: Locale): string {
  if (locale === "en") {
    return `Every solar return opens the same way: the Sun comes back to the exact degree it held at birth, the anchor that makes ${year} a full year rather than an arbitrary slice of time. What actually changes is everything around it: this year's Moon in ${sn(s.moon, locale)} (${sk(s.moon, locale)}) sets the emotional undertone${
      s.asc ? `, and this year's Ascendant in ${sn(s.asc, locale)} (${sk(s.asc, locale)}) colors how you come across to others for the next twelve months` : ""
    }. ${dominanceClause(s, locale)} Think of this chart less as who you are and more as the weather this particular year is running on.`;
  }
  return `Chaque révolution solaire commence de la même façon : le Soleil revient exactement sur le degré qu'il occupait à la naissance, l'ancrage qui fait de ${year} une année entière plutôt qu'une tranche de temps arbitraire. Ce qui change réellement, c'est tout ce qui l'entoure : la Lune de cette année en ${sn(s.moon, locale)} (${sk(s.moon, locale)}) donne la tonalité émotionnelle${
    s.asc ? `, et l'Ascendant de cette année en ${sn(s.asc, locale)} (${sk(s.asc, locale)}) colore la façon dont vous êtes perçu·e par les autres pour les douze prochains mois` : ""
  }. ${dominanceClause(s, locale)} Voyez ce thème moins comme qui vous êtes que comme la météo sur laquelle cette année précise tourne.`;
}

function yearChapter(
  chart: NatalChart,
  s: Signals,
  houseA: number,
  houseB: number,
  introEn: string,
  introFr: string,
  nuance: string,
  locale: Locale
): string {
  if (s.hasReliableHouses) {
    const a = describeHouseDomain(chart, houseA, locale);
    const b = describeHouseDomain(chart, houseB, locale);
    const intro = locale === "en" ? `${introEn} ${a.title} and ${b.title}, this year's version of them, that is.` : `${introFr} ${a.title} et ${b.title}, la version de cette année, cela dit.`;
    return `${intro} ${a.text} ${b.text}${nuance ? ` ${nuance}` : ""}`;
  }
  return nuance;
}

function loveSolarReturn(chart: NatalChart, s: Signals, locale: Locale): string {
  const nuance = s.venus && s.mars ? elementNuance(s.venus, s.mars, locale === "en" ? "What catches your eye this year" : "Ce qui attire votre regard cette année", locale === "en" ? "how you go after it this season" : "la façon dont vous allez le chercher cette saison", locale) : "";
  return yearChapter(
    chart,
    s,
    5,
    7,
    "This year's love life leans on two houses:",
    "La vie amoureuse de cette année s'appuie sur deux maisons :",
    nuance,
    locale
  );
}

function moneySolarReturn(chart: NatalChart, s: Signals, locale: Locale): string {
  const nuance = s.jupiter && s.saturn ? elementNuance(s.jupiter, s.saturn, locale === "en" ? "This year's instinct to expand" : "L'instinct d'expansion de cette année", locale === "en" ? "this year's instinct to hold back" : "l'instinct de retenue de cette année", locale) : "";
  return yearChapter(
    chart,
    s,
    2,
    8,
    "This year's money story leans on two houses:",
    "L'histoire financière de cette année s'appuie sur deux maisons :",
    nuance,
    locale
  );
}

function careerSolarReturn(chart: NatalChart, s: Signals, locale: Locale): string {
  const nuance = s.mars && s.saturn ? elementNuance(s.mars, s.saturn, locale === "en" ? "This year's pace" : "Le rythme de cette année", locale === "en" ? "the discipline the season demands" : "la discipline que la saison exige", locale) : "";
  return yearChapter(
    chart,
    s,
    6,
    10,
    "This year's work life leans on two houses:",
    "La vie professionnelle de cette année s'appuie sur deux maisons :",
    nuance,
    locale
  );
}

function spiritualSolarReturn(chart: NatalChart, s: Signals, locale: Locale): string {
  const nuance = elementNuance(s.moon, s.neptune ?? s.moon, locale === "en" ? "What soothes you right now" : "Ce qui vous apaise en ce moment", locale === "en" ? "the harder-to-name pull this year also carries" : "l'attirance plus difficile à nommer que cette année porte aussi", locale);
  return yearChapter(
    chart,
    s,
    9,
    12,
    "This year's inner life leans on two houses:",
    "La vie intérieure de cette année s'appuie sur deux maisons :",
    nuance,
    locale
  );
}

export function composeSolarReturnDomains(returnChart: NatalChart, year: number, locale: Locale = "fr"): ChartDomains {
  const s = gatherSignals(returnChart.points, returnChart.houses, returnChart.hasReliableHouses);
  return {
    general: generalSolarReturn(s, year, locale),
    love: loveSolarReturn(returnChart, s, locale),
    money: moneySolarReturn(returnChart, s, locale),
    career: careerSolarReturn(returnChart, s, locale),
    spiritual: spiritualSolarReturn(returnChart, s, locale),
  };
}
