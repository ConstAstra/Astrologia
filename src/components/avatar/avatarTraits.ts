import { SIGN_META } from "@/lib/astro/interpretations/signs";
import type { ZodiacSign } from "@/lib/astro/types";

// Traits déterministes de l'avatar pixel-art, partagés entre le rendu React
// (PixelAvatar, pour l'UI) et le rendu chaîne de caractères (pour la carte
// de partage générée côté serveur, où react-dom/server n'est pas utilisable
// depuis une route handler Next.js).
//
// Règle stricte : la couleur de peau (SKIN_TONES) n'est JAMAIS dérivée du
// thème astral (signe, élément...) — uniquement du seed aléatoire, ou d'un
// choix explicite de l'utilisateur via `overrides`. Associer une teinte de
// peau à un signe reviendrait à coder une caractéristique physique sur une
// catégorie astrologique, ce qu'on ne fait pour aucun trait ici.

export const SKIN_TONES = ["#f2c9a0", "#e8b088", "#c98a5e", "#8a5a3a", "#5c3a24"];
export const HAIR_COLORS = ["#2b2320", "#6b4226", "#caa14d", "#c77b8a", "#c9524b", "#e9e4d8", "#3a3a3a"];
export const CLOTHING_COLORS = ["#c77b8a", "#c9524b", "#4a8f7a", "#e8935f", "#5a6fa8", "#a85a8f", "#3a4a5a"];

// Grille 10 colonnes × 5 lignes ; col 0 → x=1, col 9 → x=10 ; ligne 0 → y=1.
// La tête occupe x:2.5–9.5, y:3–10, donc les lignes 2–4 du masque
// recouvrent naturellement le haut du crâne (racine des cheveux).
export const HAIR_MASKS = [
  ["0011111100", "0111111110", "1111111111", "1000000001", "0000000000"], // Classique
  ["0000110000", "0000110000", "0001111000", "0001111000", "0000000000"], // Mohawk
  ["1111111000", "1111110000", "1111100000", "1000000000", "0000000000"], // Raie sur le côté
  ["0011111100", "0111111110", "1111111111", "1111111111", "1100000011"], // Ample
  ["0110110000", "1011011000", "0110110110", "1011011011", "0000000000"], // Bouclé
  ["0000000000", "0011111100", "1000000001", "0000000000", "0000000000"], // Court / rasé
];

export const ELEMENT_BG: Record<string, string> = {
  Feu: "#4a2a1f",
  Terre: "#243a2c",
  Air: "#3a2440",
  Eau: "#1f2c40",
};

// Palettes restreintes utilisées pour biaiser (pas forcer) le tirage
// cheveux/tenue quand le signe correspondant est connu : la Lune colore le
// "dedans" (cheveux, au plus près de la tête), l'Ascendant colore ce qu'on
// présente au monde (la tenue) — cohérent avec leur sens astrologique
// classique. Reste purement esthétique : jamais utilisé pour la peau.
const ELEMENT_HAIR_POOL: Record<string, string[]> = {
  Feu: ["#c9524b", "#caa14d"],
  Terre: ["#6b4226", "#3a3a3a"],
  Air: ["#e9e4d8", "#c77b8a"],
  Eau: ["#2b2320", "#3a3a3a"],
};
const ELEMENT_CLOTHING_POOL: Record<string, string[]> = {
  Feu: ["#c9524b", "#e8935f"],
  Terre: ["#4a8f7a", "#3a4a5a"],
  Air: ["#c77b8a", "#5a6fa8"],
  Eau: ["#5a6fa8", "#3a4a5a"],
};

export function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface AvatarTraits {
  skin: string;
  hairColor: string;
  hairMaskIndex: number;
  hairCells: { x: number; y: number }[];
  clothing: string;
  blush: boolean;
  smiling: boolean;
  raisedBrow: boolean;
  glasses: boolean;
  bg: string;
  clipId: string;
  companion: Companion | null;
}

/**
 * Choix manuels de l'utilisateur (éditeur d'avatar) : chaque champ, s'il est
 * défini, remplace la valeur générée automatiquement — y compris `hairMaskIndex`
 * qui remplace tout le style de cheveux généré depuis le seed. Stocké tel
 * quel (JSON) sur Profile.avatarOverrides.
 */
export interface AvatarOverrides {
  skin?: string;
  hairColor?: string;
  hairMaskIndex?: number;
  clothing?: string;
  blush?: boolean;
  smiling?: boolean;
  raisedBrow?: boolean;
  glasses?: boolean;
  bg?: string;
}

