import type { NatalChart } from "../types";
import { gatherSignals, sn, sk, dominanceClause, type ChartDomains, type Signals } from "./chart-domains";
import type { Locale } from "./compose";

/**
 * Synthèse "grimoire" pour la révolution solaire : lit le thème du retour
 * comme un mini-thème natal pour l'année en cours, pas comme une redite du
 * thème natal. Le Soleil y revient par définition sur son degré natal (ce
 * n'est donc jamais l'information intéressante ici) : ce qui change d'une
 * année à l'autre, et donc ce qui porte le vrai contenu de cette lecture,
 * ce sont la Lune, l'Ascendant, le Milieu du Ciel et les maisons du thème
 * du retour, propres à cette année précise.
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

function loveSolarReturn(s: Signals, locale: Locale): string {
  const houseBit =
    s.house7
      ? locale === "en"
        ? ` This year's 7th house, the couple's terrain for these twelve months, falls in ${sn(s.house7, locale)} (${sk(s.house7, locale)}).`
        : ` La maison VII de cette année, le terrain du couple pour ces douze mois, tombe en ${sn(s.house7, locale)} (${sk(s.house7, locale)}).`
      : "";
  if (locale === "en") {
    return `${s.venus ? `This year's Venus in ${sn(s.venus, locale)} shifts what catches your eye and how you show affection for the season (${sk(s.venus, locale)}).` : ""}${
      s.mars ? ` This year's Mars in ${sn(s.mars, locale)} shifts how you go after what you want (${sk(s.mars, locale)}).` : ""
    }${houseBit} None of this replaces your natal Venus and Mars, it's the seasonal weather layered on top of them.`;
  }
  return `${s.venus ? `La Vénus de cette année en ${sn(s.venus, locale)} déplace ce qui attire votre regard et la façon dont vous montrez votre affection pour la saison (${sk(s.venus, locale)}).` : ""}${
    s.mars ? ` Le Mars de cette année en ${sn(s.mars, locale)} déplace la façon dont vous allez chercher ce que vous voulez (${sk(s.mars, locale)}).` : ""
  }${houseBit} Rien de tout cela ne remplace votre Vénus et votre Mars natals, c'est la météo saisonnière qui se superpose à eux.`;
}

function moneySolarReturn(s: Signals, locale: Locale): string {
  const houseBit =
    s.house2
      ? locale === "en"
        ? ` This year's 2nd house sits in ${sn(s.house2, locale)} (${sk(s.house2, locale)}).${s.house8 ? ` This year's 8th house, shared money and debt, falls in ${sn(s.house8, locale)} (${sk(s.house8, locale)}).` : ""}`
        : ` La maison II de cette année se trouve en ${sn(s.house2, locale)} (${sk(s.house2, locale)}).${s.house8 ? ` La maison VIII de cette année, l'argent partagé et les dettes, tombe en ${sn(s.house8, locale)} (${sk(s.house8, locale)}).` : ""}`
      : "";
  if (locale === "en") {
    return `${s.jupiter ? `This year's Jupiter in ${sn(s.jupiter, locale)} marks where growth is easiest to find this season (${sk(s.jupiter, locale)}).` : ""}${
      s.saturn ? ` This year's Saturn in ${sn(s.saturn, locale)} marks where discipline is asked for before anything solid holds (${sk(s.saturn, locale)}).` : ""
    }${houseBit} A single year rarely rewrites your finances on its own, but it does set the season's particular mix of opportunity and restraint.`;
  }
  return `${s.jupiter ? `Le Jupiter de cette année en ${sn(s.jupiter, locale)} marque où la croissance est la plus facile à trouver cette saison (${sk(s.jupiter, locale)}).` : ""}${
    s.saturn ? ` Le Saturne de cette année en ${sn(s.saturn, locale)} marque où la discipline est demandée avant que quoi que ce soit de solide ne tienne (${sk(s.saturn, locale)}).` : ""
  }${houseBit} Une seule année réécrit rarement vos finances à elle seule, mais elle fixe le mélange particulier d'opportunité et de retenue propre à cette saison.`;
}

function careerSolarReturn(s: Signals, locale: Locale): string {
  const houseBit =
    s.mc
      ? locale === "en"
        ? `This year's Midheaven in ${sn(s.mc, locale)} sets the public role in focus for these twelve months.`
        : `Le Milieu du Ciel de cette année en ${sn(s.mc, locale)} fixe le rôle public sur lequel l'attention se porte pour ces douze mois.`
      : "";
  if (locale === "en") {
    return `${houseBit}${s.saturn ? ` This year's Saturn in ${sn(s.saturn, locale)} names the effort the season actually asks for (${sk(s.saturn, locale)}).` : ""}${
      s.mars ? ` This year's Mars in ${sn(s.mars, locale)} is this season's pace, the rhythm you're working at right now (${sk(s.mars, locale)}).` : ""
    } A solar return career theme is a chapter, not the whole book: your natal Sun and Midheaven still write the overall story.`;
  }
  return `${houseBit}${s.saturn ? ` Le Saturne de cette année en ${sn(s.saturn, locale)} nomme l'effort que la saison demande réellement (${sk(s.saturn, locale)}).` : ""}${
    s.mars ? ` Le Mars de cette année en ${sn(s.mars, locale)} est le rythme de cette saison, la cadence à laquelle vous travaillez en ce moment (${sk(s.mars, locale)}).` : ""
  } Un thème de carrière de révolution solaire est un chapitre, pas tout le livre : votre Soleil et votre Milieu du Ciel natals continuent d'écrire l'histoire d'ensemble.`;
}

function spiritualSolarReturn(s: Signals, locale: Locale): string {
  const houseBit =
    s.house12
      ? locale === "en"
        ? ` This year's 12th house, what runs quietly beneath the surface this season, falls in ${sn(s.house12, locale)} (${sk(s.house12, locale)}).`
        : ` La maison XII de cette année, ce qui se joue en sourdine cette saison, tombe en ${sn(s.house12, locale)} (${sk(s.house12, locale)}).`
      : "";
  if (locale === "en") {
    return `This year's Moon in ${sn(s.moon, locale)} is the more immediate compass for the season, what actually soothes you right now.${houseBit}${
      s.neptune ? ` This year's Neptune in ${sn(s.neptune, locale)} still marks a generational tone more than a personal one, but its house this year can still be worth noticing.` : ""
    }`;
  }
  return `La Lune de cette année en ${sn(s.moon, locale)} reste la boussole la plus immédiate pour la saison, ce qui vous apaise réellement en ce moment.${houseBit}${
    s.neptune ? ` Le Neptune de cette année en ${sn(s.neptune, locale)} marque toujours une tonalité générationnelle plus que personnelle, mais sa maison cette année peut tout de même mériter d'être remarquée.` : ""
  }`;
}

export function composeSolarReturnDomains(returnChart: NatalChart, year: number, locale: Locale = "fr"): ChartDomains {
  const s = gatherSignals(returnChart.points, returnChart.houses, returnChart.hasReliableHouses);
  return {
    general: generalSolarReturn(s, year, locale),
    love: loveSolarReturn(s, locale),
    money: moneySolarReturn(s, locale),
    career: careerSolarReturn(s, locale),
    spiritual: spiritualSolarReturn(s, locale),
  };
}
