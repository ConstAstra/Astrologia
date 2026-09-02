import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { composeChartSynthesis } from "@/lib/astro/interpretations/synthesis";

describe("composeChartSynthesis", () => {
  const chart = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );

  it("names Sun, Moon and Ascendant signs in the overview", () => {
    const s = composeChartSynthesis(chart, "fr");
    expect(s.overview).toMatch(/Soleil en Vierge/);
    expect(s.overview).toMatch(/Lune en Scorpion/);
    expect(s.overview).toMatch(/Ascendant en Cancer/);
  });

  it("lists every tied dominant element rather than picking one arbitrarily", () => {
    // This exact birth data produces a real Terre/Eau tie among personal
    // planets + Ascendant ruler (Moon) — a regression test for the bug where
    // the overview silently dropped ties by only reading dominantElements[0].
    const s = composeChartSynthesis(chart, "fr");
    expect(s.overview).toMatch(/Terre et Eau|Eau et Terre/);
  });

  it("identifies the Ascendant ruler and describes its sign/house placement", () => {
    const s = composeChartSynthesis(chart, "fr");
    expect(s.ascendantRulerIntro).toMatch(/Lune/);
    expect(s.ascendantRulerSign).not.toBeNull();
    expect(s.ascendantRulerHouse).not.toBeNull();
    expect(s.ascendantRulerHouse).toMatch(/maison VI/i);
  });

  it("omits the Ascendant ruler section when the birth time is unknown", () => {
    const noTimeChart = computeNatalChart(
      { date: "2001-08-25", time: null, tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357, timeUnknown: true },
      "whole-sign"
    );
    const s = composeChartSynthesis(noTimeChart, "fr");
    expect(s.ascendantRulerIntro).toBeNull();
    expect(s.ascendantRulerSign).toBeNull();
  });

  it("surfaces at least one contradiction and one strength for a chart with real tension/flow", () => {
    const s = composeChartSynthesis(chart, "fr");
    expect(s.contradictions.length).toBeGreaterThan(0);
    expect(s.strengths.length).toBeGreaterThan(0);
  });

  it("produces bilingual output without leaking the other language", () => {
    const fr = composeChartSynthesis(chart, "fr");
    const en = composeChartSynthesis(chart, "en");
    expect(fr.overview).toMatch(/Soleil/);
    expect(en.overview).toMatch(/Sun/);
    expect(en.overview).not.toMatch(/Soleil/);
    expect(en.ascendantRulerIntro).toMatch(/Ascendant is in/);
  });

  it("is deterministic for the same chart", () => {
    const a = composeChartSynthesis(chart, "fr");
    const b = composeChartSynthesis(chart, "fr");
    expect(a).toEqual(b);
  });

  it("covers all 12 houses in the life-domains reading, occupied or not", () => {
    const s = composeChartSynthesis(chart, "fr");
    expect(s.lifeDomains).toHaveLength(12);
    expect(s.lifeDomains.map((d) => d.house)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const domain of s.lifeDomains) {
      expect(domain.text.length).toBeGreaterThan(20);
    }
    // Maison VI est occupée (Lune) : le texte doit le refléter plutôt que
    // décrire une maison vide.
    const houseSix = s.lifeDomains.find((d) => d.house === 6)!;
    expect(houseSix.text).not.toMatch(/n'abrite aucune planète/);
  });

  it("reads an empty house indirectly through its cusp sign and ruler", () => {
    const s = composeChartSynthesis(chart, "fr");
    const emptyDomain = s.lifeDomains.find((d) => d.text.includes("n'abrite aucune planète"));
    expect(emptyDomain).toBeDefined();
    expect(emptyDomain!.text).toMatch(/son maître/);
  });

  it("omits life-domains entirely when the birth time is unknown", () => {
    const noTimeChart = computeNatalChart(
      { date: "2001-08-25", time: null, tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357, timeUnknown: true },
      "whole-sign"
    );
    const s = composeChartSynthesis(noTimeChart, "fr");
    expect(s.lifeDomains).toEqual([]);
  });
});
