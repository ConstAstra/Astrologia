import { describe, it, expect } from "vitest";
import { circularMidpoint, computeComposite } from "@/lib/astro/composite";
import { computeSynastry, SYNASTRY_POINT_KEYS } from "@/lib/astro/synastry";
import { computeNatalChart } from "@/lib/astro/chart";

describe("circularMidpoint", () => {
  it("finds the ordinary midpoint when both points are close together", () => {
    expect(circularMidpoint(10, 20)).toBeCloseTo(15, 6);
  });

  it("takes the short way around the 0°/360° boundary", () => {
    expect(circularMidpoint(350, 10)).toBeCloseTo(0, 6);
  });

  it("is symmetric in its two arguments", () => {
    expect(circularMidpoint(15, 340)).toBeCloseTo(circularMidpoint(340, 15), 6);
  });
});

describe("computeComposite", () => {
  const chartA = computeNatalChart(
    { date: "1990-06-15", time: "14:30", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
    "placidus"
  );
  const chartB = computeNatalChart(
    { date: "1988-11-02", time: "08:15", tzName: "Europe/Paris", latitude: 45.75, longitude: 4.85 },
    "placidus"
  );

  it("places every composite point at the circular midpoint of the two natal points", () => {
    const composite = computeComposite(chartA, chartB);
    expect(composite.points.sun.longitude).toBeCloseTo(
      circularMidpoint(chartA.points.sun.longitude, chartB.points.sun.longitude),
      6
    );
    expect(composite.points.asc.longitude).toBeCloseTo(
      circularMidpoint(chartA.points.asc.longitude, chartB.points.asc.longitude),
      6
    );
  });

  it("always uses equal houses from the composite Ascendant, 30° apart", () => {
    const composite = computeComposite(chartA, chartB);
    expect(composite.houses.system).toBe("equal");
    for (let i = 0; i < 12; i++) {
      const diff = (composite.houses.cusps[i] - composite.houses.cusps[0] + 360) % 360;
      expect(diff).toBeCloseTo((i * 30) % 360, 6);
    }
  });

  it("is only reliable when both natal charts have a known birth time", () => {
    const unknownTimeChart = computeNatalChart(
      {
        date: "1988-11-02",
        time: null,
        tzName: "Europe/Paris",
        latitude: 45.75,
        longitude: 4.85,
        timeUnknown: true,
      },
      "whole-sign"
    );
    const composite = computeComposite(chartA, unknownTimeChart);
    expect(composite.hasReliableHouses).toBe(false);
  });
});

describe("computeSynastry", () => {
  const chartA = computeNatalChart(
    { date: "1990-06-15", time: "14:30", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
    "placidus"
  );
  const chartB = computeNatalChart(
    { date: "1988-11-02", time: "08:15", tzName: "Europe/Paris", latitude: 45.75, longitude: 4.85 },
    "placidus"
  );

  it("only compares planets and asc/mc, never derived angles like desc/ic/fortune", () => {
    expect(SYNASTRY_POINT_KEYS).not.toContain("desc");
    expect(SYNASTRY_POINT_KEYS).not.toContain("ic");
    expect(SYNASTRY_POINT_KEYS).not.toContain("fortune");
  });

  it("finds the same aspect regardless of comparison direction", () => {
    const result = computeSynastry(chartA, chartB);
    const reversed = computeSynastry(chartB, chartA);
    expect(result.aspects.length).toBe(reversed.aspects.length);
  });

  it("drops minor aspects when includeMinor is false", () => {
    const withMinor = computeSynastry(chartA, chartB, { includeMinor: true });
    const majorOnly = computeSynastry(chartA, chartB, { includeMinor: false });
    expect(majorOnly.aspects.length).toBeLessThanOrEqual(withMinor.aspects.length);
    expect(majorOnly.aspects.every((a) => a.major)).toBe(true);
  });

  it("places house overlays within 1-12", () => {
    const result = computeSynastry(chartA, chartB);
    for (const overlay of [...result.aPlanetsInBHouses, ...result.bPlanetsInAHouses]) {
      expect(overlay.house).toBeGreaterThanOrEqual(1);
      expect(overlay.house).toBeLessThanOrEqual(12);
    }
  });
});
