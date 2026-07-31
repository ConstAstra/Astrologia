import { SIGN_META } from "@/lib/astro/interpretations/signs";
import type { ZodiacSign } from "@/lib/astro/types";

// Traits déterministes de l'avatar pixel-art, partagés entre le rendu React
// (PixelAvatar, pour l'UI) et le rendu chaîne de caractères (pour la carte
// de partage générée côté serveur, où react-dom/server n'est pas utilisable
// depuis une route handler Next.js).

export const SKIN_TONES = ["#f2c9a0", "#e8b088", "#c98a5e", "#8a5a3a", "#5c3a24"];
export const HAIR_COLORS = ["#2b2320", "#6b4226", "#caa14d", "#8c7fdb", "#c9524b", "#e9e4d8", "#3a3a3a"];
export const CLOTHING_COLORS = ["#8c7fdb", "#c9524b", "#4a8f7a", "#d7b781", "#5a6fa8", "#a85a8f", "#3a4a5a"];

// Grille 10 colonnes × 5 lignes ; col 0 → x=1, col 9 → x=10 ; ligne 0 → y=1.
// La tête occupe x:2.5–9.5, y:3–10, donc les lignes 2–4 du masque
// recouvrent naturellement le haut du crâne (racine des cheveux).
export const HAIR_MASKS = [
  ["0011111100", "0111111110", "1111111111", "1000000001", "0000000000"], // Classique
  ["0000110000", "0000110000", "0001111000", "0001111000", "0000000000"], // Mohawk
  ["1111111000", "1111110000", "1111100000", "1000000000", "0000000000"], // Raie sur le côté
  ["0011111100", "0111111110", "1111111111", "1111111111", "1100000011"], // Afro
  ["0110110000", "1011011000", "0110110110", "1011011011", "0000000000"], // Bouclé
  ["0000000000", "0011111100", "1000000001", "0000000000", "0000000000"], // Court / rasé
];

export const ELEMENT_BG: Record<string, string> = {
  Feu: "#3a2420",
  Terre: "#243a2c",
  Air: "#2c2440",
  Eau: "#1f2c40",
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
  hairCells: { x: number; y: number }[];
  clothing: string;
  blush: boolean;
  smiling: boolean;
  raisedBrow: boolean;
  glasses: boolean;
  bg: string;
  clipId: string;
}

export function computeAvatarTraits(seed: string, sunSign?: ZodiacSign): AvatarTraits {
  const rand = mulberry32(hashString(seed));
  const skin = SKIN_TONES[Math.floor(rand() * SKIN_TONES.length)];
  const hairColor = HAIR_COLORS[Math.floor(rand() * HAIR_COLORS.length)];
  const hairMask = HAIR_MASKS[Math.floor(rand() * HAIR_MASKS.length)];
  const clothing = CLOTHING_COLORS[Math.floor(rand() * CLOTHING_COLORS.length)];
  const blush = rand() > 0.5;
  const smiling = rand() > 0.4;
  const raisedBrow = rand() > 0.5;
  const glasses = rand() > 0.75;
  const bg = sunSign ? ELEMENT_BG[SIGN_META[sunSign].element] : "#1a1d2e";

  const hairCells: { x: number; y: number }[] = [];
  hairMask.forEach((row, rowIdx) => {
    row.split("").forEach((cell, colIdx) => {
      if (cell === "1") hairCells.push({ x: 1 + colIdx, y: 1 + rowIdx });
    });
  });

  return {
    skin,
    hairColor,
    hairCells,
    clothing,
    blush,
    smiling,
    raisedBrow,
    glasses,
    bg,
    clipId: `avatar-clip-${hashString(seed)}`,
  };
}
