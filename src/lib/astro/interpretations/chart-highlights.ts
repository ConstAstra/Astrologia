import type { NatalChart, PointKey, ZodiacSign } from "../types";
import { computeAspects } from "../aspects";
import { computeBigThree } from "../dominance";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import type { Locale } from "./compose";

// Trait court par signe — utilisé pour opposer le masque (Ascendant, ce
// qu'on voit) au fond (Soleil, ce qui vous porte réellement).
const SIGN_TRAIT: Record<string, string> = {
  belier: "foncez sans demander la permission",
  taureau: "ne bougez que si c'est du solide",
  gemeaux: "changez de sujet avant qu'on vous le demande",
  cancer: "protégez ce que vous aimez, sans compromis",
  lion: "voulez qu'on vous regarde",
  vierge: "corrigez ce qui cloche, même sans qu'on demande",
  balance: "négociez même quand personne ne négocie",
  scorpion: "voyez ce qu'on essaie de cacher",
  sagittaire: "dites ce que vous pensez, tant pis",
  capricorne: "construisez pendant que les autres parlent",
  verseau: "faites bande à part, par principe",
  poissons: "sentez avant de comprendre",
};

const SIGN_TRAIT_EN: Record<string, string> = {
  belier: "move before asking permission",
  taureau: "won't budge unless it's solid",
  gemeaux: "change the subject before anyone asks",
  cancer: "protect what you love, no compromise",
  lion: "want to be looked at",
  vierge: "fix what's off, even uninvited",
  balance: "negotiate even when no one's negotiating",
  scorpion: "see what people try to hide",
  sagittaire: "say what you think, consequences later",
  capricorne: "build while everyone else is talking",
  verseau: "stand apart, on principle",
  poissons: "feel before you understand",
};

// Un seul mot par signe — le "caractère" affiché sur la carte d'identité
// partageable, volontairement sans aucun terme technique (pas de nom de
// planète ni d'aspect, illisible pour qui ne connaît pas l'astrologie).
export const SIGN_KEYWORD: Record<string, string> = {
  belier: "Fonceur",
  taureau: "Ancré",
  gemeaux: "Vif",
  cancer: "Loyal",
  lion: "Rayonnant",
  vierge: "Précis",
  balance: "Diplomate",
  scorpion: "Intense",
  sagittaire: "Libre",
  capricorne: "Déterminé",
  verseau: "Original",
  poissons: "Intuitif",
};

export const SIGN_KEYWORD_EN: Record<string, string> = {
  belier: "Bold",
  taureau: "Grounded",
  gemeaux: "Quick-witted",
  cancer: "Loyal",
  lion: "Radiant",
  vierge: "Precise",
  balance: "Diplomatic",
  scorpion: "Intense",
  sagittaire: "Free-spirited",
  capricorne: "Determined",
  verseau: "Original",
  poissons: "Intuitive",
};

// Paires d'éléments classiquement antagonistes (cf. ELEMENT_FRICTION_PAIRS
// dans synthesis.ts) : Feu/Eau et Terre/Air tirent en sens contraires.
const ELEMENT_FRICTION_PAIRS: [string, string][] = [
  ["Feu", "Eau"],
  ["Terre", "Air"],
];

// Ce que chaque élément "réclame", formulé pour s'insérer après "a besoin"
// (fr) / "needs" (en) sans piège de contraction (de/d', pas d'article défini
// après la préposition).
const ELEMENT_NEED: Record<Locale, Record<string, string>> = {
  fr: {
    Feu: "d'agir vite, quitte à improviser",
    Terre: "de preuves concrètes avant d'y croire",
    Air: "de comprendre avant de ressentir",
    Eau: "de ressentir avant de comprendre",
  },
  en: {
    Feu: "to act fast, improvising along the way",
    Terre: "concrete proof before it can believe anything",
    Air: "to understand before it can feel",
    Eau: "to feel before it can understand",
  },
};

/**
 * Compare le Soleil (ce que vous voulez consciemment) et la Lune (ce que
 * vous ressentez) en nommant les deux signes réellement présents dans le
 * thème, plutôt qu'un seul élément "dominant" isolé de tout contexte — la
 * même paire de signes ne peut produire qu'une seule des trois lectures
 * (même élément / éléments antagonistes / éléments simplement différents),
 * ce qui la rend vérifiable par la personne qui lit son propre thème.
 */
function composeSunMoonLine(sunSign: ZodiacSign, moonSign: ZodiacSign, locale: Locale): string {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const sunMeta = signMap[sunSign];
  const moonMeta = signMap[moonSign];
  const sunElement = SIGN_META[sunSign].element;
  const moonElement = SIGN_META[moonSign].element;

  if (sunElement === moonElement) {
    return locale === "en"
      ? `Sun in ${sunMeta.name}, Moon in ${moonMeta.name}: what you want and what you feel run on the same fuel — a rare comfort, as long as you don't mistake it for the whole picture.`
      : `Soleil en ${sunMeta.name}, Lune en ${moonMeta.name} : ce que vous voulez et ce que vous ressentez marchent au même carburant — un confort rare, à condition de ne pas croire que ça suffit à tout expliquer.`;
  }

  const need = ELEMENT_NEED[locale];
  const isFriction = ELEMENT_FRICTION_PAIRS.some(
    ([a, b]) => (a === sunElement && b === moonElement) || (a === moonElement && b === sunElement)
  );

  if (isFriction) {
    return locale === "en"
      ? `Sun in ${sunMeta.name}, Moon in ${moonMeta.name}: what you consciously want and what you actually feel don't run on the same fuel — one needs ${need[sunElement]}, the other needs ${need[moonElement]}. That's not a one-time fix, it's an ongoing negotiation.`
      : `Soleil en ${sunMeta.name}, Lune en ${moonMeta.name} : ce que vous voulez consciemment et ce que vous ressentez réellement ne parlent pas la même langue — l'un a besoin ${need[sunElement]}, l'autre a besoin ${need[moonElement]}. Ça ne se règle pas une fois pour toutes, ça se négocie en continu.`;
  }

  return locale === "en"
    ? `Sun in ${sunMeta.name}, Moon in ${moonMeta.name}: what drives you and what reassures you aren't the same thing — different enough to complement each other, close enough not to fight.`
    : `Soleil en ${sunMeta.name}, Lune en ${moonMeta.name} : ce qui vous anime et ce qui vous rassure ne sont pas la même chose — assez différents pour se compléter, assez proches pour ne pas se combattre.`;
}

