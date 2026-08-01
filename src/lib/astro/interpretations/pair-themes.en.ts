import type { PointKey } from "../types";

const PAIR_THEMES_EN: Partial<Record<string, string>> = {
  "moon-sun":
    "The chart's most structuring axis: the alignment — or the tension — between what you consciously seek to become (Sun) and what you need to feel secure (Moon). When the two line up, identity and emotional need move in the same direction; when they diverge, one part of you chases a goal that another part unwittingly sabotages, until both are consciously reconciled.",
  "mercury-sun":
    "The relationship between core identity and the way of thinking and expressing oneself. Since Mercury is never far from the Sun in the sky, this aspect is almost always some form of conjunction: the way of speaking and reasoning becomes a direct extension of who one is, rarely a neutral tool detached from the ego.",
  "sun-venus":
    "The relationship between self-assertion and the capacity to love, to appreciate beauty, and to feel worthy of being desired. This axis plays out especially in romantic self-worth: can one fully assert oneself while staying lovable, or does one pole always end up overriding the other?",
  "mars-sun":
    "The relationship between conscious will and the capacity to act, to assert oneself, to concretely defend one's desires. When this axis works well, wanting and doing go together; otherwise, identity knows what it wants without ever translating it into action, or acts without quite knowing why.",
  "jupiter-sun":
    "The relationship between identity and the capacity to believe in oneself, to think big, to seize opportunities as they arise. This is the axis of foundational confidence: how far does self-worth allow for taking risks and hoping for more than what's already familiar?",
  "saturn-sun":
    "The relationship between the drive to exist and a sense of limits, responsibility and authority — one's own, and the authority inherited from others. This axis often sets the pace at which self-confidence gets built: slowly and solidly, or in a permanent tension between wanting to exist and fearing not measuring up.",
  "asc-sun":
    "The relationship between who one deeply is (Sun) and the image one spontaneously projects (Ascendant). The wider the gap between the two, the more likely a sense of mismatch between how one feels inside and how others read them at first glance.",
  "mc-sun":
    "The relationship between core identity and one's vocation, the public direction a life takes. This axis shows whether the career or social path chosen actually expresses who one is, or stays a role played without any deep connection to identity.",
  "mercury-moon":
    "The relationship between emotion and thought: how much feeling influences — or doesn't — the way of reasoning and expressing oneself. This axis determines whether one speaks from what's felt or keeps a distance between the two, at the risk of either emotional confusion or a coldness cut off from inner experience.",
  "moon-venus":
    "The relationship between the need for emotional security and the capacity to love and appreciate — an axis often visible in the way one behaves in a couple. It reveals whether attachment is built on genuine desire for the other person, or mainly on a need to fill a gap in inner security.",
  "mars-moon":
    "The relationship between sensitivity and the instinct to act: how emotions translate, or don't, into immediate reaction. This axis shows whether one acts directly under the pull of emotion, or whether a delay — even a block — sets in between what's felt and what's done.",
  "jupiter-moon":
    "The relationship between the need for security and trust in life — often associated with emotional optimism or spontaneous emotional generosity. This axis shapes the capacity to feel secure without everything being controlled or guaranteed in advance.",
  "moon-saturn":
    "The relationship between emotional need and fear, control or emotional restraint — an axis frequently linked to one's upbringing. It often determines whether one learned, as a child, that emotional needs were legitimate, or that they needed to be mastered so as not to be a burden.",
  "asc-moon":
    "The relationship between the inner world and the way one spontaneously presents to others. This axis shows whether what's shown at first glance faithfully reflects what's felt inside, or whether a protective distance sits between the two.",
  "mercury-venus":
    "The relationship between thought and taste, between reasoning and an aesthetic or relational sense. As with Mercury-Sun, these two planets always stay close in the sky: the way one talks about love, beauty or pleasure is rarely separable from the general way of thinking and communicating.",
  "mars-mercury":
    "The relationship between thought and action: quickness of mind, speed of speech, the way of arguing or deciding quickly. This axis determines whether reflection comes before action, or whether one acts first and understands after — each logic carrying its own strengths and blind spots.",
  "jupiter-mercury":
    "The relationship between detail and the big picture, between the analytical mind and broad thinking — knowing how to go deep without losing the overall thread, or the reverse. This axis reveals whether one naturally favors precision at the risk of losing perspective, or the opposite.",
  "mercury-saturn":
    "The relationship between thought and structure: intellectual rigor, a sharp critical sense, sometimes mental anxiety or deliberate slowness. This axis shows whether rigor feeds clarity of thought or turns into permanent doubt that prevents ever reaching a conclusion.",
  "mars-venus":
    "The classic axis of desire and attraction: how one seduces and is seduced, how pleasure and action intertwine. It reveals whether desire is expressed directly and without detour, or whether it runs into tension between wanting to take and wanting to please.",
  "jupiter-venus":
    "The relationship between pleasure and abundance: emotional generosity, a taste for comfort, a tendency toward pleasant excess. This axis shapes the capacity to fully enjoy without guilt, with the risk, if poorly integrated, of confusing pleasure with an escape into comfort.",
  "saturn-venus":
    "The relationship between the desire to love and the fear of not being loved — often linked to a serious attachment, sometimes inhibited at first but reliable over time. This axis shows whether love is built cautiously out of fear of rejection, or whether that caution, once worked through, becomes a real strength of constancy.",
  "jupiter-mars":
    "The relationship between action and ambition: enterprising energy, confidence in action, sometimes excess assurance or haste. This axis reveals whether enthusiasm translates into concrete results or stays stuck at the stage of a burst of energy that never quite lands.",
  "mars-saturn":
    "The relationship between the drive to act and limits: a source of frustration if poorly integrated, a source of discipline and endurance if well handled. This axis determines whether the brake felt pushes toward better channeling one's energy, or ends up smothering it entirely.",
  "jupiter-saturn":
    "The great relationship between expansion and structure: daring to grow while accepting realistic limits. Their cycle paces the decades (a generational dimension), but the house it plays out in remains personal — that's where each person's own balance between ambition and realism is actually visible.",
};

function pairKey(a: PointKey, b: PointKey): string {
  return [a, b].sort().join("-");
}

// isRomanticCodedPair (the set of flagged pairs) is locale-independent —
// reuse the one exported from pair-themes.ts rather than duplicating it.
export function getPairThemeEn(a: PointKey, b: PointKey): string | undefined {
  return PAIR_THEMES_EN[pairKey(a, b)];
}
