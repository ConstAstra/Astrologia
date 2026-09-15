import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeTransitAspects } from "@/lib/astro/transits";
import { computeMoonPhase } from "@/lib/astro/moonphase";
import { composeEventBriefing, EVENT_TYPES } from "@/lib/astro/interpretations/event-transits";

describe("composeEventBriefing", () => {
  const chart = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );
  const date = new Date("2026-09-05T12:00:00+02:00");
  const aspects = computeTransitAspects(chart, date);
  const moon = computeMoonPhase(date);

  it("returns null when the birth time is unknown (houses unreliable)", () => {
    const noTimeChart = computeNatalChart(
      { date: "2001-08-25", time: null, tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357, timeUnknown: true },
      "whole-sign"
    );
    const noTimeAspects = computeTransitAspects(noTimeChart, date);
    expect(composeEventBriefing(noTimeChart, date, noTimeAspects, moon, "voyage", "fr")).toBeNull();
  });

  it("produces a non-empty briefing for every event type", () => {
    for (const eventType of EVENT_TYPES) {
      const briefing = composeEventBriefing(chart, date, aspects, moon, eventType, "fr")!;
      expect(briefing).not.toBeNull();
      expect(briefing.housePlacements).toHaveLength(6);
      expect(briefing.eventLabel.length).toBeGreaterThan(0);
      expect(briefing.intro.length).toBeGreaterThan(0);
      expect(briefing.templateSynthesis.length).toBeGreaterThan(0);
    }
  });

  it("flags Vénus in Maison V (le plaisir) as focus for a mariage on this date (verified manually)", () => {
    const briefing = composeEventBriefing(chart, date, aspects, moon, "mariage", "fr")!;
    const venus = briefing.housePlacements.find((p) => p.planet === "venus")!;
    expect(venus.house).toBe(5);
    expect(venus.isFocus).toBe(true);
  });

  it("does not flag Maison V as focus for a soutenance (different focus houses)", () => {
    const briefing = composeEventBriefing(chart, date, aspects, moon, "soutenance", "fr")!;
    const venus = briefing.housePlacements.find((p) => p.planet === "venus")!;
    expect(venus.house).toBe(5);
    expect(venus.isFocus).toBe(false);
  });

  it("delegates the anniversaire event type to composeSocialWeather's own house-flavor logic", () => {
    const briefing = composeEventBriefing(chart, date, aspects, moon, "anniversaire", "fr")!;
    const mars = briefing.housePlacements.find((p) => p.planet === "mars")!;
    // Vérifié manuellement : Mars en Maison I ce jour-là, maison "sociale" pour composeSocialWeather.
    expect(mars.house).toBe(1);
    expect(mars.isFocus).toBe(true);
  });

  it("caps aspects at 6 and produces readable sentences", () => {
    const briefing = composeEventBriefing(chart, date, aspects, moon, "voyage", "fr")!;
    expect(briefing.aspects.length).toBeLessThanOrEqual(6);
    for (const a of briefing.aspects) {
      expect(a.text.length).toBeGreaterThan(0);
      expect(["harmonieux", "tendu", "neutre"]).toContain(a.tone);
    }
  });

  it("produces bilingual output without leaking the other language", () => {
    const fr = composeEventBriefing(chart, date, aspects, moon, "soutenance", "fr")!;
    const en = composeEventBriefing(chart, date, aspects, moon, "soutenance", "en")!;
    expect(fr.eventLabel).not.toBe(en.eventLabel);
    expect(fr.housePlacements[0].houseName).toMatch(/Maison/);
    expect(en.housePlacements[0].houseName).toMatch(/House/);
  });
});
