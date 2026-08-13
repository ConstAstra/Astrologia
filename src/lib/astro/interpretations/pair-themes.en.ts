import type { PointKey } from "../types";

const PAIR_THEMES_EN: Partial<Record<string, string>> = {
  "moon-sun":
    "The chart's most structuring axis: the alignment — or the tension — between what you consciously seek to become (Sun) and what you need to feel secure (Moon). When the two line up, identity and emotional need move in the same direction; when they diverge, one part of you chases a goal that another part unwittingly sabotages, until both are consciously reconciled.",
  "mercury-sun":
    "The relationship between core identity and the way of thinking and expressing oneself. Since Mercury is never far from the Sun in the sky, this aspect is almost always some form of conjunction: the way of speaking and reasoning becomes a direct extension of who one is, rarely a neutral tool detached from the ego.",
  "sun-venus":
    "The balance between self-assertion and the capacity to love, to appreciate beauty, and to feel worthy of being desired. This axis plays out especially in romantic self-worth: can one fully assert oneself while staying lovable, or does one pole always end up overriding the other?",
  "mars-sun":
    "The dialogue between conscious will and the capacity to act, to assert oneself, to concretely defend one's desires. When this axis works well, wanting and doing go together; otherwise, identity knows what it wants without ever translating it into action, or acts without quite knowing why.",
  "jupiter-sun":
    "The fertile tension between identity and the capacity to believe in oneself, to think big, to seize opportunities as they arise. This is the axis of foundational confidence: how far does self-worth allow for taking risks and hoping for more than what's already familiar?",
  "saturn-sun":
    "The interplay between the drive to exist and a sense of limits, responsibility and authority — one's own, and the authority inherited from others. This axis often sets the pace at which self-confidence gets built: slowly and solidly, or in a permanent tension between wanting to exist and fearing not measuring up.",
  "asc-sun":
    "What plays out between who one deeply is (Sun) and the image one spontaneously projects (Ascendant). The wider the gap between the two, the more likely a sense of mismatch between how one feels inside and how others read them at first glance.",
  "mc-sun":
    "The bond between core identity and one's vocation, the public direction a life takes. This axis shows whether the career or social path chosen actually expresses who one is, or stays a role played without any deep connection to identity.",
  "mercury-moon":
    "The relationship between emotion and thought: how much feeling influences — or doesn't — the way of reasoning and expressing oneself. This axis determines whether one speaks from what's felt or keeps a distance between the two, at the risk of either emotional confusion or a coldness cut off from inner experience.",
  "moon-venus":
    "The balance between the need for emotional security and the capacity to love and appreciate — an axis often visible in the way one behaves in a couple. It reveals whether attachment is built on genuine desire for the other person, or mainly on a need to fill a gap in inner security.",
  "mars-moon":
    "The dialogue between sensitivity and the instinct to act: how emotions translate, or don't, into immediate reaction. This axis shows whether one acts directly under the pull of emotion, or whether a delay — even a block — sets in between what's felt and what's done.",
  "jupiter-moon":
    "The fertile tension between the need for security and trust in life — often associated with emotional optimism or spontaneous emotional generosity. This axis shapes the capacity to feel secure without everything being controlled or guaranteed in advance.",
  "moon-saturn":
    "The interplay between emotional need and fear, control or emotional restraint — an axis frequently linked to one's upbringing. It often determines whether one learned, as a child, that emotional needs were legitimate, or that they needed to be mastered so as not to be a burden.",
  "asc-moon":
    "What plays out between the inner world and the way one spontaneously presents to others. This axis shows whether what's shown at first glance faithfully reflects what's felt inside, or whether a protective distance sits between the two.",
  "mercury-venus":
    "The bond between thought and taste, between reasoning and an aesthetic or relational sense. As with Mercury-Sun, these two planets always stay close in the sky: the way one talks about love, beauty or pleasure is rarely separable from the general way of thinking and communicating.",
  "mars-mercury":
    "The relationship between thought and action: quickness of mind, speed of speech, the way of arguing or deciding quickly. This axis determines whether reflection comes before action, or whether one acts first and understands after — each logic carrying its own strengths and blind spots.",
  "jupiter-mercury":
    "The balance between detail and the big picture, between the analytical mind and broad thinking — knowing how to go deep without losing the overall thread, or the reverse. This axis reveals whether one naturally favors precision at the risk of losing perspective, or the opposite.",
  "mercury-saturn":
    "The dialogue between thought and structure: intellectual rigor, a sharp critical sense, sometimes mental anxiety or deliberate slowness. This axis shows whether rigor feeds clarity of thought or turns into permanent doubt that prevents ever reaching a conclusion.",
  "mars-venus":
    "The classic axis of desire and attraction: how one seduces and is seduced, how pleasure and action intertwine. It reveals whether desire is expressed directly and without detour, or whether it runs into tension between wanting to take and wanting to please.",
  "jupiter-venus":
    "The fertile tension between pleasure and abundance: emotional generosity, a taste for comfort, a tendency toward pleasant excess. This axis shapes the capacity to fully enjoy without guilt, with the risk, if poorly integrated, of confusing pleasure with an escape into comfort.",
  "saturn-venus":
    "The interplay between the desire to love and the fear of not being loved — often linked to a serious attachment, sometimes inhibited at first but reliable over time. This axis shows whether love is built cautiously out of fear of rejection, or whether that caution, once worked through, becomes a real strength of constancy.",
  "jupiter-mars":
    "What plays out between action and ambition: enterprising energy, confidence in action, sometimes excess assurance or haste. This axis reveals whether enthusiasm translates into concrete results or stays stuck at the stage of a burst of energy that never quite lands.",
  "mars-saturn":
    "The bond between the drive to act and limits: a source of frustration if poorly integrated, a source of discipline and endurance if well handled. This axis determines whether the brake felt pushes toward better channeling one's energy, or ends up smothering it entirely.",
  "jupiter-saturn":
    "The great relationship between expansion and structure: daring to grow while accepting realistic limits. Their cycle paces the decades (a generational dimension), but the house it plays out in remains personal — that's where each person's own balance between ambition and realism is actually visible.",

  // Pairs involving Uranus, Neptune or Pluto — the "generational planets".
  // Their slow orbits make them rare in an individual natal chart (usually
  // just a wide aspect, or a whole generation's shared conjunction), but
  // they show up constantly in TRANSITS to personal points. Without a pair
  // theme here, a Neptune, Uranus or Pluto transit read as a generic aspect
  // sentence, cut off from what that planet actually represents (rupture,
  // dissolution, transformation).
  "jupiter-neptune":
    "The meeting between expansion and the ideal: generosity, faith in life, an almost mystical kind of inspiration — real fuel for believing in something bigger than oneself. This axis shows whether that trust feeds concrete projects, or dissolves into promises never kept, an optimism that carefully avoids the reality check.",
  "jupiter-pluto":
    "The relationship between ambition and the power to transform: a hunger to grow that won't settle for less, willing to rebuild everything to go further. This axis reveals whether this intensity serves real evolution, or tips into excess — a need to control everything in order to feel safe while expanding.",
  "jupiter-uranus":
    "The bond between expansion and rupture: sudden opportunities, lucky breaks, a need to change course without warning in order to keep growing. This axis shows whether that freedom fuels real growth, or stays at the level of constant restlessness that never quite builds anything lasting.",
  "mars-neptune":
    "The dialogue between action and inspiration: energy that can serve a cause, an art form or an ideal, with the risk of scattering into vagueness or lacking concrete direction. This axis shows whether the drive finds real ground to act on, or wears itself out in hesitation, waiting for a sign that never quite comes.",
  "mars-pluto":
    "One of the most intense axes in the chart: the will to act meets the power to transform, producing a rare depth of determination. This axis shows whether that power channels into rightful, owned action, or turns into repressed anger — a constant power struggle with oneself or with others.",
  "mars-uranus":
    "The relationship between action and the unexpected: quick, sometimes explosive reactions, an allergy to anything that restrains or slows things down. This axis shows whether that energy serves real independence of action, or mostly shows up as impulsiveness that's hard to channel over time.",
  "mercury-neptune":
    "The link between thought and imagination: fine intuition, artistic sensitivity, a capacity to perceive what pure logic misses. This axis shows whether that porousness feeds real creativity, or blurs thinking to the point of making clear decisions difficult, muddling the real and the imagined.",
  "mercury-pluto":
    "The relationship between thought and depth: a mind that's never satisfied with surface explanations, capable of digging into a subject to the point of obsession. This axis shows whether that mental intensity feeds real insight, or turns into rumination — a suspicion that reads hidden meaning into everything.",
  "mercury-uranus":
    "The link between thought and flashes of insight: ideas that surface without warning, a way of thinking that runs against the grain. This axis shows whether that originality expresses itself usefully and gets communicated, or stays mental restlessness — jumping between subjects and losing the listener along the way.",
  "moon-neptune":
    "One of the most porous axes in the chart: a sensitivity that picks up on everything, sometimes before even understanding where it came from, with an empathy that easily blurs one's own emotions with other people's. This axis shows whether that porousness feeds real emotional intuition, or leaves one exposed to burnout for lack of clear boundaries.",
  "moon-pluto":
    "The relationship between emotional need and intensity: feelings that are never lived halfway, deep attachments, sometimes tinged with possessiveness or distrust. This axis shows whether that intensity feeds real, transformative bonds, or locks one into a need to control everything in order to feel safe.",
  "moon-uranus":
    "The link between the need for security and the need for independence: a sensitivity that needs room to breathe, uneasy with emotional routines that feel too predictable. This axis shows whether that freedom is lived peacefully, or sets up emotional instability — one foot always out the door, even in bonds that matter.",
  "neptune-saturn":
    "The tension between the real and the ideal: structure and rigor on one side, doubt and a need for meaning on the other. This axis shows whether that tension pushes toward building something solid in service of an ideal, or sets up a chronic discouragement — the sense that nothing concrete will ever live up to the dream.",
  "neptune-sun":
    "The relationship between identity and inspiration: a part of the self drawn to whatever goes beyond the ego, to merging with something bigger — an ideal, a cause, a spiritual or artistic practice. This axis shows whether that longing feeds a wider, more generous identity, or dilutes the sense of who one is into confusion.",
  "neptune-venus":
    "One of the most idealistic axes in the chart when it comes to attraction: a love that seeks fusion, romance, sometimes to the point of illusion about the other person. This axis shows whether that dreamy streak feeds a real capacity to love without calculation, or leaves one seeing in the other what one wants to see rather than what's actually there.",
  "pluto-saturn":
    "The link between structure and deep transformation: a capacity to hold steady through hardship, to methodically rebuild what's been destroyed. This axis shows whether that endurance serves real regeneration, or hardens into rigidity — a refusal to let go of structures that have become obsolete, out of fear of the void.",
  "pluto-sun":
    "One of the most intense axes in the chart: conscious identity meets deep forces of transformation, power, sometimes survival. This axis shows whether that power serves a genuine regeneration of who one is, or turns into a need for control — a power struggle with oneself or with authority figures.",
  "pluto-venus":
    "An axis of intense attraction: bonds that are never lived by half-measures, a real capacity for fascination and deep commitment. This axis shows whether that intensity feeds relationships that genuinely transform, or slides into possessiveness, jealousy, a need to fully merge with the other person to feel safe.",
  "saturn-uranus":
    "The classic tension between structure and rupture: the need for solidity and continuity runs up against the need for freedom and change. This axis shows whether that friction pushes toward innovating without tearing everything down — evolving a structure from within — or sets up a permanent conflict between staying and leaving.",
  "sun-uranus":
    "The relationship between identity and the need to stand apart: a part of the self that refuses to blend into the mold, that needs to be recognized for what sets it apart from others. This axis shows whether that difference is owned peacefully, or shows up as permanent rebellion — a need for rupture that makes it hard to put down roots anywhere.",
  "uranus-venus":
    "An axis of attraction to the unexpected: a magnetism that tends to switch on outside the usual boxes, a need for freedom that doesn't take well to overly predictable bonds. This axis shows whether that independence feeds relationships that stay alive and unconventional, or keeps one from truly committing, out of fear of losing one's freedom.",
  "asc-neptune":
    "What plays out between the spontaneous image and the blur: a presence that feels elusive, sometimes magnetic, sometimes hard for others to pin down — as if people project onto it a little of what they want to see. This axis shows whether that mystery draws people in and inspires, or sets up a recurring misunderstanding about who one really is at first glance.",
  "asc-pluto":
    "What plays out between the spontaneous image and intensity: a presence that leaves a mark, sometimes read as magnetic, sometimes as unintentionally intimidating. This axis shows whether that natural magnetism opens up exchanges, or sets up distance — others hesitating to approach a presence they sense is powerful but hard to read.",
  "asc-uranus":
    "What plays out between the spontaneous image and the unpredictable: a way of showing up that surprises, that never quite matches expectations. This axis shows whether that singularity is lived as an owned, original strength, or sets up a constant sense of mismatch with others, from the very first glance.",
  "mc-neptune":
    "The link between vocation and inspiration: a professional or social path that needs meaning, art, or a dimension beyond simple material gain. This axis shows whether that longing finds a concrete direction, or shows up as a chronic difficulty choosing a path, for lack of clear enough landmarks.",
  "mc-pluto":
    "The link between vocation and power: a professional path marked by deep upheavals, sometimes complete career rebuilds. This axis shows whether that intensity serves a genuine transformation toward more authenticity, or shows up as complicated power dynamics with hierarchy or authority.",
  "mc-uranus":
    "The link between vocation and innovation: a professional path that needs freedom, originality, and doesn't take well to overly rigid frameworks. This axis shows whether that independence feeds a genuinely singular trajectory, or shows up as repeated career ruptures, for lack of a structure flexible enough to settle into.",
  "neptune-uranus":
    "A rare axis at the individual scale, given how slow their cycle is: the meeting between rupture and the dissolving of shared reference points, usually more legible as the backdrop of an entire generation than as a truly personal signature. In the chart, it's mainly the house it occupies that shows where this collective tension between change and questioning plays out concretely in a life.",
  "neptune-pluto":
    "The slowest axis in the chart, unfolding across several generations: the meeting between the dissolving of shared reference points and the deep transformation of collective structures. Rarely a personal signature on its own, it mainly shows up through the house it occupies — where an entire generation is led to reinvent what it believes in.",
  "pluto-uranus":
    "A notable generational axis, often associated with periods of radical upheaval and a deep questioning of established structures. In an individual chart, the house it occupies is the key detail: that's where this collective tension between rupture and transformation takes on a personal color.",
};

function pairKey(a: PointKey, b: PointKey): string {
  return [a, b].sort().join("-");
}

// isRomanticCodedPair (the set of flagged pairs) is locale-independent —
// reuse the one exported from pair-themes.ts rather than duplicating it.
export function getPairThemeEn(a: PointKey, b: PointKey): string | undefined {
  return PAIR_THEMES_EN[pairKey(a, b)];
}
