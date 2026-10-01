import { describe, it, expect } from "vitest";
import { computeAspects } from "@/lib/astro/aspects";
import { detectAspectPatterns } from "@/lib/astro/interpretations/aspect-patterns";
import type { EclipticPoint, PointKey } from "@/lib/astro/types";

function point(key: PointKey, longitude: number): EclipticPoint {
  return { key, longitude };
}

describe("detectAspectPatterns", () => {
  it("finds a T-square with the correct apex", () => {
    const points = {
      sun: point("sun", 0),
      moon: point("moon", 180),
      mars: point("mars", 90),
    };
    const aspects = computeAspects(points, ["sun", "moon", "mars"]);
    const patterns = detectAspectPatterns(aspects, points);
    const tSquare = patterns.find((p) => p.type === "t-square");
    expect(tSquare).toBeDefined();
    expect(tSquare!.apex).toBe("mars");
    expect(tSquare!.points.sort()).toEqual(["mars", "moon", "sun"]);
  });

  it("finds a grand trine", () => {
    const points = {
      venus: point("venus", 10),
      jupiter: point("jupiter", 130),
      saturn: point("saturn", 250),
    };
    const aspects = computeAspects(points, ["venus", "jupiter", "saturn"]);
    const patterns = detectAspectPatterns(aspects, points);
    const grandTrine = patterns.find((p) => p.type === "grand-trine");
    expect(grandTrine).toBeDefined();
    expect(grandTrine!.points.sort()).toEqual(["jupiter", "saturn", "venus"]);
  });

  it("finds a grand cross", () => {
    const points = {
      sun: point("sun", 0),
      moon: point("moon", 180),
      mars: point("mars", 90),
      mercury: point("mercury", 270),
    };
    const aspects = computeAspects(points, ["sun", "moon", "mars", "mercury"]);
    const patterns = detectAspectPatterns(aspects, points);
    const grandCross = patterns.find((p) => p.type === "grand-cross");
    expect(grandCross).toBeDefined();
    expect(grandCross!.points.sort()).toEqual(["mars", "mercury", "moon", "sun"]);
  });

  it("finds a stellium of 3+ points in the same sign", () => {
    const points = {
      sun: point("sun", 5), // Bélier
      mercury: point("mercury", 15), // Bélier
      venus: point("venus", 25), // Bélier
      mars: point("mars", 100), // Cancer, hors du groupe
    };
    const aspects = computeAspects(points, ["sun", "mercury", "venus", "mars"]);
    const patterns = detectAspectPatterns(aspects, points);
    const stellium = patterns.find((p) => p.type === "stellium");
    expect(stellium).toBeDefined();
    expect(stellium!.sign).toBe("belier");
    expect(stellium!.points.sort()).toEqual(["mercury", "sun", "venus"]);
  });

  it("finds no patterns in a plain chart with no notable configuration", () => {
    const points = {
      sun: point("sun", 5),
      moon: point("moon", 47),
      mercury: point("mercury", 200),
    };
    const aspects = computeAspects(points, ["sun", "moon", "mercury"]);
    const patterns = detectAspectPatterns(aspects, points);
    expect(patterns).toEqual([]);
  });
});
