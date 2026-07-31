import { describe, it, expect } from "vitest";
import { computeDominance, computeBigThree, isGenerationalOnly } from "@/lib/astro/dominance";
import type { EclipticPoint, PointKey } from "@/lib/astro/types";

function point(key: PointKey, longitude: number): EclipticPoint {
  return { key, longitude };
}

describe("computeDominance", () => {
  it("counts elements and modalities from the 9 classical + modern planets (excluding the north node)", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Bélier: Feu / Cardinal
      moon: point("moon", 35), // Taureau: Terre / Fixe
      mercury: point("mercury", 65), // Gémeaux: Air / Mutable
      venus: point("venus", 95), // Cancer: Eau / Cardinal
      mars: point("mars", 5), // Bélier: Feu / Cardinal
      jupiter: point("jupiter", 5), // Bélier: Feu / Cardinal
      saturn: point("saturn", 5), // Bélier: Feu / Cardinal
      uranus: point("uranus", 5), // Bélier: Feu / Cardinal
      neptune: point("neptune", 5), // Bélier: Feu / Cardinal
      pluto: point("pluto", 5), // Bélier: Feu / Cardinal
      northNode: point("northNode", 200), // must be excluded from the count entirely
    };

    const dominance = computeDominance(points);

    expect(dominance.elementCounts.Feu).toBe(7);
    expect(dominance.elementCounts.Terre).toBe(1);
    expect(dominance.elementCounts.Air).toBe(1);
    expect(dominance.elementCounts.Eau).toBe(1);
    expect(dominance.dominantElements).toEqual(["Feu"]);

    expect(dominance.modalityCounts.Cardinal).toBe(8); // 7x Bélier + Cancer, all cardinal
    expect(dominance.modalityCounts.Fixe).toBe(1);
    expect(dominance.modalityCounts.Mutable).toBe(1);
    expect(dominance.dominantModalities).toEqual(["Cardinal"]);
  });

  it("reports a tie when two elements share the maximum count", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Feu
      moon: point("moon", 95), // Eau (Cancer)
    };
    const dominance = computeDominance(points);
    expect(dominance.dominantElements.sort()).toEqual(["Eau", "Feu"]);
  });

  it("never reports a dominant element/modality when no points are provided", () => {
    const dominance = computeDominance({});
    expect(dominance.dominantElements).toEqual([]);
    expect(dominance.dominantModalities).toEqual([]);
  });

  it("ignores points that are missing rather than throwing", () => {
    const dominance = computeDominance({ sun: point("sun", 5) });
    const total = Object.values(dominance.elementCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(1);
  });

  it("lists which planets compose each element/modality count, in place of a black-box number", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Bélier: Feu
      moon: point("moon", 95), // Cancer: Eau
      saturn: point("saturn", 65), // Gémeaux: Air
    };
    const dominance = computeDominance(points);
    expect(dominance.elementPlanets.Feu).toEqual(["sun"]);
    expect(dominance.elementPlanets.Eau).toEqual(["moon"]);
    expect(dominance.elementPlanets.Air).toEqual(["saturn"]);
    expect(dominance.elementPlanets.Terre).toEqual([]);
  });
});

describe("isGenerationalOnly", () => {
  it("is true when only outer/slow planets contribute (shared with a whole birth cohort)", () => {
    // Real case: someone with Saturn in Gémeaux, Uranus in Verseau, Neptune
    // in Verseau all landing on Air, and no personal planet (Sun-Mars) in
    // Air at all — the "dominant" element says nothing about them
    // individually, only about when they were born.
    expect(isGenerationalOnly(["saturn", "uranus", "neptune"])).toBe(true);
  });

  it("is false as soon as a single personal planet contributes", () => {
    expect(isGenerationalOnly(["sun", "uranus", "neptune"])).toBe(false);
    expect(isGenerationalOnly(["moon"])).toBe(false);
  });

  it("is false for an empty list (nothing to flag)", () => {
    expect(isGenerationalOnly([])).toBe(false);
  });
});

describe("computeBigThree", () => {
  it("derives sun/moon/ascendant signs from longitude", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Bélier
      moon: point("moon", 95), // Cancer
      asc: point("asc", 185), // Balance
    };
    const big3 = computeBigThree(points, true);
    expect(big3.sun).toBe("belier");
    expect(big3.moon).toBe("cancer");
    expect(big3.ascendant).toBe("balance");
  });

  it("omits the ascendant when houses are not reliable (unknown birth time)", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5),
      moon: point("moon", 95),
      asc: point("asc", 185),
    };
    const big3 = computeBigThree(points, false);
    expect(big3.ascendant).toBeNull();
  });
});
