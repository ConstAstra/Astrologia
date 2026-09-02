import { describe, it, expect } from "vitest";
import { computeDominance, computeBigThree, isGenerationalOnly } from "@/lib/astro/dominance";
import type { EclipticPoint, PointKey } from "@/lib/astro/types";

function point(key: PointKey, longitude: number): EclipticPoint {
  return { key, longitude };
}

describe("computeDominance", () => {
  it("counts only the 5 personal planets when there is no reliable Ascendant", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Bélier: Feu / Cardinal
      moon: point("moon", 35), // Taureau: Terre / Fixe
      mercury: point("mercury", 65), // Gémeaux: Air / Mutable
      venus: point("venus", 5), // Bélier: Feu / Cardinal
      mars: point("mars", 5), // Bélier: Feu / Cardinal
      // Outer planets present in the chart but must NOT be counted here.
      jupiter: point("jupiter", 5),
      saturn: point("saturn", 5),
      uranus: point("uranus", 5),
      neptune: point("neptune", 5),
      pluto: point("pluto", 5),
      northNode: point("northNode", 200),
    };

    const dominance = computeDominance(points, false);

    expect(dominance.elementCounts.Feu).toBe(3); // sun, venus, mars
    expect(dominance.elementCounts.Terre).toBe(1); // moon
    expect(dominance.elementCounts.Air).toBe(1); // mercury
    expect(dominance.elementCounts.Eau).toBe(0);
    expect(dominance.dominantElements).toEqual(["Feu"]);
    expect(dominance.ascendantRuler).toBeNull();
  });

  it("adds the Ascendant's ruling planet to the count when houses are reliable", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Bélier: Feu
      moon: point("moon", 35), // Taureau: Terre
      mercury: point("mercury", 65), // Gémeaux: Air
      venus: point("venus", 5), // Bélier: Feu
      mars: point("mars", 5), // Bélier: Feu
      asc: point("asc", 215), // Scorpion -> ruled by Pluto (modern rulership)
      pluto: point("pluto", 35), // Taureau: Terre — joins the count as the Ascendant ruler
    };

    const dominance = computeDominance(points, true);

    expect(dominance.ascendantRuler).toBe("pluto");
    expect(dominance.elementPlanets.Terre).toEqual(["moon", "pluto"]);
    expect(dominance.elementCounts.Terre).toBe(2);
  });

  it("does not double-count the Ascendant ruler when it's already a personal planet", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5),
      moon: point("moon", 95), // Cancer
      mercury: point("mercury", 5),
      venus: point("venus", 5),
      mars: point("mars", 5),
      asc: point("asc", 95), // Cancer -> ruled by the Moon, already personal
    };

    const dominance = computeDominance(points, true);

    expect(dominance.ascendantRuler).toBe("moon");
    expect(dominance.elementPlanets.Eau).toEqual(["moon"]); // not ["moon", "moon"]
  });

  it("ignores the Ascendant when houses are unreliable, even if the point is present", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5),
      moon: point("moon", 35),
      mercury: point("mercury", 65),
      venus: point("venus", 5),
      mars: point("mars", 5),
      asc: point("asc", 215), // would add Pluto if trusted
      pluto: point("pluto", 65),
    };

    const dominance = computeDominance(points, false);

    expect(dominance.ascendantRuler).toBeNull();
    expect(dominance.elementPlanets.Air).toEqual(["mercury"]); // pluto (also Air here) excluded
  });

  it("reports a tie when two elements share the maximum count", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Feu
      moon: point("moon", 95), // Eau (Cancer)
    };
    const dominance = computeDominance(points, false);
    expect(dominance.dominantElements.sort()).toEqual(["Eau", "Feu"]);
  });

  it("never reports a dominant element/modality when no points are provided", () => {
    const dominance = computeDominance({}, false);
    expect(dominance.dominantElements).toEqual([]);
    expect(dominance.dominantModalities).toEqual([]);
  });

  it("ignores points that are missing rather than throwing", () => {
    const dominance = computeDominance({ sun: point("sun", 5) }, false);
    const total = Object.values(dominance.elementCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(1);
  });

  it("lists which planets compose each element/modality count, in place of a black-box number", () => {
    const points: Partial<Record<PointKey, EclipticPoint>> = {
      sun: point("sun", 5), // Bélier: Feu
      moon: point("moon", 95), // Cancer: Eau
      mercury: point("mercury", 65), // Gémeaux: Air
    };
    const dominance = computeDominance(points, false);
    expect(dominance.elementPlanets.Feu).toEqual(["sun"]);
    expect(dominance.elementPlanets.Eau).toEqual(["moon"]);
    expect(dominance.elementPlanets.Air).toEqual(["mercury"]);
    expect(dominance.elementPlanets.Terre).toEqual([]);
  });
});

describe("isGenerationalOnly", () => {
  it("is true when only outer/slow planets contribute (shared with a whole birth cohort)", () => {
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
