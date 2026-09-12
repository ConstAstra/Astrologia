import { describe, it, expect } from "vitest";
import { computeHouses, houseOfLongitude, ascendantLongitude, midheavenLongitude } from "@/lib/astro/houses";
import type { HouseSystem } from "@/lib/astro/types";

function expectValidCuspRing(cusps: number[]) {
  expect(cusps).toHaveLength(12);
  for (const c of cusps) {
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThan(360);
  }
  // Consecutive forward arcs (mod 360) must sum to exactly 360°: the 12
  // cusps must partition the circle without gaps or overlaps.
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    sum += (b - a + 360) % 360 || 360;
  }
  expect(sum).toBeCloseTo(360, 4);
}

describe("computeHouses", () => {
  const ramc = 123.45;
  const obliquity = 23.44;
  const latitude = 48.85; // Paris — well clear of the polar circle

  const systems: HouseSystem[] = ["whole-sign", "equal", "porphyry", "placidus"];

  it.each(systems)("produces 12 well-ordered cusps partitioning the circle for %s", (system) => {
    const houses = computeHouses(system, ramc, obliquity, latitude);
    expectValidCuspRing(houses.cusps);
  });

  it("reports the exact Ascendant in .ascendant regardless of house system", () => {
    const asc = ascendantLongitude(ramc, obliquity, latitude);
    for (const system of systems) {
      const houses = computeHouses(system, ramc, obliquity, latitude);
      expect(houses.ascendant).toBeCloseTo(asc, 6);
    }
  });

  it("sets cusps[0] to the exact Ascendant for equal/porphyry/placidus", () => {
    for (const system of ["equal", "porphyry", "placidus"] as HouseSystem[]) {
      const houses = computeHouses(system, ramc, obliquity, latitude);
      expect(houses.cusps[0]).toBeCloseTo(houses.ascendant, 6);
    }
  });

  it("sets cusps[0] to the start of the Ascendant's sign for whole-sign (not the exact degree)", () => {
    const houses = computeHouses("whole-sign", ramc, obliquity, latitude);
    expect(houses.cusps[0]).toBeCloseTo(Math.floor(houses.ascendant / 30) * 30, 6);
  });

  it("reports the Midheaven consistently across systems", () => {
    const mc = midheavenLongitude(ramc, obliquity);
    for (const system of systems) {
      const houses = computeHouses(system, ramc, obliquity, latitude);
      expect(houses.midheaven).toBeCloseTo(mc, 6);
    }
  });

  it("whole-sign cusps all fall exactly on a 30° sign boundary", () => {
    const houses = computeHouses("whole-sign", ramc, obliquity, latitude);
    for (const c of houses.cusps) {
      expect(c % 30).toBeCloseTo(0, 6);
    }
  });

  it("equal-house cusps are each exactly 30° apart, starting at the Ascendant", () => {
    const houses = computeHouses("equal", ramc, obliquity, latitude);
    for (let i = 0; i < 12; i++) {
      const diff = (houses.cusps[i] - houses.cusps[0] + 360) % 360;
      expect(diff).toBeCloseTo((i * 30) % 360, 6);
    }
  });

  it("falls back to whole-sign houses for Placidus near the polar circle, and says so", () => {
    const polarHouses = computeHouses("placidus", ramc, obliquity, 70);
    expect(polarHouses.fellBackToWholeSign).toBe(true);
    expect(polarHouses.system).toBe("placidus");
    for (const c of polarHouses.cusps) {
      expect(c % 30).toBeCloseTo(0, 6);
    }
  });

  it("does not fall back for Placidus at a temperate latitude", () => {
    const houses = computeHouses("placidus", ramc, obliquity, latitude);
    expect(houses.fellBackToWholeSign).toBeUndefined();
  });
});

describe("houseOfLongitude", () => {
  const cusps = Array.from({ length: 12 }, (_, i) => i * 30); // simple equal houses starting at 0°

  it("places a longitude exactly on a cusp into that house", () => {
    expect(houseOfLongitude(0, cusps)).toBe(1);
    expect(houseOfLongitude(90, cusps)).toBe(4);
  });

  it("places a longitude between two cusps into the earlier house", () => {
    expect(houseOfLongitude(15, cusps)).toBe(1);
    expect(houseOfLongitude(359, cusps)).toBe(12);
  });

  it("wraps correctly across the 0°/360° boundary", () => {
    const rotated = Array.from({ length: 12 }, (_, i) => (350 + i * 30) % 360); // cusp 1 at 350°
    expect(houseOfLongitude(355, rotated)).toBe(1); // just past the wrap
    expect(houseOfLongitude(5, rotated)).toBe(1); // wrapped into house 1's span (350-20)
  });
});
