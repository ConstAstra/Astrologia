import type { PointKey } from "../types";

const PAIR_THEMES_EN: Partial<Record<string, string>> = {
  "moon-sun":
    "The chart's most structuring axis: the alignment — or the tension — between what you consciously seek to become (Sun) and what you need to feel secure (Moon).",
  "mercury-sun":
    "The relationship between core identity and the way of thinking and expressing oneself. Since Mercury is never far from the Sun in the sky, this aspect is almost always some form of conjunction.",
  "sun-venus":
    "The relationship between self-assertion and the capacity to love, to appreciate beauty, and to feel worthy of being desired.",
  "mars-sun":
    "The relationship between conscious will and the capacity to act, to assert oneself, to concretely defend one's desires.",
  "jupiter-sun":
    "The relationship between identity and the capacity to believe in oneself, to think big, to seize opportunities as they arise.",
  "saturn-sun":
    "The relationship between the drive to exist and a sense of limits, responsibility and authority — one's own, and the authority inherited from others.",
  "asc-sun": "The relationship between who one deeply is (Sun) and the image one spontaneously projects (Ascendant).",
  "mc-sun": "The relationship between core identity and one's vocation, the public direction a life takes.",
  "mercury-moon":
    "The relationship between emotion and thought: how much feeling influences — or doesn't — the way of reasoning and expressing oneself.",
  "moon-venus":
    "The relationship between the need for emotional security and the capacity to love and appreciate — an axis often visible in the way one behaves in a couple.",
  "mars-moon":
    "The relationship between sensitivity and the instinct to act: how emotions translate, or don't, into immediate reaction.",
  "jupiter-moon":
    "The relationship between the need for security and trust in life — often associated with emotional optimism or spontaneous emotional generosity.",
  "moon-saturn":
    "The relationship between emotional need and fear, control or emotional restraint — an axis frequently linked to one's upbringing.",
  "asc-moon": "The relationship between the inner world and the way one spontaneously presents to others.",
  "mercury-venus":
    "The relationship between thought and taste, between reasoning and an aesthetic or relational sense. As with Mercury-Sun, these two planets always stay close in the sky.",
  "mars-mercury":
    "The relationship between thought and action: quickness of mind, speed of speech, the way of arguing or deciding quickly.",
  "jupiter-mercury":
    "The relationship between detail and the big picture, between the analytical mind and broad thinking — knowing how to go deep without losing the overall thread, or the reverse.",
  "mercury-saturn":
    "The relationship between thought and structure: intellectual rigor, a sharp critical sense, sometimes mental anxiety or deliberate slowness.",
  "mars-venus":
    "The classic axis of desire and attraction: how one seduces and is seduced, how pleasure and action intertwine.",
  "jupiter-venus":
    "The relationship between pleasure and abundance: emotional generosity, a taste for comfort, a tendency toward pleasant excess.",
  "saturn-venus":
    "The relationship between the desire to love and the fear of not being loved — often linked to a serious attachment, sometimes inhibited at first but reliable over time.",
  "jupiter-mars":
    "The relationship between action and ambition: enterprising energy, confidence in action, sometimes excess assurance or haste.",
  "mars-saturn":
    "The relationship between the drive to act and limits: a source of frustration if poorly integrated, a source of discipline and endurance if well handled.",
  "jupiter-saturn":
    "The great relationship between expansion and structure: daring to grow while accepting realistic limits. Their cycle paces the decades (a generational dimension), but the house it plays out in remains personal.",
};

function pairKey(a: PointKey, b: PointKey): string {
  return [a, b].sort().join("-");
}

// isRomanticCodedPair (the set of flagged pairs) is locale-independent —
// reuse the one exported from pair-themes.ts rather than duplicating it.
export function getPairThemeEn(a: PointKey, b: PointKey): string | undefined {
  return PAIR_THEMES_EN[pairKey(a, b)];
}
