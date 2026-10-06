import { Astronomy } from "./ephemeris";

const PHASE_NAMES = [
  "Nouvelle Lune",
  "Premier croissant",
  "Premier quartier",
  "Lune gibbeuse croissante",
  "Pleine Lune",
  "Lune gibbeuse décroissante",
  "Dernier quartier",
  "Dernier croissant",
] as const;

export interface MoonPhaseReading {
  angle: number; // 0-360, élongation Soleil-Lune
  illuminatedFraction: number; // 0-1
  name: (typeof PHASE_NAMES)[number];
  waxing: boolean;
}

export function computeMoonPhase(date: Date): MoonPhaseReading {
  const time = new Astronomy.AstroTime(date);
  const angle = Astronomy.MoonPhase(time);
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, time);
  const bucket = Math.floor(((angle + 22.5) % 360) / 45);
  return {
    angle,
    illuminatedFraction: illum.phase_fraction,
    name: PHASE_NAMES[bucket],
    waxing: angle < 180,
  };
}