// Ce que représente chaque point en langage courant, sans aucun terme
// technique — sert à décrire un aspect réel (pas juste sa "tonalité") sans
// jamais nommer de planète ni d'angle. Volontairement restreint aux points
// personnels les plus reconnaissables (mêmes points que synthesis.ts, moins
// Mercure/Vénus/Mars qui restent moins lisibles hors jargon) pour ne jamais
// tomber sur un point obscur comme le Nœud Nord.
const POINT_DOMAIN: Record<Locale, Partial<Record<PointKey, string>>> = {
  fr: {
    sun: "ce qui vous anime",
    moon: "votre besoin de sécurité",
    mercury: "votre façon de penser",
    venus: "ce que vous aimez",
    mars: "votre façon d'agir",
    asc: "l'image que vous projetez",
    mc: "ce que vous visez",
  },
  en: {
    sun: "what drives you",
    moon: "your need for reassurance",
    mercury: "how your mind works",
    venus: "what you're drawn to",
    mars: "how you take action",
    asc: "the image you project",
    mc: "what you're aiming for",
  },
};

const HIGHLIGHT_ASPECT_POINTS: PointKey[] = ["sun", "moon", "mercury", "venus", "mars", "asc", "mc"];

/**
 * Décrit un aspect réel du thème (une paire de points précise, pas une
 * "tonalité" abstraite) en langage courant : chaque paire de points produit
 * un couple de domaines différent, ce qui — combiné aux trois tonalités
 * possibles — donne largement de quoi distinguer deux thèmes différents,
 * sans jamais nommer de planète.
 */
function describeDomainAspect(a: PointKey, b: PointKey, tone: string, locale: Locale): string {
  const domain = POINT_DOMAIN[locale];
  const first = domain[a]!;
  const second = domain[b]!;
  const firstCapitalized = first.charAt(0).toUpperCase() + first.slice(1);

  if (locale === "en") {
    if (tone === "tendu")
      return `${firstCapitalized} and ${second} pull in different directions — endured, it exhausts you; understood, it builds you.`;
    if (tone === "harmonieux")
      return `${firstCapitalized} and ${second} agree so easily that you may never actually be tested on it.`;
    return `${firstCapitalized} and ${second} cross without clashing or aligning — a blind spot more than a battle.`;
  }
  if (tone === "tendu")
    return `${firstCapitalized} et ${second} tirent dans des directions différentes — mal vécu, ça épuise ; compris, ça construit.`;
  if (tone === "harmonieux")
    return `${firstCapitalized} et ${second} s'accordent si facilement que vous n'êtes peut-être jamais mis·e à l'épreuve là-dessus.`;
  return `${firstCapitalized} et ${second} se croisent sans se heurter ni s'accorder — un angle mort plus qu'un combat.`;
}

/**
 * Trois phrases, chacune ancrée sur des placements réels et nommés du
 * thème (signes du Soleil/Lune/Ascendant, paire de points en aspect) plutôt
 * que sur un seul facteur à faible cardinalité pris isolément (un élément
 * parmi 4, une tonalité parmi 3) — le risque sinon est de produire des
 * phrases correctes mais interchangeables d'un thème à l'autre. Pas de
 * redite du Soleil/Lune/Ascendant déjà affiché juste en dessous
 * (OverviewCard) : ici, la relation *entre* les placements, pas les
 * placements eux-mêmes. Réutilisé tel quel sur la carte d'identité
 * partageable.
 */
export function composeChartHighlights(chart: NatalChart, locale: Locale = "fr"): string[] {
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const signTrait = locale === "en" ? SIGN_TRAIT_EN : SIGN_TRAIT;

  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const domainAspects = computeAspects(chart.points, HIGHLIGHT_ASPECT_POINTS).filter(
    (a) => a.major && POINT_DOMAIN.fr[a.a] && POINT_DOMAIN.fr[a.b]
  );
  const tightest = domainAspects[0];

  const lines: string[] = [];

  if (big3.ascendant && big3.ascendant !== big3.sun) {
    lines.push(
      locale === "en"
        ? `People assume you ${signTrait[big3.ascendant]}. What actually drives you is that you ${signTrait[big3.sun]}.`
        : `En façade, vous ${signTrait[big3.ascendant]}. Ce qui vous fait vraiment avancer, c'est que vous ${signTrait[big3.sun]}.`
    );
  } else {
    lines.push(
      locale === "en"
        ? "What you show and what drives you are the same thing — rare, and not always comfortable."
        : "Ce que vous montrez et ce qui vous anime, c'est la même chose — rare, et pas toujours confortable."
    );
  }

  lines.push(composeSunMoonLine(big3.sun, big3.moon, locale));

  if (tightest) {
    const tone = aspectMap[tightest.aspect].tone;
    lines.push(describeDomainAspect(tightest.a, tightest.b, tone, locale));
  }

  return lines;
}
