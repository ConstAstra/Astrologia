import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import {
  findSolarReturnMoment,
  computeActiveSolarReturnWindow,
  computeSolarReturnChart,
} from "@/lib/astro/solar-return";

const BIRTH = { date: "1990-06-15", time: "14:30", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 };
const natalChart = computeNatalChart(BIRTH, "placidus");
const natalSun = natalChart.points.sun.longitude;

describe("findSolarReturnMoment", () => {
  it("finds a moment where the transiting Sun sits on the natal Sun degree", () => {
    const moment = findSolarReturnMoment(natalSun, 2026, 6, 15);
    const chartAtMoment = computeNatalChart(
      { date: moment.toISOString().slice(0, 10), time: moment.toISOString().slice(11, 16), tzName: "UTC", latitude: 0, longitude: 0 },
      "whole-sign"
    );
    const diff = Math.abs(((chartAtMoment.points.sun.longitude - natalSun + 540) % 360) - 180);
    expect(diff).toBeLessThan(0.01);
  });

  it("lands close to the birthday each year", () => {
    const moment = findSolarReturnMoment(natalSun, 2026, 6, 15);
    expect(moment.getUTCFullYear()).toBe(2026);
    expect(moment.getUTCMonth()).toBe(5); // June
    expect(moment.getUTCDate()).toBeGreaterThanOrEqual(13);
    expect(moment.getUTCDate()).toBeLessThanOrEqual(17);
  });
});

describe("computeActiveSolarReturnWindow", () => {
  it("returns a window whose start is at or before `now`, and end a year later", () => {
    const now = new Date("2026-08-01T12:00:00Z");
    const window = computeActiveSolarReturnWindow(natalSun, 6, 15, now);
    expect(window.start.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(window.end.getTime()).toBeGreaterThan(now.getTime());
    expect(window.year).toBe(2026);
  });

  it("falls back to last year's return when the birthday hasn't happened yet this year", () => {
    const now = new Date("2026-03-01T12:00:00Z"); // before the June birthday
    const window = computeActiveSolarReturnWindow(natalSun, 6, 15, now);
    expect(window.year).toBe(2025);
    expect(window.start.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(window.end.getTime()).toBeGreaterThan(now.getTime());
  });
});

describe("computeSolarReturnChart", () => {
  it("produces a full chart (houses, angles) for the exact return moment", () => {
    const moment = findSolarReturnMoment(natalSun, 2026, 6, 15);
    const returnChart = computeSolarReturnChart(BIRTH, moment);
    expect(returnChart.hasReliableHouses).toBe(true);
    const diff = Math.abs(((returnChart.points.sun.longitude - natalSun + 540) % 360) - 180);
    expect(diff).toBeLessThan(0.05);
  });
});
