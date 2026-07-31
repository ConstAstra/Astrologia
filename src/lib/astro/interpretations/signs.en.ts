import type { ZodiacSign } from "../types";
import type { SignMeta } from "./signs";

// English mirror of SIGN_META (signs.ts). The `element`/`modality` values
// are kept as the same internal tokens ("Feu", "Cardinal"...) used
// throughout the astro engine and the compatibility scoring tables — they
// are never rendered directly, only mapped to English labels in the pages
// that use this file.
export const SIGN_META_EN: Record<ZodiacSign, SignMeta> = {
  belier: {
    name: "Aries",
    symbol: "♈",
    element: "Feu",
    modality: "Cardinal",
    ruler: "Mars",
    dates: "March 21 – April 19",
    keyword: "impulse and beginnings",
    paragraph:
      "The first sign of the zodiac, Aries embodies the initial spark: spontaneity, directness, a need to act rather than wait. Direct energy, sometimes impatient, oriented toward conquest.",
  },
  taureau: {
    name: "Taurus",
    symbol: "♉",
    element: "Terre",
    modality: "Fixe",
    ruler: "Venus",
    dates: "April 20 – May 20",
    keyword: "stability and sensory pleasure",
    paragraph:
      "Taurus seeks material and sensory security: a love of comfort, patience, and attachment to what lasts. Steady, loyal energy, sometimes resistant to change.",
  },
  gemeaux: {
    name: "Gemini",
    symbol: "♊",
    element: "Air",
    modality: "Mutable",
    ruler: "Mercury",
    dates: "May 21 – June 20",
    keyword: "curiosity and communication",
    paragraph:
      "Gemini lives through the exchange of ideas: curiosity, mental agility, a taste for contact and variety. Mobile energy, sometimes scattered, that needs diversity.",
  },
  cancer: {
    name: "Cancer",
    symbol: "♋",
    element: "Eau",
    modality: "Cardinal",
    ruler: "Moon",
    dates: "June 21 – July 22",
    keyword: "protection and emotional memory",
    paragraph:
      "Cancer navigates by instinct and emotion: a need for emotional security, vivid memory, attachment to home and family. A shell protects a deep sensitivity.",
  },
  lion: {
    name: "Leo",
    symbol: "♌",
    element: "Feu",
    modality: "Fixe",
    ruler: "Sun",
    dates: "July 23 – August 22",
    keyword: "self-expression and radiance",
    paragraph:
      "Leo wants to exist fully and be recognized: generosity, a flair for the dramatic, a need to shine and create. Warm energy, sometimes prideful, centered on self-expression.",
  },
  vierge: {
    name: "Virgo",
    symbol: "♍",
    element: "Terre",
    modality: "Mutable",
    ruler: "Mercury",
    dates: "August 23 – September 22",
    keyword: "analysis and refinement",
    paragraph:
      "Virgo seeks to understand in order to improve: attention to detail, rigor, a concern for being useful and doing things right. Methodical energy, sometimes too demanding of itself.",
  },
  balance: {
    name: "Libra",
    symbol: "♎",
    element: "Air",
    modality: "Cardinal",
    ruler: "Venus",
    dates: "September 23 – October 22",
    keyword: "balance and relationship",
    paragraph:
      "Libra seeks harmony and fairness in relating to others: diplomacy, an aesthetic sense, a need for partnership. Energy that weighs the pros and cons, sometimes indecisive.",
  },
  scorpion: {
    name: "Scorpio",
    symbol: "♏",
    element: "Eau",
    modality: "Fixe",
    ruler: "Pluto (traditionally Mars)",
    dates: "October 23 – November 21",
    keyword: "intensity and transformation",
    paragraph:
      "Scorpio gets to the bottom of things: emotional intensity, magnetism, a taste for secrecy and transformation. Deep energy, sometimes distrustful, that never does anything by halves.",
  },
  sagittaire: {
    name: "Sagittarius",
    symbol: "♐",
    element: "Feu",
    modality: "Mutable",
    ruler: "Jupiter",
    dates: "November 22 – December 21",
    keyword: "expansion and the search for meaning",
    paragraph:
      "Sagittarius aims far: optimism, a love of travel and big ideas, a need for freedom of movement and thought. Enthusiastic energy, sometimes tactless from sheer frankness.",
  },
  capricorne: {
    name: "Capricorn",
    symbol: "♑",
    element: "Terre",
    modality: "Cardinal",
    ruler: "Saturn",
    dates: "December 22 – January 19",
    keyword: "ambition and structure",
    paragraph:
      "Capricorn builds for the long term: a sense of duty, patient ambition, a serious relationship with time and achievement. Disciplined energy, sometimes austere, that grows more confident with age.",
  },
  verseau: {
    name: "Aquarius",
    symbol: "♒",
    element: "Air",
    modality: "Fixe",
    ruler: "Uranus (traditionally Saturn)",
    dates: "January 20 – February 18",
    keyword: "independence and collective spirit",
    paragraph:
      "Aquarius thinks about the future and the collective: independence of mind, originality, commitment to causes larger than oneself. Detached energy, sometimes distant, in love with freedom.",
  },
  poissons: {
    name: "Pisces",
    symbol: "♓",
    element: "Eau",
    modality: "Mutable",
    ruler: "Neptune (traditionally Jupiter)",
    dates: "February 19 – March 20",
    keyword: "intuition and merging",
    paragraph:
      "The last sign of the zodiac, Pisces dissolves boundaries: empathy, imagination, artistic or spiritual sensitivity. Fluid energy, sometimes elusive, in search of an elsewhere.",
  },
};
