import { Astronomy, computePlanetPoint } from "./ephemeris";
import { birthInputToJsDate } from "./time";
import { signOf } from "./signs";
import type { BirthInput } from "./types";

/** Ne calcule que le Soleil — utile pour un avatar ou un aperçu, sans le coût des maisons/aspects. */
export function quickSunSign(input: BirthInput) {
  const jsDate = birthInputToJsDate(input);
  const time = new Astronomy.AstroTime(jsDate);
  const sun = computePlanetPoint("sun", time);
  return signOf(sun.longitude);
}
