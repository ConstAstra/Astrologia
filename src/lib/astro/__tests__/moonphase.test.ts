import { describe, it, expect } from "vitest";
import { computeMoonPhase } from "@/lib/astro/moonphase";

describe("computeMoonPhase", () => {
  it("always returns a valid illuminated fraction and phase angle", () => {
    // Sample across a range of dates rather than a single instant.
    const dates = [
      new Date("2020-01-01T00:00:00Z"),
      new Date("2021-06-15T12:00:00Z"),
      new Date("2023-11-03T08:30:00Z"),
      new Date("2026-07-31T00:00:00Z"),
    ];
    for (const date of dates) {
      const reading = computeMoonPhase(date);
      expect(reading.illuminatedFraction).toBeGreaterThanOrEqual(0);
      expect(reading.illuminatedFraction).toBeLessThanOrEqual(1);
      expect(reading.angle).toBeGreaterThanOrEqual(0);
      expect(reading.angle).toBeLessThan(360);
      expect(reading.waxing).toBe(reading.angle < 180);
    }
  });

  it("is near-dark at a well-documented new moon", () => {
    // New Moon: 2024-01-11 11:57 UTC (published almanac data).
    const reading = computeMoonPhase(new Date("2024-01-11T11:57:00Z"));
    expect(reading.illuminatedFraction).toBeLessThan(0.05);
    expect(reading.name).toBe("Nouvelle Lune");
  });

  it("is near-full at a well-documented full moon", () => {
    // Full Moon: 2024-01-25 17:54 UTC (published almanac data, the "Wolf Moon").
    const reading = computeMoonPhase(new Date("2024-01-25T17:54:00Z"));
    expect(reading.illuminatedFraction).toBeGreaterThan(0.95);
    expect(reading.name).toBe("Pleine Lune");
  });

  it("cycles through all 8 named phases across a lunar month", () => {
    const seen = new Set<string>();
    const start = new Date("2024-01-11T11:57:00Z").getTime(); // new moon
    const oneDay = 24 * 60 * 60 * 1000;
    for (let i = 0; i < 30; i++) {
      seen.add(computeMoonPhase(new Date(start + i * oneDay)).name);
    }
    expect(seen.size).toBe(8);
  });
});