function pick<T>(rand: () => number, pool: T[]): T {
  return pool[Math.floor(rand() * pool.length)];
}

// Compagnon dérivé de l'élément de la Lune — jamais un choix manuel, jamais
// aléatoire : deux profils avec la Lune dans le même élément ont toujours le
// même compagnon. Représenté en formes normalisées dans un carré [-1,1]
// centré sur son badge (appliqué via `transform="translate(cx,cy) scale(r)"`
// côté appelant) pour que PixelAvatar (React, navigateur) et
// renderAvatarDataUri (chaîne, serveur) partagent exactement la même
// géométrie sans jamais diverger visuellement entre les deux.
export type AstroElement = "Feu" | "Terre" | "Air" | "Eau";

export type CompanionShape = { type: "circle"; cx: number; cy: number; r: number } | { type: "path"; d: string };

export const COMPANION_COLOR: Record<AstroElement, string> = {
  Feu: "#e8935f",
  Terre: "#4a8f7a",
  Air: "#c9a8ad",
  Eau: "#5a6fa8",
};

export const COMPANION_SHAPES: Record<AstroElement, CompanionShape[]> = {
  // Flamme
  Feu: [{ type: "path", d: "M0,0.62 Q-0.55,0.05 0,-0.62 Q0.55,0.05 0,0.62 Z" }],
  // Ourson : corps + deux oreilles
  Terre: [
    { type: "circle", cx: 0, cy: 0.12, r: 0.5 },
    { type: "circle", cx: -0.35, cy: -0.32, r: 0.2 },
    { type: "circle", cx: 0.35, cy: -0.32, r: 0.2 },
  ],
  // Oiseau : corps + deux ailes
  Air: [
    { type: "circle", cx: 0, cy: 0.1, r: 0.42 },
    { type: "path", d: "M-0.42,0.1 L-0.1,-0.32 L-0.1,0.22 Z" },
    { type: "path", d: "M0.42,0.1 L0.1,-0.32 L0.1,0.22 Z" },
  ],
  // Poisson : corps + queue
  Eau: [
    { type: "circle", cx: -0.12, cy: 0.12, r: 0.42 },
    { type: "path", d: "M0.22,0.12 L0.62,-0.18 L0.62,0.42 Z" },
  ],
};

export interface Companion {
  element: AstroElement;
  color: string;
}

export function companionForMoon(moonSign?: ZodiacSign): Companion | null {
  if (!moonSign) return null;
  const element = SIGN_META[moonSign].element as AstroElement;
  return { element, color: COMPANION_COLOR[element] };
}

export function computeAvatarTraits(
  seed: string,
  sunSign?: ZodiacSign,
  moonSign?: ZodiacSign,
  ascSign?: ZodiacSign,
  overrides?: AvatarOverrides
): AvatarTraits {
  const rand = mulberry32(hashString(seed));

  const skin = overrides?.skin ?? pick(rand, SKIN_TONES);

  const hairPool = moonSign ? ELEMENT_HAIR_POOL[SIGN_META[moonSign].element] : undefined;
  const hairColor = overrides?.hairColor ?? pick(rand, hairPool ?? HAIR_COLORS);

  const hairMaskIndex = overrides?.hairMaskIndex ?? Math.floor(rand() * HAIR_MASKS.length);
  const hairMask = HAIR_MASKS[hairMaskIndex] ?? HAIR_MASKS[0];

  const clothingPool = ascSign ? ELEMENT_CLOTHING_POOL[SIGN_META[ascSign].element] : undefined;
  const clothing = overrides?.clothing ?? pick(rand, clothingPool ?? CLOTHING_COLORS);

  const blush = overrides?.blush ?? rand() > 0.5;
  const smiling = overrides?.smiling ?? rand() > 0.4;
  const raisedBrow = overrides?.raisedBrow ?? rand() > 0.5;
  const glasses = overrides?.glasses ?? rand() > 0.75;
  const bg = overrides?.bg ?? (sunSign ? ELEMENT_BG[SIGN_META[sunSign].element] : "#241a2c");

  const hairCells: { x: number; y: number }[] = [];
  hairMask.forEach((row, rowIdx) => {
    row.split("").forEach((cell, colIdx) => {
      if (cell === "1") hairCells.push({ x: 1 + colIdx, y: 1 + rowIdx });
    });
  });

  return {
    skin,
    hairColor,
    hairMaskIndex,
    hairCells,
    clothing,
    blush,
    smiling,
    raisedBrow,
    glasses,
    bg,
    clipId: `avatar-clip-${hashString(seed)}`,
    companion: companionForMoon(moonSign),
  };
}
