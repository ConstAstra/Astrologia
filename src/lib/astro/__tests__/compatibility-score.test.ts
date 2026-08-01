import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { computeCompatibilityScore } from "@/lib/astro/compatibility-score";

describe("computeCompatibilityScore", () => {
  const personA = { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 };
  const personB = { date: "1998-03-14", time: "14:20", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 };

  it("returns a percentage strictly between 10 and 95", () => {
    const chartA = computeNatalChart(personA, "placidus");
    const chartB = computeNatalChart(personB, "placidus");
    const { percentage } = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    expect(percentage).toBeGreaterThan(10);
    expect(percentage).toBeLessThan(95);
  });

  it("is symmetric: A-with-B equals B-with-A", () => {
    const chartA = computeNatalChart(personA, "placidus");
    const chartB = computeNatalChart(personB, "placidus");
    const scoreAB = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    const scoreBA = computeCompatibilityScore(computeSynastry(chartB, chartA).aspects);
    expect(scoreAB.percentage).toBe(scoreBA.percentage);
  });

  it("is deterministic for the same two charts", () => {
    const chartA = computeNatalChart(personA, "placidus");
    const chartB = computeNatalChart(personB, "placidus");
    const a = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    const b = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    expect(a).toEqual(b);
  });

  it("returns a neutral-ish percentage for an empty aspect list", () => {
    const { percentage, raw } = computeCompatibilityScore([]);
    expect(raw).toBe(0);
    expect(percentage).toBeGreaterThanOrEqual(50);
    expect(percentage).toBeLessThanOrEqual(55);
  });

  it("scores a chart with only tight harmonious aspects higher than one with only tight tense aspects", () => {
    const harmonious = computeCompatibilityScore([
      { personA: "sun", personB: "moon", aspect: "trine", angle: 120, orb: 7, exact: 0.2, applying: true, major: true },
      { personA: "venus", personB: "mars", aspect: "sextile", angle: 60, orb: 5, exact: 0.1, applying: true, major: true },
    ]);
    const tense = computeCompatibilityScore([
      { personA: "sun", personB: "moon", aspect: "square", angle: 90, orb: 7, exact: 0.2, applying: true, major: true },
      { personA: "venus", personB: "mars", aspect: "opposition", angle: 180, orb: 8, exact: 0.1, applying: true, major: true },
    ]);
    expect(harmonious.percentage).toBeGreaterThan(tense.percentage);
  });
});
