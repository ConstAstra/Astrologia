import type { Aspect, AspectKey, EclipticPoint, PointKey, ZodiacSign } from "../types";
import { signOf } from "../signs";

export interface AspectPattern {
  type: "t-square" | "grand-trine" | "grand-cross" | "stellium";
  points: PointKey[];
  /** Le point carré aux deux extrémités de l'opposition, pour un T-carré. */
  apex?: PointKey;
  /** Le signe partagé, pour un stellium. */
  sign?: ZodiacSign;
  aspects: Aspect[];
}

function findAspect(list: Aspect[], key: AspectKey, x: PointKey, y: PointKey): Aspect | undefined {
  return list.find((asp) => asp.aspect === key && ((asp.a === x && asp.b === y) || (asp.a === y && asp.b === x)));
}

/**
 * Détecte les motifs d'aspects notables (T-carré, grand trigone, grand carré,
 * stellium) à partir d'une liste d'aspects déjà calculée (computeAspects).
 *
 * `points` doit exclure Descendant/Fond du Ciel : par construction ce sont
 * toujours l'opposé exact de l'Ascendant/Milieu du Ciel, ce qui produirait
 * des motifs artificiels (une opposition ASC-DESC n'apporte aucune
 * information nouvelle sur le thème).
 */
export function detectAspectPatterns(
  aspects: Aspect[],
  points: Partial<Record<PointKey, EclipticPoint>>
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const allKeys = Object.keys(points) as PointKey[];
  const oppositions = aspects.filter((a) => a.aspect === "opposition");
  const squares = aspects.filter((a) => a.aspect === "square");
  const trines = aspects.filter((a) => a.aspect === "trine");

  const seenTSquares = new Set<string>();
  for (const opp of oppositions) {
    for (const key of allKeys) {
      if (key === opp.a || key === opp.b) continue;
      const sqA = findAspect(squares, "square", opp.a, key);
      const sqB = findAspect(squares, "square", opp.b, key);
      if (sqA && sqB) {
        const id = [opp.a, opp.b, key].sort().join("-");
        if (seenTSquares.has(id)) continue;
        seenTSquares.add(id);
        patterns.push({ type: "t-square", points: [opp.a, opp.b, key], apex: key, aspects: [opp, sqA, sqB] });
      }
    }
  }

  const seenTrines = new Set<string>();
  for (let i = 0; i < trines.length; i++) {
    for (let j = i + 1; j < trines.length; j++) {
      const t1 = trines[i];
      const t2 = trines[j];
      const shared = [t1.a, t1.b].find((p) => p === t2.a || p === t2.b);
      if (!shared) continue;
      const other1 = t1.a === shared ? t1.b : t1.a;
      const other2 = t2.a === shared ? t2.b : t2.a;
      if (other1 === other2) continue;
      const closing = findAspect(trines, "trine", other1, other2);
      if (!closing) continue;
      const id = [shared, other1, other2].sort().join("-");
      if (seenTrines.has(id)) continue;
      seenTrines.add(id);
      patterns.push({ type: "grand-trine", points: [shared, other1, other2], aspects: [t1, t2, closing] });
    }
  }

  const seenCrosses = new Set<string>();
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const o1 = oppositions[i];
      const o2 = oppositions[j];
      const pts1 = [o1.a, o1.b];
      const pts2 = [o2.a, o2.b];
      if (pts1.some((p) => pts2.includes(p))) continue;
      const sq1 = findAspect(squares, "square", o1.a, o2.a);
      const sq2 = findAspect(squares, "square", o1.a, o2.b);
      const sq3 = findAspect(squares, "square", o1.b, o2.a);
      const sq4 = findAspect(squares, "square", o1.b, o2.b);
      if (sq1 && sq2 && sq3 && sq4) {
        const id = [...pts1, ...pts2].sort().join("-");
        if (seenCrosses.has(id)) continue;
        seenCrosses.add(id);
        patterns.push({ type: "grand-cross", points: [...pts1, ...pts2], aspects: [o1, o2, sq1, sq2, sq3, sq4] });
      }
    }
  }

  const bySign = new Map<ZodiacSign, PointKey[]>();
  for (const key of allKeys) {
    const point = points[key];
    if (!point) continue;
    const sign = signOf(point.longitude);
    const arr = bySign.get(sign) ?? [];
    arr.push(key);
    bySign.set(sign, arr);
  }
  for (const [sign, keys] of bySign.entries()) {
    if (keys.length >= 3) {
      patterns.push({ type: "stellium", points: keys, sign, aspects: [] });
    }
  }

  return patterns;
}
