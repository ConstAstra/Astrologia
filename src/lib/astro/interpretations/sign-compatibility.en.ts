import { SIGN_META_EN } from "./signs.en";
import type { ZodiacSign } from "../types";
import type { SignCompatibility } from "./sign-compatibility";

// English mirror of SIGN_FRICTION_TRAIT — see sign-compatibility.ts for why
// this exists (grounds the "challenges" field in the two actual signs
// rather than a generic line shared by all 144 pairs).
const SIGN_FRICTION_TRAIT: Record<ZodiacSign, string> = {
  belier: "gets irritated by a slow pace and wants a decision made quickly",
  taureau: "digs in when pushed and needs time to change its mind",
  gemeaux: "gets bored by a conversation going in circles and needs novelty to stay engaged",
  cancer: "shuts down when the tone turns cold and needs a reassuring gesture before opening back up",
  lion: "struggles when its contribution goes unrecognized and needs its input to be valued",
  vierge: "zeroes in on the details that don't add up and needs things done properly",
  balance: "avoids direct conflict as long as it can and needs real dialogue rather than a power struggle",
  scorpion: "grows wary the moment it senses something hidden and needs total trust to open up",
  sagittaire: "feels stifled the moment its schedule or ideas get boxed in and needs room to move",
  capricorne: "loses patience with a lack of seriousness and needs commitments to be kept",
  verseau: "pulls back if pushed into a mold and needs space to stay itself",
  poissons: "drowns in doubt when the mood turns harsh and needs gentleness to feel safe",
};

// English mirror of sign-compatibility.ts — same element/modality scoring
// (see that file for the astrological reasoning behind each score), English
// text. Kept as a separate module rather than a parametrized one to match
// the project's existing per-locale content-file pattern.
const ELEMENT_PAIR: Record<string, { text: string; score: number }> = {
  "Feu-Feu": {
    text: "Two fire natures: lots of energy, enthusiasm and a shared taste for action. The duo moves fast and rarely gets bored, the risk is both egos wanting to lead at once.",
    score: 4,
  },
  "Terre-Terre": {
    text: "Two earth natures: a shared foundation of stability, practicality and reliability. The duo feels secure, the risk is settling into a routine that lacks spark.",
    score: 4,
  },
  "Air-Air": {
    text: "Two air natures: a shared flow of ideas, curiosity and need for freedom. The duo understands each other intellectually, the risk is staying on the surface emotionally, or over-theorizing instead of acting.",
    score: 4,
  },
  "Eau-Eau": {
    text: "Two water natures: strong mutual intuition and sensitivity, often a sense of \"understanding each other without words.\" The risk is the two of you sealing yourselves into emotional intensity, without enough distance.",
    score: 4,
  },
  "Air-Feu": {
    text: "Fire and air: one of the zodiac's most naturally dynamic combinations, air feeds fire, and fire gives air a concrete direction. Contagious enthusiasm and spontaneous chemistry.",
    score: 5,
  },
  "Eau-Terre": {
    text: "Water and earth: a combination that nourishes both sides, earth gives water a stable frame, water brings emotional depth to earth. A harmony that often settles in without forcing it.",
    score: 5,
  },
  "Feu-Terre": {
    text: "Fire and earth: fire wants to act fast, earth wants to move steadily, a pace to negotiate rather than an obstacle. Well managed, fire warms up earth and earth channels fire into concrete results.",
    score: 3,
  },
  "Air-Eau": {
    text: "Air and water: air thinks and takes distance, water feels and immerses, two different languages that can complement each other (air brings clarity, water brings depth) or miss each other if each stays in its own mode.",
    score: 3,
  },
  "Eau-Feu": {
    text: "Fire and water: a classically intense combination, water can smother fire, fire can boil water. Plenty of passion on both sides, but it takes real conscious work to avoid wearing each other out.",
    score: 2,
  },
  "Air-Terre": {
    text: "Earth and air: earth wants the concrete, air lives in ideas, each can find the other too rigid or too elusive, respectively. The bond is built mainly by learning to translate one's language into the other's.",
    score: 2,
  },
};

const MODALITY_PAIR: Record<string, { text: string; score: number }> = {
  "Cardinal-Cardinal": {
    text: "Two cardinal signs: two natural leaders, full of initiative. The dynamic is stimulating as long as each has their own ground to lead on, the risk is competing over who decides.",
    score: 3,
  },
  "Fixe-Fixe": {
    text: "Two fixed signs: rare loyalty and staying power once the commitment is made. The risk is a standoff if both dig in, neither likes to give in first.",
    score: 3,
  },
  "Mutable-Mutable": {
    text: "Two mutable signs: a lot of mutual flexibility and ease evolving together. The risk is that neither sets a clear direction, for lack of shared grounding.",
    score: 3,
  },
  "Cardinal-Fixe": {
    text: "A cardinal sign and a fixed sign: the cardinal launches projects, the fixed one makes them last, a good complement as long as the fixed sign doesn't experience every new initiative as a threat.",
    score: 4,
  },
  "Cardinal-Mutable": {
    text: "A cardinal sign and a mutable sign: the cardinal drives, the mutable adapts and follows with ease, a dynamic that most often flows naturally.",
    score: 4,
  },
  "Fixe-Mutable": {
    text: "A fixed sign and a mutable sign: the fixed one seeks stability, the mutable one needs variety, a fruitful tension if the fixed sign accepts some change and the mutable one some consistency.",
    score: 3,
  },
};

function pairLookup<T>(map: Record<string, T>, a: string, b: string): T {
  const key = [a, b].sort().join("-");
  return map[key];
}

export function composeSignCompatibilityEn(signA: ZodiacSign, signB: ZodiacSign): SignCompatibility {
  const a = SIGN_META_EN[signA];
  const b = SIGN_META_EN[signB];

  const elementInfo = pairLookup(ELEMENT_PAIR, a.element, b.element);
  const modalityInfo = pairLookup(MODALITY_PAIR, a.modality, b.modality);
  const score = Math.round((elementInfo.score + modalityInfo.score) / 2);

  const strengths = `${a.name} brings ${a.keyword}, ${b.name} brings ${b.keyword}, two strengths that, well combined, enrich each other more than they compete.`;
  const challenges =
    score >= 4
      ? `Little structural friction between ${a.name} and ${b.name}: what matters most plays out elsewhere (Moon, Venus, Mars, Ascendant of each person), not on this level. If friction does show up, it's more likely to come from here: ${a.name} ${SIGN_FRICTION_TRAIT[signA]}, while ${b.name} ${SIGN_FRICTION_TRAIT[signB]}.`
      : `The concrete friction point between ${a.name} and ${b.name}: ${a.name} ${SIGN_FRICTION_TRAIT[signA]}, while ${b.name} ${SIGN_FRICTION_TRAIT[signB]}. Nothing fundamentally incompatible, more a difference in pace or language worked through with awareness and communication.`;
  const advice = `This ${a.name}-${b.name} reading is based on sun signs alone: a real synastry (Moon, Venus, Mars, Ascendant, houses) gives a much finer, more personal picture of the bond between two specific people.`;

  return {
    score,
    elementText: elementInfo.text,
    modalityText: modalityInfo.text,
    strengths,
    challenges,
    advice,
  };
}
