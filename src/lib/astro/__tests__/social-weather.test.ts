import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeTransitAspects } from "@/lib/astro/transits";
import { composeSocialWeather } from "@/lib/astro/interpretations/social-weather";

describe("composeSocialWeather", () => {
  const chart = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );

  it("returns null when the birth time is unknown (houses unreliable)", () => {
    const noTimeChart = computeNatalChart(
      { date: "2001-08-25", time: null, tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357, timeUnknown: true },
      "whole-sign"
    );
    const date = new Date("2026-09-05T12:00:00+02:00");
    const aspects = computeTransitAspects(noTimeChart, date);
    expect(composeSocialWeather(noTimeChart, date, aspects, "fr")).toBeNull();
  });

  it("places all six social planets, one per planet", () => {
    const date = new Date("2026-09-05T12:00:00+02:00");
    const aspects = computeTransitAspects(chart, date);
    const weather = composeSocialWeather(chart, date, aspects, "fr")!;
    expect(weather.placements).toHaveLength(6);
    expect(weather.placements.map((p) => p.planet).sort()).toEqual(
      ["jupiter", "mars", "mercury", "moon", "sun", "venus"].sort()
    );
    // Vénus en Maison V (le plaisir) et Mars en Maison I (l'identité) ce jour-là, vérifiés manuellement.
    expect(weather.placements.find((p) => p.planet === "venus")?.house).toBe(5);
    expect(weather.placements.find((p) => p.planet === "venus")?.flavor).toBe("social");
    expect(weather.placements.find((p) => p.planet === "mars")?.house).toBe(1);
    expect(weather.placements.find((p) => p.planet === "mars")?.flavor).toBe("social");
  });

  it("flags a Moon-Jupiter conjunction as a highlight (verified: exact around Sept 6, 2026)", () => {
    const date = new Date("2026-09-06T12:00:00+02:00");
    const aspects = computeTransitAspects(chart, date);
    const weather = composeSocialWeather(chart, date, aspects, "fr")!;
    expect(weather.highlights.some((h) => h.includes("Lune et Jupiter"))).toBe(true);
  });

  it("flags a Mercury-Mars square as a caution (verified: applying around Sept 5-6, 2026)", () => {
    const date = new Date("2026-09-05T12:00:00+02:00");
    const aspects = computeTransitAspects(chart, date);
    const weather = composeSocialWeather(chart, date, aspects, "fr")!;
    expect(weather.cautions.some((c) => c.includes("Mercure carré Mars"))).toBe(true);
  });

  it("produces a synthesis that reflects the count of outward-facing placements", () => {
    const date = new Date("2026-09-05T12:00:00+02:00");
    const aspects = computeTransitAspects(chart, date);
    const weather = composeSocialWeather(chart, date, aspects, "fr")!;
    const socialCount = weather.placements.filter((p) => p.flavor === "social").length;
    expect(weather.synthesis.length).toBeGreaterThan(0);
    if (socialCount >= 4) expect(weather.synthesis).toMatch(/tourné vers l'extérieur/);
    else if (socialCount <= 1) expect(weather.synthesis).toMatch(/intime/);
  });

  it("produces bilingual output without leaking the other language", () => {
    const date = new Date("2026-09-06T12:00:00+02:00");
    const aspects = computeTransitAspects(chart, date);
    const fr = composeSocialWeather(chart, date, aspects, "fr")!;
    const en = composeSocialWeather(chart, date, aspects, "en")!;
    expect(fr.synthesis).not.toBe(en.synthesis);
    expect(fr.placements[0].houseName).toMatch(/Maison/);
    expect(en.placements[0].houseName).toMatch(/House/);
  });
});
