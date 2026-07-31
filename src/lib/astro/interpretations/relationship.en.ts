import type { PointKey } from "../types";
import type { RelationshipType } from "./relationship";

export const RELATIONSHIP_META_EN: Record<
  RelationshipType,
  { label: string; synastryFraming: string; compositeFraming: string }
> = {
  romantique: {
    label: "Couple / romantic",
    synastryFraming:
      "For a couple, look first at aspects involving Venus, Mars, the Moon and the Sun: they speak to attraction, desire, emotional security and mutual recognition. Tense aspects don't condemn anything — they point to friction to negotiate consciously rather than endure.",
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
      "A family bond's composite says something about the shared history and what gets passed down through it — less a choice than a given to work with.",
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
    venus: "This aspect touches directly on the attraction and tenderness between you.",
    mars: "This aspect touches on desire and the physical dynamic of the couple.",
    moon: "This aspect touches on the emotional security you inspire in each other.",
    sun: "This aspect touches on how you each recognize who the other is.",
  },
  amitie: {
    mercury: "This aspect touches on the quality of exchange and intellectual complicity.",
    jupiter: "This aspect touches on shared enthusiasm and the desire to grow together.",
    uranus: "This aspect touches on respecting each other's freedom within the friendship.",
    sun: "This aspect touches on mutual recognition within the friendship.",
  },
  famille: {
    moon: "This aspect touches on attachment and emotional habits inherited from the family.",
    saturn: "This aspect touches on a sense of duty and shared responsibilities.",
    sun: "This aspect touches on recognizing each person's place within the family.",
  },
  collegue: {
    mercury: "This aspect touches on professional communication and work organization.",
    saturn: "This aspect touches on reliability and seriousness in the collaboration.",
    mars: "This aspect touches on how disagreements or competition are handled at work.",
    jupiter: "This aspect touches on the opportunities this collaboration can open up.",
  },
};

export function relationshipAspectNoteEn(pointA: PointKey, pointB: PointKey, type: RelationshipType): string | null {
  const notes = RELATIONSHIP_PLANET_NOTES_EN[type];
  return notes[pointA] ?? notes[pointB] ?? null;
}
