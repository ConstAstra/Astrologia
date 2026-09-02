import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { findUpcomingTransitAlert } from "@/lib/astro/interpretations/upcoming-transit-alert";

describe("findUpcomingTransitAlert", () => {
  const chart = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );

  it("finds a near-exact major aspect on a personal point 3 days ahead (verified manually)", () => {
    const today = new Date("2026-01-01T12:00:00Z");
    const alert = findUpcomingTransitAlert(chart, today, "fr")!;
    expect(alert).not.toBeNull();
    expect(alert.targetDate.toISOString().slice(0, 10)).toBe("2026-01-04");
    expect(alert.aspect.transitingPlanet).toBe("uranus");
    expect(alert.aspect.natalPoint).toBe("venus");
    expect(alert.aspect.aspect).toBe("sextile");
    expect(Math.abs(alert.aspect.exact)).toBeLessThan(0.5);
    expect(alert.title.length).toBeGreaterThan(0);
    expect(alert.body).toContain("Uranus");
  });

  it("returns null when nothing peaks in 3 days (verified manually)", () => {
    const today = new Date("2026-03-05T12:00:00Z");
    expect(findUpcomingTransitAlert(chart, today, "fr")).toBeNull();
  });

  it("never targets the Ascendant when the birth time is unknown, unlike the same date with a reliable chart (verified manually)", () => {
    const noTimeChart = computeNatalChart(
      { date: "2001-08-25", time: null, tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357, timeUnknown: true },
      "whole-sign"
    );
    const today = new Date("2026-02-25T12:00:00Z");
    const withHouses = findUpcomingTransitAlert(chart, today, "fr")!;
    expect(withHouses.aspect.natalPoint).toBe("asc");

    const withoutHouses = findUpcomingTransitAlert(noTimeChart, today, "fr");
    expect(withoutHouses?.aspect.natalPoint).not.toBe("asc");
  });

  it("produces bilingual output", () => {
    const today = new Date("2026-01-01T12:00:00Z");
    const fr = findUpcomingTransitAlert(chart, today, "fr")!;
    const en = findUpcomingTransitAlert(chart, today, "en")!;
    expect(fr.title).not.toBe(en.title);
    expect(fr.body).not.toBe(en.body);
  });
});
