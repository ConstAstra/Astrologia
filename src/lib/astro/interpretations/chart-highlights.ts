import type { NatalChart, PointKey } from "../types";
import { computeAspects } from "../aspects";
import { computeBigThree, computeDominance } from "../dominance";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import type { Locale } from "./compose";

const ELEMENT_INSIGHT: Record<string, string> = {
  Feu: "Ce que vous craignez le plus, ce n'est pas d'échouer — c'est de ne rien avoir tenté.",
  Terre: "Vous ne demandez pas qu'on vous rassure : vous voulez des preuves.",
  Air: "Vous préférez comprendre une émotion que la traverser.",
  Eau: "Vous protégez votre sensibilité en ayant l'air de ne rien ressentir.",
};

const ELEMENT_INSIGHT_EN: Record<string, string> = {
  Feu: "What you fear most isn't failing — it's never having tried.",
  Terre: "You don't want to be reassured. You want proof.",
  Air: "You'd rather understand a feeling than go through it.",
  Eau: "You guard your sensitivity by looking like you feel nothing.",
};

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

/**
 * Composé selon la nature de l'aspect le plus serré, sans jamais nommer les
 * planètes ni l'aspect (illisible pour qui ne connaît pas l'astrologie — ce
 * détail technique reste disponible plus bas, dans la liste des aspects).
 * La tension n'est pas présentée comme un problème à corriger, ni
 * l'harmonie comme un confort sans revers — chacune a son envers, pour
 * rester une observation plutôt qu'un jugement.
 */
function describeTightestAspect(tone: string, locale: Locale): string {
  if (locale === "en") {
    if (tone === "tendu") return "Part of you pushes forward, another holds back — endured, it exhausts you; understood, it builds you.";
    if (tone === "harmonieux") return "Two sides of you agree so easily that you may never actually be tested on it.";
    return "Two sides of you cross without clashing or aligning — a blind spot more than a battle.";
  }
  if (tone === "tendu") return "Une part de vous pousse, une autre retient — mal vécue, cette tension épuise ; comprise, elle construit.";
  if (tone === "harmonieux") return "Deux parts de vous s'accordent si facilement que vous n'êtes peut-être jamais mis à l'épreuve là-dessus.";
  return "Deux parts de vous se croisent sans se heurter ni s'accorder — un angle mort plus qu'un combat.";
}

/**
 * Deux à trois phrases plus profondes qu'un simple résumé — pas une redite
 * du Soleil/Lune/Ascendant déjà affiché juste en dessous (OverviewCard),
 * mais des observations qui n'existent nulle part ailleurs sur la page : la
 * tension entre le masque (Ascendant) et le fond (Soleil), le mécanisme
 * derrière la dominante, ce que révèle la plus grosse friction interne.
 * Réutilisé tel quel sur la carte d'identité partageable.
 */
export function composeChartHighlights(chart: NatalChart, aspectKeys: PointKey[], locale: Locale = "fr"): string[] {
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const elementInsight = locale === "en" ? ELEMENT_INSIGHT_EN : ELEMENT_INSIGHT;
  const signTrait = locale === "en" ? SIGN_TRAIT_EN : SIGN_TRAIT;

  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const dominance = computeDominance(chart.points, chart.hasReliableHouses);
  const aspects = computeAspects(chart.points, aspectKeys);
  const tightest = aspects.find((a) => a.major);

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

  const dominantElement = dominance.dominantElements[0];
  if (dominantElement) {
    lines.push(elementInsight[dominantElement]);
  }

  if (tightest) {
    const tone = aspectMap[tightest.aspect].tone;
    lines.push(describeTightestAspect(tone, locale));
  }

  return lines;
}
