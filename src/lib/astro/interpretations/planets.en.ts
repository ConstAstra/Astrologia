import type { PointKey } from "../types";
import type { PlanetMeta } from "./planets";

export const PLANET_META_EN: Record<PointKey, PlanetMeta> = {
  sun: {
    name: "Sun",
    symbol: "☉",
    keyword: "identity, vitality and the will to exist",
    essence:
      "The Sun represents the core of the personality: what one seeks to become, the light one projects, fundamental vitality. Its sign describes a general coloring of character, but it's only one piece of the puzzle among the dozens of positions in the chart.",
    keySpeed: "about 1°/day",
  },
  moon: {
    name: "Moon",
    symbol: "☽",
    keyword: "emotions, emotional needs and security reflexes",
    essence:
      "The Moon describes the inner world: sensitivity, memory, what reassures or worries, the way one reacts in the moment. It's often the most revealing point for understanding a person's deep emotional functioning, sometimes more than the Sun.",
    keySpeed: "about 13°/day, the fastest-moving point in the chart",
  },
  mercury: {
    name: "Mercury",
    symbol: "☿",
    keyword: "thought, communication and the way of learning",
    essence:
      "Mercury governs the mind: how one reasons, speaks, negotiates, absorbs information. Always close to the Sun in the sky, it often nuances its expression.",
    keySpeed: "variable, retrograde several times a year",
  },
  venus: {
    name: "Venus",
    symbol: "♀",
    keyword: "affection, desire, values and the relationship to beauty",
    essence:
      "Venus describes what attracts, what one finds desirable or harmonious, the way of loving and being loved, the relationship to money and aesthetic pleasure.",
    keySpeed: "about 1.2°/day",
  },
  mars: {
    name: "Mars",
    symbol: "♂",
    keyword: "action, desire, assertion and combativeness",
    essence:
      "Mars is the engine of action: the way of charging ahead, defending one's territory, desiring, getting angry. It shows where and how energy engages with the concrete.",
    keySpeed: "about 0.5°/day, retrograde roughly every 2 years",
  },
  jupiter: {
    name: "Jupiter",
    symbol: "♃",
    keyword: "expansion, confidence, the meaning given to life",
    essence:
      "Jupiter shows where one seeks to grow, to believe, to expand, one's philosophy of life, perceived luck, relationship to higher education and distant horizons.",
    keySpeed: "about 12 years to circle the zodiac",
  },
  saturn: {
    name: "Saturn",
    symbol: "♄",
    keyword: "structure, responsibility, discipline and fear",
    essence:
      "Saturn shows where one encounters limits, demands, a need to build for the long term, often experienced first as a constraint, then as a strength once the lesson is integrated.",
    keySpeed: "about 29 years to circle the zodiac",
  },
  uranus: {
    name: "Uranus",
    symbol: "♅",
    keyword: "rupture, independence, the unexpected and innovation",
    essence:
      "Uranus, a slow, generational planet, shows where one needs freedom and where sudden breaks, abrupt realizations and the urge to step outside the frame occur.",
    keySpeed: "about 84 years to circle the zodiac",
  },
  neptune: {
    name: "Neptune",
    symbol: "♆",
    keyword: "imagination, ideals, merging and blurred boundaries",
    essence:
      "Neptune, also generational, dissolves boundaries: intuition, spirituality, art, but also illusion and escape. Its natal house is often more telling than its sign.",
    keySpeed: "about 165 years to circle the zodiac",
  },
  pluto: {
    name: "Pluto",
    symbol: "♇",
    keyword: "transformation, power and buried areas",
    essence:
      "Pluto, also generational, points to processes of deep transformation, what must die to be reborn, power dynamics and taboo or buried areas.",
    keySpeed: "10 to 30 years per sign depending on the era (elliptical orbit)",
  },
  northNode: {
    name: "North Node (mean)",
    symbol: "☊",
    keyword: "the axis of growth and life lessons",
    essence:
      "The North Node isn't a physical body but a geometric point: the intersection of the Moon's orbit and the ecliptic. It shows a direction of growth to embrace, while the South Node (180° away) shows already-familiar ground, a comfort zone not to over-invest in.",
    keySpeed: "moves slowly backward, one full cycle in ~18.6 years",
  },
  asc: {
    name: "Ascendant",
    symbol: "ASC",
    keyword: "the social mask, bearing, first impression given",
    essence:
      "The Ascendant is the sign that was rising on the eastern horizon at the moment of birth. It colors appearance, immediate reflexes, the way of approaching the world, often perceived by others even before the Sun.",
    keySpeed: "very fast: changes sign roughly every 2 hours",
  },
  mc: {
    name: "Midheaven",
    symbol: "MC",
    keyword: "vocation, social image and visible achievement",
    essence:
      "The Midheaven marks the peak of the chart: the image one projects in society, professional direction, what one wants to be recognized for.",
    keySpeed: "very fast, like the Ascendant",
  },
  desc: {
    name: "Descendant",
    symbol: "DSC",
    keyword: "relating to others and what one seeks in partnership",
    essence:
      "Opposite the Ascendant, the Descendant describes what one projects onto others and seeks in a partnership, often what completes us or attracts us in a partner.",
    keySpeed: "very fast, exact opposite of the Ascendant",
  },
  ic: {
    name: "Imum Coeli",
    symbol: "IC",
    keyword: "roots, family and intimacy",
    essence:
      "Opposite the Midheaven, the Imum Coeli evokes family roots, home, intimacy and what is silently passed down from one generation to the next.",
    keySpeed: "very fast, exact opposite of the Midheaven",
  },
  fortune: {
    name: "Part of Fortune",
    symbol: "⊕",
    keyword: "harmony between body, soul and circumstances",
    essence:
      "A traditional Arabic point combining the Ascendant, Sun and Moon, the Part of Fortune shows an area where things tend to flow naturally, a zone of relative ease and well-being.",
    keySpeed: "depends on the positions of the Sun and Moon",
  },
  juno: {
    name: "Juno",
    symbol: "⚵",
    keyword: "commitment, the partnership contract and what it takes to feel truly bonded",
    essence:
      "Juno is the asteroid most associated with romantic commitment: where Venus describes what attracts and Mars what excites, Juno describes what's actually needed to stay, to build a real long-term partnership rather than just an attraction. Its sign and house point to the kind of bond that holds, and to what, in a relationship, can land as betrayal or unfairness if it isn't honored.",
    keySpeed: "about 4.4 years to circle the zodiac",
  },
  vertex: {
    name: "Vertex",
    symbol: "Vx",
    keyword: "meetings that feel fated, connections nobody saw coming",
    essence:
      "The Vertex is a calculated point, not a planet: sometimes described as a \"second Descendant,\" it marks a spot in the chart tied to encounters that feel more like fate than choice. In synastry, a contact between one person's Vertex and the other's personal planets or Ascendant is often noted as a sign of a marking, almost unavoidable-feeling connection.",
    keySpeed: "a calculated point, doesn't move across the sky",
  },
};
