import { ZODIAC_SIGNS } from "./types";
import type { ZodiacSign } from "./types";

export function signIndex(longitude: number): number {
  return Math.floor(((longitude % 360) + 360) % 360 / 30);
}

export function signOf(longitude: number): ZodiacSign {
  return ZODIAC_SIGNS[signIndex(longitude)];
}

export function degreeInSign(longitude: number): number {
  const l = ((longitude % 360) + 360) % 360;
  return l - Math.floor(l / 30) * 30;
}

export interface DegreeParts {
  sign: ZodiacSign;
  degrees: number;
  minutes: number;
}

export function toDegreeParts(longitude: number): DegreeParts {
  // Arrondit en minutes entières AVANT de dériver signe/degré/minute, dans un
  // seul espace entier (minutes depuis 0° Bélier) : arrondir la partie
  // fractionnaire puis ré-appeler signOf() sur le longitude d'origine
  // désynchronisait signe et degré quand l'arrondi faisait déborder les
  // minutes (ex: 29.9998° donnait Bélier 30°00' au lieu de Taureau 0°00').
  const normalizedMinutes = Math.round((((longitude % 360) + 360) % 360) * 60);
  const totalMinutes = ((normalizedMinutes % (360 * 60)) + 360 * 60) % (360 * 60);
  const signIdx = Math.floor(totalMinutes / (30 * 60));
  const minutesInSign = totalMinutes - signIdx * 30 * 60;
  return {
    sign: ZODIAC_SIGNS[signIdx],
    degrees: Math.floor(minutesInSign / 60),
    minutes: minutesInSign % 60,
  };
}

export function formatLongitude(longitude: number): string {
  const { degrees, minutes } = toDegreeParts(longitude);
  return `${degrees}°${String(minutes).padStart(2, "0")}'`;
}
