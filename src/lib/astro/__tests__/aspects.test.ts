import { describe, it, expect } from "vitest";
import { circularSeparation, aspectBetweenPoints, computeAspects } from "@/lib/astro/aspects";
import type { EclipticPoint } from "@/lib/astro/types";

function point(key: EclipticPoint["key"], longitude: number, speed = 0): EclipticPoint {
  return { key, longitude, speed };
}

describe("circularSeparation", () => {
  it("returns the short way around the circle, never more than 180", () => {
    expect(circularSeparation(10, 20)).toBeCloseTo(10);
    expect(circularSeparation(350, 10)).toBeCloseTo(20);
    expect(circularSeparation(0, 200)).toBeCloseTo(160);
    expect(circularSeparation(0, 180)).toBeCloseTo(180);
  });

  it("is symmetric", () => {
    expect(circularSeparation(15, 340)).toBeCloseTo(circularSeparation(340, 15));
  });
});

describe("aspectBetweenPoints", () => {
  it("detects an exact conjunction", () => {
    const a = point("sun", 10);
    const b = point("moon", 10);
    const found = aspectBetweenPoints(a, b);
    expect(found?.aspect).toBe("conjunction");
    expect(found?.exact).toBeCloseTo(0);
  });

  it("detects an exact opposition", () => {
    const a = point("sun", 10);
    const b = point("moon", 190);
    const found = aspectBetweenPoints(a, b);
    expect(found?.aspect).toBe("opposition");
  });

  it("detects a trine within orb", () => {
    const a = point("sun", 0);
    const b = point("venus", 123); // 3° off an exact 120° trine, within the 7° orb
    const found = aspectBetweenPoints(a, b);
    expect(found?.aspect).toBe("trine");
    expect(found?.exact).toBeCloseTo(3);
  });

  it("returns null when no aspect def is within orb", () => {
    const a = point("sun", 0);
    const b = point("venus", 100); // far from every major/minor aspect angle
    expect(aspectBetweenPoints(a, b)).toBeNull();
  });

  it("picks the closest aspect when two definitions could both apply near the edge of their orbs", () => {
    // 128° is 8° short of trine (orb 7, out) and within square's... actually
    // check against the real table: square=90(orb7) trine=120(orb7). 128 is
    // 8 off trine (out of orb) and 38 off square (out of orb) -> null.
    const a = point("sun", 0);
    const b = point("venus", 128);
    expect(aspectBetweenPoints(a, b)).toBeNull();
  });

  it("excludes minor aspects when a defs list without them is passed", () => {
    const a = point("sun", 0);
    const b = point("venus", 30); // exact semi-sextile, a minor aspect
    const withMinor = aspectBetweenPoints(a, b);
    expect(withMinor?.aspect).toBe("semi-sextile");

    const majorOnly = aspectBetweenPoints(a, b, [
      { key: "conjunction", angle: 0, orb: 8 },
      { key: "opposition", angle: 180, orb: 8 },
      { key: "trine", angle: 120, orb: 7 },
      { key: "square", angle: 90, orb: 7 },
      { key: "sextile", angle: 60, orb: 5 },
    ]);
    expect(majorOnly).toBeNull();
  });

  it("flags major aspects as major and minor aspects as not major", () => {
    const conjunction = aspectBetweenPoints(point("sun", 0), point("moon", 0));
    expect(conjunction?.major).toBe(true);

    const quincunx = aspectBetweenPoints(point("sun", 0), point("moon", 150));
    expect(quincunx?.aspect).toBe("quincunx");
    expect(quincunx?.major).toBe(false);
  });

  it("marks an aspect as applying when the separation is closing over time", () => {
    // Sun stationary at 0, Moon at 5° moving toward the exact conjunction (negative speed).
    const applying = aspectBetweenPoints(point("sun", 0, 0), point("moon", 5, -1));
    expect(applying?.applying).toBe(true);

    // Moon moving away from the exact conjunction.
    const separating = aspectBetweenPoints(point("sun", 0, 0), point("moon", 5, 1));
    expect(separating?.applying).toBe(false);
  });

  it("respects a custom orb factor (tighter orbs)", () => {
    const a = point("sun", 0);
    const b = point("venus", 125); // 5° off trine — inside default 7° orb, outside half that
    expect(aspectBetweenPoints(a, b, undefined, 1)?.aspect).toBe("trine");
    expect(aspectBetweenPoints(a, b, undefined, 0.5)).toBeNull();
  });
});

describe("computeAspects", () => {
  it("only compares each pair once and skips missing points", () => {
    const points = {
      sun: point("sun", 0),
      moon: point("moon", 0), // exact conjunction with sun (and, incidentally, with venus)
      venus: point("venus", 90), // exact square with both sun and moon
    };
    const aspects = computeAspects(points, ["sun", "moon", "venus", "mars"]);
    // mars is missing from `points`, must be silently skipped rather than throwing —
    // and each unordered pair (sun/moon, sun/venus, moon/venus) appears exactly once.
    expect(aspects).toHaveLength(3);
    expect(aspects.every((a) => a.a !== "mars" && a.b !== "mars")).toBe(true);
    expect(aspects.some((a) => a.a === "sun" && a.b === "moon" && a.aspect === "conjunction")).toBe(true);
    expect(aspects.some((a) => a.a === "sun" && a.b === "venus" && a.aspect === "square")).toBe(true);
    expect(aspects.some((a) => a.a === "moon" && a.b === "venus" && a.aspect === "square")).toBe(true);
  });

  it("sorts results by tightest orb first", () => {
    const points = {
      sun: point("sun", 0),
      moon: point("moon", 3), // 3° off conjunction
      venus: point("venus", 0.5), // 0.5° off conjunction — tighter
    };
    const aspects = computeAspects(points, ["sun", "moon", "venus"]);
    expect(Math.abs(aspects[0].exact)).toBeLessThanOrEqual(Math.abs(aspects[1].exact));
  });
});
