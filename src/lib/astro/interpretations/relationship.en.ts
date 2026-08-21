import type { PointKey } from "../types";
import type { RelationshipType } from "./relationship";

export const RELATIONSHIP_META_EN: Record<
  RelationshipType,
  { label: string; synastryFraming: string; compositeFraming: string }
> = {
  romantique: {
    label: "Couple / romantic",
    synastryFraming:
      "For a couple, look first at aspects involving Venus, Mars, the Moon and the Sun: they speak to attraction, desire, emotional security and mutual recognition. Tense aspects don't condemn anything, they point to friction to negotiate consciously rather than endure.",
    compositeFraming:
      "A couple's composite reads like a portrait of the relationship itself: its Sun says what the couple seeks to embody together, its Moon what it needs to feel secure, its Ascendant the image the couple presents to the outside world.",
  },
  amitie: {
    label: "Friendship",
    synastryFraming:
      "For a friendship, pay attention to aspects between Mercury, Jupiter, the Sun and Uranus: they speak to intellectual complicity, shared enthusiasm and respect for each other's freedom. Venus/Mars aspects are still readable but usually matter less than in a romantic context.",
    compositeFraming:
      "A friendship's composite illuminates the nature of the bond itself: what draws you together spontaneously (often visible through Mercury and Jupiter) and what could, if neglected, create distance.",
  },
  famille: {
    label: "Family",
    synastryFraming:
      "For a family bond, aspects involving the Moon, Saturn and the Sun are particularly telling: they speak to attachment, a sense of duty, and how each person recognizes (or struggles to recognize) the other's place.",
    compositeFraming:
      "A family bond's composite says something about the shared history and what gets passed down through it, less a choice than a given to work with.",
  },
  collegue: {
    label: "Professional",
    synastryFraming:
      "For a professional relationship, focus on Mercury, Saturn, Mars and Jupiter: communication, reliability, handling disagreements and mutual opportunities. Venus/Moon aspects stay secondary in this context.",
    compositeFraming:
      "A professional collaboration's composite illuminates the shared working dynamic: its Midheaven says a lot about what the duo can achieve publicly, its 10th house about the nature of the shared project.",
  },
};

const RELATIONSHIP_PLANET_NOTES_EN: Record<RelationshipType, Partial<Record<PointKey, string>>> = {
  romantique: {
    venus:
      "This aspect touches directly on the attraction and tenderness between you, a fairly reliable barometer of how easily desire and affection flow day to day.",
    mars:
      "This aspect touches on desire and the physical dynamic of the couple, harmonious, it feeds a spontaneous physical complicity; tense, it can turn into rivalry or friction if it's never put into words.",
    moon:
      "This aspect touches on the emotional security you inspire in each other, the real question being whether each of you actually feels safe enough to open up to the other.",
    sun:
      "This aspect touches on how you each recognize who the other is, a couple where this axis flows easily feels seen, not just loved.",
    saturn:
      "This aspect touches on how solid the bond stays over time, less the early spark than what lets a couple hold together once initial excitement settles, often what separates a relationship built to last from a passing infatuation.",
    northNode:
      "This aspect touches on the sense of fate felt in the encounter, the feeling that this relationship didn't happen by chance, that it's pushing each of you toward a life direction you wouldn't have taken alone.",
  },
  amitie: {
    mercury:
      "This aspect touches on the quality of exchange and intellectual complicity, often what separates a friendship that lasts from a mere acquaintance.",
    jupiter:
      "This aspect touches on shared enthusiasm and the desire to grow together, a real engine for friendships that push each person to think bigger.",
    uranus:
      "This aspect touches on respecting each other's freedom within the friendship, being able to reconnect without feeling obligated or crowded by the other.",
    sun:
      "This aspect touches on mutual recognition within the friendship, feeling truly seen by the other, not just tolerated or convenient to have around.",
    northNode:
      "This aspect touches on the sense that this friendship matters more than an ordinary encounter, as if it arrived at the right time to push each of you toward a direction you wouldn't have taken alone.",
  },
  famille: {
    moon:
      "This aspect touches on attachment and emotional habits inherited from the family, often the key to understanding why certain reactions look disproportionate from the outside.",
    saturn:
      "This aspect touches on a sense of duty and shared responsibilities, something that, in a family, can feel like love at times and like a burden at others, depending on how it's lived.",
    sun:
      "This aspect touches on recognizing each person's place within the family, a central issue when several strong personalities share the same roof or history.",
    northNode:
      "This aspect touches on the almost pre-written quality of this family bond, the sense that this person is part of a wider life path, not just an accident of birth.",
  },
  collegue: {
    mercury:
      "This aspect touches on professional communication and work organization, often what makes or breaks a collaboration day to day, well before the big decisions.",
    saturn:
      "This aspect touches on reliability and seriousness in the collaboration, the real question being whether you can count on each other when it actually matters.",
    mars:
      "This aspect touches on how disagreements or competition are handled at work, worth watching if professional egos start outweighing the shared goal.",
    jupiter:
      "This aspect touches on the opportunities this collaboration can open up, often a sign that working together serves both careers, not just the project at hand.",
    northNode:
      "This aspect touches on the sense that this collaboration arrives at the right time, almost like an opportunity meant to move something important forward for one or both of you.",
  },
};

export function relationshipAspectNoteEn(pointA: PointKey, pointB: PointKey, type: RelationshipType): string | null {
  const notes = RELATIONSHIP_PLANET_NOTES_EN[type];
  return notes[pointA] ?? notes[pointB] ?? null;
}
