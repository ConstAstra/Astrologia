import type { HouseMeta } from "./houses";

export const HOUSE_META_EN: HouseMeta[] = [
  {
    number: 1,
    name: "House I: Identity",
    keyword: "the self, the body, the image projected",
    paragraph:
      "The most personal angular house: the way of approaching the world, appearance, spontaneous reflexes. A planet here weighs heavily on the personality on display. Living this house fully means learning that the image shown to the world can evolve without betraying who one really is underneath, rigidifying it means getting stuck playing a first role forever.",
  },
  {
    number: 2,
    name: "House II: Resources",
    keyword: "money, values, material security",
    paragraph:
      "What one owns and how one earns, keeps or spends it; more broadly, one's personal scale of values and relationship to material security. Here, the real challenge is telling apart real security, built over time, from the illusory kind chased through accumulation that never quite feels like enough.",
  },
  {
    number: 3,
    name: "House III: Communication",
    keyword: "speech, siblings, close surroundings",
    paragraph:
      "Everyday learning, communication, short trips, siblings, immediate environment and intellectual exchange. Lived well, this house teaches listening as much as speaking, lived poorly, it can stay stuck at surface-level exchange, never quite deepening into a real conversation.",
  },
  {
    number: 4,
    name: "House IV: Roots",
    keyword: "home, family, foundations",
    paragraph:
      "The angular house of roots: the family of origin, the feeling of \"home,\" the psychological inheritance passed down. Often linked to the more internalized parent. Growing through this house means learning to separate the family inheritance received from what one consciously chooses to keep or transform for oneself.",
  },
  {
    number: 5,
    name: "House V: Creation",
    keyword: "pleasure, creativity, children, playful love",
    paragraph:
      "Creative and personal expression: romance, pleasure, play, deliberate risk-taking, children, everything to do with the joyful assertion of self. The limit to watch for here is confusing self-expression with the need for constant validation, real creativity can also flourish without an audience.",
  },
  {
    number: 6,
    name: "House VI: Daily life",
    keyword: "work, health, routines",
    paragraph:
      "The organization of daily life: concrete work, service rendered, health and bodily habits, a sense of useful detail. Where one \"gets their hands dirty.\" The trap of this house is getting lost in service to others to the point of neglecting one's own health, what it actually takes is caring for oneself with the same rigor applied to work.",
  },
  {
    number: 7,
    name: "House VII: Relationships",
    keyword: "partnership, others faced as equals",
    paragraph:
      "The angular house of relating to others as equals: partnership, marriage, but also declared opponents. Often what one seeks (or avoids) in a partner. What's sought or avoided in a partner here often reveals an unintegrated part of oneself, it means learning to recognize the partner as a mirror rather than just a complement.",
  },
  {
    number: 8,
    name: "House VIII: Transformation",
    keyword: "intimacy, shared resources, crises",
    paragraph:
      "What escapes direct control: sexuality, other people's money (inheritance, credit, taxes), grief and deep transformation. A demanding house, but often rich in growth. What's being worked on here is accepting to lose control at times, in trust, rather than trying to master everything in a domain that, by nature, resists sheer will.",
  },
  {
    number: 9,
    name: "House IX: Horizons",
    keyword: "higher education, travel, philosophy",
    paragraph:
      "Opening onto something bigger: long-distance travel, higher education, beliefs, the search for meaning and truth. The urge to expand one's map of the world. The risk here is mistaking the accumulation of knowledge or travel for real inner transformation, what matters is letting what's actually discovered change how one sees, not just widen the surface.",
  },
  {
    number: 10,
    name: "House X: Vocation",
    keyword: "career, reputation, social status",
    paragraph:
      "The most \"public\" angular house: vocation, visible success, authority, social image. What one wants to be recognized for in the world. The trap of this house is measuring one's worth only by visible success, the whole lesson is separating real accomplishment from social recognition, which always stays subject to change.",
  },
  {
    number: 11,
    name: "House XI: Network",
    keyword: "friends, collective projects, ideals",
    paragraph:
      "Chosen circles of belonging: friendships, groups, networks, collective projects and ideals for the future. A house turned toward tomorrow and toward community. Growing here means choosing one's circles based on who one really is, rather than the need to belong to a group at any cost.",
  },
  {
    number: 12,
    name: "House XII: Inner world",
    keyword: "the unconscious, withdrawal, what escapes control",
    paragraph:
      "The most elusive house: inner life, the unconscious, quiet ordeals, spirituality, the need for withdrawal. What acts \"behind the scenes,\" sometimes unbeknownst to oneself. This house asks to honor the need for withdrawal without living it as an escape, what's worked through in the shadows often quietly feeds everything else visible in the chart.",
  },
];

// See ASCENDANT_RULER_HOUSE_LINE in houses.ts for the rationale.
export const ASCENDANT_RULER_HOUSE_LINE_EN: Record<number, string> = {
  1: "Here, it nearly merges with your image and your first instincts: you exist largely through the way you show up in the world, from the very first moment.",
  2: "Here, it's built through what you own and your relationship to material security: what you build concretely matters a great deal for your sense of self.",
  3: "Here, it's built through speech, learning, and everyday exchange: you exist largely through what you say, hear, and learn.",
  4: "Here, it's built through home and family inheritance: your sense of self stays closely tied to your roots and to what was passed down before you.",
  5: "Here, it's built through creative expression and unguarded pleasure: you feel most yourself when creating, playing, or asserting yourself without holding back.",
  6: "Here, it's built through what's useful and concrete: work well done, health, and daily habits matter a great deal for your sense of self.",
  7: "Here, it's built largely through contact with others: it's often through the mirror of a partner or a close relationship that you learn who you really are.",
  8: "Here, it's built through what escapes direct control: crises, deep intimacy, and major transformations are often what reveal you to yourself.",
  9: "Here, it's built through the search for meaning and the pull toward somewhere else: you feel most yourself while widening your horizon, through study, travel, or a philosophy of life that's genuinely your own.",
  10: "Here, it's built through visible achievement and the place you take in the world: what you want to be recognized for matters a great deal for your sense of self.",
  11: "Here, it's built through the circles you choose and the projects you share: you exist largely through what you build with a group, with friends, or for a cause bigger than yourself.",
  12: "Here, it's built largely in the shadows: inner life, withdrawal, and whatever stays private or invisible to others matter more than usual for your sense of self.",
};
