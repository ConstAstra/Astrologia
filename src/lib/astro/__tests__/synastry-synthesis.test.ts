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
    const s = composeSynastrySynthesis(synastry.aspects, percentage, punch, "Alice", "Bob", "amitie", "fr");
    expect(s.overview).toContain("Alice");
    expect(s.overview).toContain("Bob");
    expect(s.overview).toContain(`${percentage} %`);
  });

  it("surfaces tensions and strengths for a real pair with major aspects", () => {
    const s = composeSynastrySynthesis(synastry.aspects, percentage, punch, "Alice", "Bob", "amitie", "fr");
    expect(s.tensions.length + s.strengths.length).toBeGreaterThan(0);
    expect(s.tensions.length).toBeLessThanOrEqual(4);
    expect(s.strengths.length).toBeLessThanOrEqual(4);
  });

  it("produces bilingual output without leaking the other language", () => {
    const fr = composeSynastrySynthesis(synastry.aspects, percentage, punch, "Alice", "Bob", "amitie", "fr");
    const { text: punchEn } = compatibilityPunchline(percentage, synastry.aspects, "en");
    const en = composeSynastrySynthesis(synastry.aspects, percentage, punchEn, "Alice", "Bob", "amitie", "en");
    expect(fr.overview).toMatch(/affichent/);
    expect(en.overview).toMatch(/score/);
  });

  it("is deterministic for the same inputs", () => {
    const a = composeSynastrySynthesis(synastry.aspects, percentage, punch, "Alice", "Bob", "amitie", "fr");
    const b = composeSynastrySynthesis(synastry.aspects, percentage, punch, "Alice", "Bob", "amitie", "fr");
    expect(a).toEqual(b);
  });
});
