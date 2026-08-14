import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { computeCompatibilityScore, compatibilityPunchline } from "@/lib/astro/compatibility-score";
import { composeSynastrySynthesis } from "@/lib/astro/interpretations/synastry-synthesis";

describe("composeSynastrySynthesis", () => {
  const chartA = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );
  const chartB = computeNatalChart(
    { date: "1998-03-12", time: "14:20", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
    "placidus"
  );
  const synastry = computeSynastry(chartA, chartB);
  const { percentage } = computeCompatibilityScore(synastry.aspects);
  const { text: punch } = compatibilityPunchline(percentage, synastry.aspects, "fr");

  it("names both people and the compatibility percentage in the overview", () => {
    const s = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punch, "Alice", "Bob", "amitie", "fr");
    expect(s.overview).toContain("Alice");
    expect(s.overview).toContain("Bob");
    expect(s.overview).toContain(`${percentage} %`);
  });

  it("surfaces tensions and strengths for a real pair with major aspects, covering all major aspects", () => {
    const s = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punch, "Alice", "Bob", "amitie", "fr");
    const majorAspects = synastry.aspects.filter((a) => a.major);
    const tenseAspects = majorAspects.filter((a) =>
      ["square", "opposition", "semi-square", "sesquiquadrate", "quincunx"].includes(a.aspect)
    );
    const flowingAspects = majorAspects.filter((a) => ["trine", "sextile"].includes(a.aspect));
    expect(s.tensions.length).toBe(tenseAspects.length);
    expect(s.strengths.length).toBe(flowingAspects.length);
  });

  it("surfaces a houses overview when both charts have reliable houses", () => {
    const s = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punch, "Alice", "Bob", "amitie", "fr");
    expect(s.housesOverview).not.toBeNull();
    expect(s.housesOverview).toContain("Alice");
    expect(s.housesOverview).toContain("Bob");
  });

  it("produces bilingual output without leaking the other language", () => {
    const fr = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punch, "Alice", "Bob", "amitie", "fr");
    const { text: punchEn } = compatibilityPunchline(percentage, synastry.aspects, "en");
    const en = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punchEn, "Alice", "Bob", "amitie", "en");
    expect(fr.overview).toMatch(/affichent/);
    expect(en.overview).toMatch(/score/);
  });

  it("is deterministic for the same inputs", () => {
    const a = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punch, "Alice", "Bob", "amitie", "fr");
    const b = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punch, "Alice", "Bob", "amitie", "fr");
    expect(a).toEqual(b);
  });

  it("never contains em-dashes, an AI-writing tell", () => {
    const s = composeSynastrySynthesis(synastry, chartA, chartB, percentage, punch, "Alice", "Bob", "amitie", "fr");
    expect(s.overview).not.toContain("—");
    expect(s.housesOverview).not.toContain("—");
    for (const t of s.tensions) expect(t).not.toContain("—");
    for (const st of s.strengths) expect(st).not.toContain("—");
  });
});
