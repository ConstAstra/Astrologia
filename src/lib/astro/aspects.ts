import { normalizeDegrees } from "./ephemeris";
import { MAJOR_ASPECTS, MINOR_ASPECTS } from "./types";
import type { Aspect, EclipticPoint, PointKey } from "./types";

const ALL_ASPECTS = [...MAJOR_ASPECTS, ...MINOR_ASPECTS];
const MAJOR_KEYS = new Set(MAJOR_ASPECTS.map((a) => a.key as string));

/** Écart circulaire entre deux longitudes, toujours dans [0, 180]. */
export function circularSeparation(a: number, b: number): number {
  const d = Math.abs(normalizeDegrees(a - b));
  return d > 180 ? 360 - d : d;
}

export interface AspectOptions {
  includeMinor?: boolean;
  /** Facteur multiplicatif appliqué aux orbes (ex: 0.5 pour un tri plus strict). */
  orbFactor?: number;
}

/**
 * Calcule les aspects entre toutes les paires d'un même jeu de points
 * (thème natal). Pour la synastrie/composite, voir `synastry.ts` qui compare
 * deux jeux de points distincts avec `aspectBetweenPoints`.
 */
export function computeAspects(
  points: Partial<Record<PointKey, EclipticPoint>>,
  keys: PointKey[],
  options: AspectOptions = {}
): Aspect[] {
  const aspects: Aspect[] = [];
  const defs = options.includeMinor === false ? MAJOR_ASPECTS : ALL_ASPECTS;
  const orbFactor = options.orbFactor ?? 1;

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = points[keys[i]];
      const b = points[keys[j]];
      if (!a || !b) continue;
      const aspect = aspectBetweenPoints(a, b, defs, orbFactor);
      if (aspect) aspects.push(aspect);
    }
  }
  return aspects.sort((x, y) => Math.abs(x.exact) - Math.abs(y.exact));
}

type AspectDef = (typeof ALL_ASPECTS)[number];

export function aspectBetweenPoints(
  a: EclipticPoint,
  b: EclipticPoint,
  defs: readonly AspectDef[] = ALL_ASPECTS,
  orbFactor = 1
): Aspect | null {
  const sep = circularSeparation(a.longitude, b.longitude);
  let best: Aspect | null = null;

  for (const def of defs) {
    const orb = def.orb * orbFactor;
    const delta = sep - def.angle;
    if (Math.abs(delta) <= orb) {
      let applying = false;
      if (typeof a.speed === "number" && typeof b.speed === "number") {
        const dt = 0.1; // jours
        const futureSep = circularSeparation(
          a.longitude + a.speed * dt,
          b.longitude + b.speed * dt
        );
        applying = Math.abs(futureSep - def.angle) < Math.abs(sep - def.angle);
      }
      const candidate: Aspect = {
        a: a.key,
        b: b.key,
        aspect: def.key,
        angle: def.angle,
        orb,
        exact: delta,
        applying,
        major: MAJOR_KEYS.has(def.key),
      };
      if (!best || Math.abs(candidate.exact) < Math.abs(best.exact)) {
        best = candidate;
      }
    }
  }
  return best;
}
