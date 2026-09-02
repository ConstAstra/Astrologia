import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAspects } from "@/lib/astro/aspects";
import { PLANET_KEYS } from "@/lib/astro/types";
import { describeLifeMission } from "@/lib/astro/interpretations/life-mission";

describe("describeLifeMission", () => {
  const chart = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );
  // Nœud Nord réel de ce thème : Cancer, Maison I.
  const aspects = computeAspects(chart.points, [...PLANET_KEYS, "asc", "mc"]);

  it("derives the South Node as the exact opposite sign and house of the North Node", () => {
    const m = describeLifeMission(chart, aspects, "fr");
    expect(m.northSign).toBe("cancer");
    expect(m.southSign).toBe("capricorne");
    expect(m.northHouse).toBe(1);
    expect(m.southHouse).toBe(7);
  });

  it("provides a free short summary (missionSignText) independent of the rest", () => {
    const m = describeLifeMission(chart, aspects, "fr");
    expect(m.missionSignText.length).toBeGreaterThan(0);
    expect(m.missionSignText).not.toBe(m.comfortSignText);
  });

  it("identifies the North Node's ruler (dispositor) and describes its placement", () => {
    const m = describeLifeMission(chart, aspects, "fr");
    // Cancer est gouverné par la Lune.
    expect(m.rulerPlanet).toBe("moon");
    expect(m.rulerIntro).toMatch(/Lune/);
    expect(m.rulerSignText.length).toBeGreaterThan(0);
    expect(m.rulerHouseText).toBeDefined();
  });

  it("collects every aspect touching the North Node, and only those", () => {
    const m = describeLifeMission(chart, aspects, "fr");
    const otherPoints = m.nodeAspects.map((na) => na.otherPoint).sort();
    expect(otherPoints).toEqual(["asc", "jupiter", "mc", "sun"].sort());
    for (const na of m.nodeAspects) {
      expect(na.aspect.a === "northNode" || na.aspect.b === "northNode").toBe(true);
      expect(na.text.length).toBeGreaterThan(0);
    }
  });

  it("produces a non-empty synthesis paragraph naming the sign and the ruler", () => {
    const m = describeLifeMission(chart, aspects, "fr");
    expect(m.synthesis).toMatch(/Cancer/);
    expect(m.synthesis).toMatch(/Lune/);
  });

  it("omits house-dependent text when the birth time is unknown", () => {
    const noTimeChart = computeNatalChart(
      { date: "2001-08-25", time: null, tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357, timeUnknown: true },
      "whole-sign"
    );
    const noTimeAspects = computeAspects(noTimeChart.points, [...PLANET_KEYS]);
    const m = describeLifeMission(noTimeChart, noTimeAspects, "fr");
    expect(m.northHouse).toBeUndefined();
    expect(m.southHouse).toBeUndefined();
    expect(m.missionHouseText).toBeUndefined();
    expect(m.comfortHouseText).toBeUndefined();
    expect(m.rulerHouseText).toBeUndefined();
    // La synthèse reste utile même sans maison connue.
    expect(m.synthesis.length).toBeGreaterThan(0);
  });

  it("produces bilingual output without leaking the other language", () => {
    const mFr = describeLifeMission(chart, aspects, "fr");
    const mEn = describeLifeMission(chart, aspects, "en");
    expect(mFr.rulerIntro).toMatch(/Lune/);
    expect(mEn.rulerIntro).toMatch(/Moon/);
    expect(mEn.rulerIntro).not.toMatch(/Lune/);
    expect(mFr.synthesis).not.toBe(mEn.synthesis);
  });
});
