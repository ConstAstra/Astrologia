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
  const inSign = degreeInSign(longitude);
  const degrees = Math.floor(inSign);
  const minutes = Math.round((inSign - degrees) * 60);
  if (minutes === 60) {
    return { sign: signOf(longitude), degrees: degrees + 1, minutes: 0 };
  }
  return { sign: signOf(longitude), degrees, minutes };
}

export function formatLongitude(longitude: number): string {
  const { degrees, minutes } = toDegreeParts(longitude);
  return `${degrees}°${String(minutes).padStart(2, "0")}'`;
}
