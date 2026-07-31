import type { PlanetKey } from "../types";
import type { LineTypeKey } from "./astrocartography-content";

export type ThemeCategory = "love" | "career" | "spiritual" | "travel";

export const THEME_CATEGORIES: ThemeCategory[] = ["love", "career", "spiritual", "travel"];

export const CATEGORY_LABELS: Record<"fr" | "en", Record<ThemeCategory, string>> = {
  fr: {
    love: "Rencontre amoureuse",
    career: "Évolution professionnelle",
    spiritual: "Guidance spirituelle",
    travel: "Vacances & tourisme",
  },
  en: {
    love: "Meeting someone",
    career: "Career growth",
    spiritual: "Spiritual guidance",
    travel: "Vacation & tourism",
  },
};

type ThemeTag = { category: ThemeCategory; valence: "positive" | "challenging" };

// Chaque couple (planète, type de ligne) peut porter plusieurs thèmes — les
// lignes DC (rencontres) alimentent surtout "amour", les MC (vocation,
// image publique) alimentent "carrière", Neptune et le Nœud Nord (chemin
// d'évolution) alimentent "spirituel", et les lignes AC des planètes
// bénéfiques (Jupiter, Vénus, Soleil, Mercure) alimentent "voyage" — une
// ligne AC colore d'abord le vécu quotidien, agréable ou non selon la
// planète. Valence "challenging" = ligne réelle et notable, mais plus
// difficile à vivre pour ce thème précis (toujours affichée dans une
// lecture complète, jamais dans un classement "meilleurs endroits").
const LINE_THEME_TAGS: Partial<Record<PlanetKey, Partial<Record<LineTypeKey, ThemeTag[]>>>> = {
  sun: {
    MC: [{ category: "career", valence: "positive" }],
    AC: [{ category: "travel", valence: "positive" }],
    DC: [{ category: "love", valence: "positive" }],
  },
  moon: {
    AC: [{ category: "travel", valence: "positive" }],
    DC: [{ category: "love", valence: "positive" }],
    IC: [{ category: "spiritual", valence: "positive" }],
  },
  mercury: {
    MC: [{ category: "career", valence: "positive" }],
    AC: [{ category: "travel", valence: "positive" }],
  },
  venus: {
    MC: [{ category: "career", valence: "positive" }],
    AC: [{ category: "travel", valence: "positive" }],
    DC: [{ category: "love", valence: "positive" }],
  },
  mars: {
    MC: [{ category: "career", valence: "challenging" }],
    AC: [{ category: "travel", valence: "challenging" }],
    DC: [{ category: "love", valence: "challenging" }],
  },
  jupiter: {
    MC: [{ category: "career", valence: "positive" }],
    AC: [{ category: "travel", valence: "positive" }],
    DC: [{ category: "love", valence: "positive" }],
    IC: [{ category: "spiritual", valence: "positive" }],
  },
  saturn: {
    MC: [{ category: "career", valence: "challenging" }],
    AC: [{ category: "travel", valence: "challenging" }],
    DC: [{ category: "love", valence: "challenging" }],
    IC: [{ category: "spiritual", valence: "challenging" }],
  },
  uranus: {
    MC: [{ category: "career", valence: "challenging" }],
    AC: [{ category: "travel", valence: "challenging" }],
  },
  neptune: {
    MC: [{ category: "spiritual", valence: "positive" }],
    IC: [{ category: "spiritual", valence: "positive" }],
    AC: [
      { category: "spiritual", valence: "positive" },
      { category: "travel", valence: "positive" },
    ],
    DC: [{ category: "love", valence: "challenging" }],
  },
  pluto: {
    MC: [{ category: "career", valence: "challenging" }],
    DC: [{ category: "love", valence: "challenging" }],
  },
  northNode: {
    MC: [{ category: "spiritual", valence: "positive" }],
    IC: [{ category: "spiritual", valence: "positive" }],
    AC: [{ category: "spiritual", valence: "positive" }],
    DC: [{ category: "spiritual", valence: "positive" }],
  },
};

export function getThemeTags(planet: PlanetKey, type: LineTypeKey): ThemeTag[] {
  return LINE_THEME_TAGS[planet]?.[type] ?? [];
}
