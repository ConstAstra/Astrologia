import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";
import { computeNatalChart } from "@/lib/astro/chart";
import { PLANET_KEYS } from "@/lib/astro/types";

// Cross-checks the ephemeris wrapper against known solar events (equinoxes/
// solstices have a well-documented, easily-verified ecliptic solar longitude:
// 0°/90°/180°/270°). Same reference dates already used in scripts/smoke-test-astro.ts.
describe("solar longitude at equinoxes/solstices (astronomy-engine sanity check)", () => {
  const cases: [string, string, number][] = [
    ["march equinox 2024", "2024-03-20T03:06:00Z", 0],
    ["june solstice 2024", "2024-06-20T20:51:00Z", 90],
    ["september equinox 2024", "2024-09-22T12:44:00Z", 180],
    ["december solstice 2024", "2024-12-21T09:20:00Z", 270],
  ];

  it.each(cases)("%s -> ~%d° elon", (_label, iso, expected) => {
    const time = new Astronomy.AstroTime(new Date(iso));
    const elon = Astronomy.SunPosition(time).elon;
    const diff = Math.abs(((elon - expected + 540) % 360) - 180);
    expect(diff).toBeLessThan(0.5);
  });
});

describe("computeNatalChart", () => {
  const chart = computeNatalChart(
    { date: "1990-06-15", time: "14:30", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
    "placidus"
  );

  it("computes every planet plus the 5 angle points", () => {
    for (const key of PLANET_KEYS) {
      expect(chart.points[key]).toBeDefined();
      expect(chart.points[key].longitude).toBeGreaterThanOrEqual(0);
      expect(chart.points[key].longitude).toBeLessThan(360);
    }
    for (const angle of ["asc", "mc", "desc", "ic", "fortune"] as const) {
      expect(chart.points[angle]).toBeDefined();
    }
  });

  it("derives Descendant and IC as exactly opposite Ascendant and Midheaven", () => {
    expect(chart.points.desc.longitude).toBeCloseTo((chart.houses.ascendant + 180) % 360, 6);
    expect(chart.points.ic.longitude).toBeCloseTo((chart.houses.midheaven + 180) % 360, 6);
  });

  it("marks reliable houses when a birth time is known", () => {
    expect(chart.hasReliableHouses).toBe(true);
    for (const key of PLANET_KEYS) {
      expect(chart.points[key].house).toBeGreaterThanOrEqual(1);
      expect(chart.points[key].house).toBeLessThanOrEqual(12);
    }
  });

  it("marks houses as unreliable when the birth time is unknown, and skips house assignment", () => {
    const noTimeChart = computeNatalChart(
      {
        date: "1990-06-15",
        time: null,
        tzName: "Europe/Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        timeUnknown: true,
      },
      "whole-sign"
    );
    expect(noTimeChart.hasReliableHouses).toBe(false);
    expect(noTimeChart.points.sun.house).toBeUndefined();
  });

  it("has house cusps that partition the full circle", () => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const a = chart.houses.cusps[i];
      const b = chart.houses.cusps[(i + 1) % 12];
      sum += (b - a + 360) % 360 || 360;
    }
    expect(sum).toBeCloseTo(360, 4);
  });

  it("falls back to whole-sign houses for Placidus deep in the polar circle", () => {
    const polarChart = computeNatalChart(
      { date: "2000-06-21", time: "12:00", tzName: "UTC", latitude: 70, longitude: 0 },
      "placidus"
    );
    expect(polarChart.houses.fellBackToWholeSign).toBe(true);
  });

  it("is deterministic for the same input", () => {
    const again = computeNatalChart(
      { date: "1990-06-15", time: "14:30", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
      "placidus"
    );
    expect(again.points.sun.longitude).toBeCloseTo(chart.points.sun.longitude, 9);
    expect(again.houses.ascendant).toBeCloseTo(chart.houses.ascendant, 9);
  });
});
