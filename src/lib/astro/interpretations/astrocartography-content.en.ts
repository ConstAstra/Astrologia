import type { PlanetKey } from "../types";
import type { LineTypeKey } from "./astrocartography-content";

export const LINE_TYPE_META_EN: Record<LineTypeKey, { name: string; explanation: string }> = {
  MC: {
    name: "Midheaven line (MC)",
    explanation:
      "Where the planet was exactly culminating at the Midheaven at the moment of birth: it colors public life, vocation, and the social image of whoever settles there.",
  },
  IC: {
    name: "Imum Coeli line (IC)",
    explanation:
      "Where the planet was exactly at the Imum Coeli: it influences inner life, home, roots and intimacy for whoever settles there.",
  },
  AC: {
    name: "Ascendant line (AC)",
    explanation:
      "Where the planet was exactly rising on the eastern horizon: it strongly colors the personality on display and daily life for whoever settles there.",
  },
  DC: {
    name: "Descendant line (DC)",
    explanation:
      "Where the planet was exactly setting on the western horizon: it influences encounters and one-on-one relationships for whoever settles there.",
  },
};

export const ASTROCARTO_TEXT_EN: Record<PlanetKey, Partial<Record<LineTypeKey, string>>> = {
  sun: {
    MC: "Visibility, recognition, opportunities to shine professionally — a good place to make a name for yourself, sometimes at the cost of increased pressure on public image.",
    IC: "A place where you feel at home in an almost solar way: pride in the home you've built, but sometimes a need to dominate family life.",
    AC: "Boosted vitality and self-confidence, a presence that asserts itself more naturally — at the risk of a more exposed ego than elsewhere.",
    DC: "Notable encounters with assertive personalities, sometimes solar themselves; partnerships take on particular importance here.",
  },
  moon: {
    MC: "A public life tied to care, hosting the public, or a fluctuating fame; the need for emotional security creeps into professional life too.",
    IC: "A strong sense of attachment to the place, almost a cocoon; favorable for building a home, but with raw emotional sensitivity.",
    AC: "Heightened emotional receptivity, a greater need for security in daily life — mood becomes more porous to the surroundings here.",
    DC: "Relationships marked by a need for nesting and emotional closeness; encounters here often have a familiar, almost family-like tone.",
  },
  mercury: {
    MC: "A career oriented toward communication, writing, commerce or teaching; excellent for negotiating, writing, learning in public.",
    IC: "A home full of exchange and discussion, sometimes restless with mental activity; favorable for intellectual work done from home.",
    AC: "A sharper mind, faster speech, curiosity stimulated by the surroundings — useful for studying, negotiating, traveling light.",
    DC: "Relationships rich in intellectual exchange; you meet people easily here, sometimes at the expense of the bond's depth.",
  },
  venus: {
    MC: "A career oriented toward aesthetics, art, fashion, diplomacy or public relations; social image gains charm and grace here.",
    IC: "A harmonious, aesthetically pleasing home, favorable for a gentle lifestyle and peaceful family life.",
    AC: "Increased charm and social ease, a more relaxed relationship to pleasure and appearance — often cited as the best line for feeling good in your own skin.",
    DC: "A classic line for romantic encounters and harmonious partnerships; favorable for forming pleasant emotional or professional bonds.",
  },
  mars: {
    MC: "A career that demands energy, competitiveness or physical courage; strong ambition, but also a risk of conflict with authority.",
    IC: "A more tense family life, prone to renovation projects or action within the home, with an increased risk of domestic friction.",
    AC: "A more impulsive, combative temperament, heightened physical energy — stimulating for taking action, trickier for patience and diplomacy.",
    DC: "Passionate but potentially conflictual relationships; you attract energetic partners here, sometimes in a mode of rivalry.",
  },
  jupiter: {
    MC: "Often considered a line of professional luck: opportunities, expansion, recognition that comes more easily than elsewhere.",
    IC: "A generous, abundant home, favorable for growing the family or a sense of domestic comfort and optimism.",
    AC: "Boosted self-confidence and optimism, a sense of luck and openness — one of the most sought-after lines in astrocartography.",
    DC: "Beneficial encounters, partnerships that \"help you grow\"; favorable for partnerships, marriages or fruitful collaborations.",
  },
  saturn: {
    MC: "A career that demands patience, discipline and sustained effort before recognition comes; professional responsibilities weigh more heavily here.",
    IC: "A heavier or more demanding relationship to home and family — sometimes a duty to bear, sometimes a stability hard-won.",
    AC: "An increased sense of constraint, seriousness or restraint; a line with a reputation for being hard to live day-to-day, but often structuring in the long run.",
    DC: "Serious, potentially committed but demanding relationships, with a risk of loneliness or delayed encounters.",
  },
  uranus: {
    MC: "A career marked by the unexpected, innovation or a break from convention; rarely a linear professional path here.",
    IC: "A family life subject to sudden changes or an unusual need for independence from the home.",
    AC: "A heightened sense of freedom and eccentricity, a life marked by the unexpected — stimulating but destabilizing if you're seeking routine.",
    DC: "Sudden, electric encounters, sometimes short-lived; unconventional relationships or unexpected love at first sight.",
  },
  neptune: {
    MC: "A career oriented toward art, spirituality, care or the imaginary — but also a professional reputation that can be vague or misleading.",
    IC: "A home steeped in daydreaming, idealism or vagueness; favorable for spiritual life, trickier for clear material foundations.",
    AC: "A more porous, intuitive identity, a discreet charm but also a risk of losing one's bearings or idealizing the surroundings.",
    DC: "Encounters marked by strong chemistry or idealization of the partner — magical if you keep a clear head, deceptive otherwise.",
  },
  pluto: {
    MC: "A career marked by power dynamics, the deep transformation of a sector, or success achieved after an intense struggle.",
    IC: "An intense, sometimes stormy relationship to family roots; favorable for a deep transformation of one's relationship to home.",
    AC: "A magnetic, intense presence, a life marked by deep and repeated transformations — rarely a restful line.",
    DC: "Relationships of rare intensity, potentially transformative, but also prone to power struggles or possessiveness.",
  },
  northNode: {
    MC: "A place favorable for orienting toward a new vocation, in tune with a direction of personal growth.",
    IC: "A place that invites revisiting your relationship to roots and family with an eye toward personal growth.",
    AC: "A context that pushes you out of your comfort zone and toward embodying a version of yourself closer to the growth you're seeking.",
    DC: "Encounters that seem \"made to help you grow,\" often experienced as significant for personal evolution.",
  },
};
