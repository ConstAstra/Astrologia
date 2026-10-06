import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { computeCompatibilityScore, compatibilityPunchline } from "@/lib/astro/compatibility-score";
import type { SynastryAspect } from "@/lib/astro/synastry";

describe("computeCompatibilityScore", () => {
  const personA = { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 };
  const personB = { date: "1998-03-14", time: "14:20", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 };

  it("returns a percentage strictly between 10 and 95", () => {
    const chartA = computeNatalChart(personA, "placidus");
    const chartB = computeNatalChart(personB, "placidus");
    const { percentage } = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    expect(percentage).toBeGreaterThan(10);
    expect(percentage).toBeLessThan(95);
  });

  it("is symmetric: A-with-B equals B-with-A", () => {
    const chartA = computeNatalChart(personA, "placidus");
    const chartB = computeNatalChart(personB, "placidus");
    const scoreAB = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    const scoreBA = computeCompatibilityScore(computeSynastry(chartB, chartA).aspects);
    expect(scoreAB.percentage).toBe(scoreBA.percentage);
  });

  it("is deterministic for the same two charts", () => {
    const chartA = computeNatalChart(personA, "placidus");
    const chartB = computeNatalChart(personB, "placidus");
    const a = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    const b = computeCompatibilityScore(computeSynastry(chartA, chartB).aspects);
    expect(a).toEqual(b);
  });

  it("returns a neutral-ish percentage for an empty aspect list", () => {
    const { percentage, raw } = computeCompatibilityScore([]);
    expect(raw).toBe(0);
    expect(percentage).toBeGreaterThanOrEqual(50);
    expect(percentage).toBeLessThanOrEqual(55);
  });

  it("scores a chart with only tight harmonious aspects higher than one with only tight tense aspects", () => {
    const harmonious = computeCompatibilityScore([
      { personA: "sun", personB: "moon", aspect: "trine", angle: 120, orb: 7, exact: 0.2, applying: true, major: true },
      { personA: "venus", personB: "mars", aspect: "sextile", angle: 60, orb: 5, exact: 0.1, applying: true, major: true },
    ]);
    const tense = computeCompatibilityScore([
      { personA: "sun", personB: "moon", aspect: "square", angle: 90, orb: 7, exact: 0.2, applying: true, major: true },
      { personA: "venus", personB: "mars", aspect: "opposition", angle: 180, orb: 8, exact: 0.1, applying: true, major: true },
    ]);
    expect(harmonious.percentage).toBeGreaterThan(tense.percentage);
  });
});

describe("compatibilityPunchline", () => {
  // Aspects majeurs entre points "chauds" (sun/moon/venus/mars/asc) dont les
  // contributions harmonieuses et tendues s'équilibrent exactement — profil
  // "chaotique" au sens de computeSynastryIntensity (beaucoup en jeu, aucun
  // camp qui domine).
  const chaoticHotAspects: SynastryAspect[] = [
    { personA: "sun", personB: "venus", aspect: "trine", angle: 120, orb: 8, exact: 0.5, applying: true, major: true },
    { personA: "moon", personB: "mars", aspect: "square", angle: 90, orb: 8, exact: 0.5, applying: true, major: true },
    { personA: "venus", personB: "mars", aspect: "sextile", angle: 60, orb: 6, exact: 0.3, applying: true, major: true },
    { personA: "sun", personB: "mars", aspect: "opposition", angle: 180, orb: 8, exact: 0.4, applying: true, major: true },
    { personA: "moon", personB: "venus", aspect: "trine", angle: 120, orb: 8, exact: 0.5, applying: true, major: true },
    { personA: "asc", personB: "mars", aspect: "square", angle: 90, orb: 8, exact: 0.5, applying: true, major: true },
  ];

  // Mêmes points chauds, mais tous harmonieux : beaucoup en jeu (amplitude
  // élevée) sans aucune tension en face — "calme" malgré l'intensité.
  const oneSidedHotAspects: SynastryAspect[] = [
    { personA: "sun", personB: "venus", aspect: "trine", angle: 120, orb: 8, exact: 0.3, applying: true, major: true },
    { personA: "moon", personB: "mars", aspect: "trine", angle: 120, orb: 8, exact: 0.3, applying: true, major: true },
    { personA: "venus", personB: "mars", aspect: "sextile", angle: 60, orb: 6, exact: 0.2, applying: true, major: true },
  ];

  it("picks the chaotic tier when hot points balance harmony and tension", () => {
    const { percentage } = computeCompatibilityScore(chaoticHotAspects);
    expect(compatibilityPunchline(percentage, chaoticHotAspects, "romantique", "fr").text).toBe("Intense mais chaotique");
    expect(compatibilityPunchline(percentage, chaoticHotAspects, "romantique", "en").text).toBe("Intense but chaotic");
  });

  it("picks the calm tier when hot points lean entirely one way, even at high amplitude", () => {
    const { percentage } = computeCompatibilityScore(oneSidedHotAspects);
    expect(compatibilityPunchline(percentage, oneSidedHotAspects, "romantique", "fr").text).toBe("Fusion rare");
  });

  it("picks the calm tier with no aspects at all", () => {
    const { percentage } = computeCompatibilityScore([]);
    expect(compatibilityPunchline(percentage, [], "romantique", "fr").text).toBe("Ça se construit");
  });

  it("defaults to romantic tiers and french when neither is given", () => {
    const { percentage } = computeCompatibilityScore([]);
    expect(compatibilityPunchline(percentage, []).text).toBe("Ça se construit");
  });

  it("picks non-romantic tiers for other relationship types, never mentioning passion or attraction", () => {
    const { percentage } = computeCompatibilityScore(chaoticHotAspects);
    for (const type of ["amitie", "famille", "collegue"] as const) {
      const { text } = compatibilityPunchline(percentage, chaoticHotAspects, type, "fr");
      expect(text).not.toMatch(/passion|attraction/i);
    }
  });

  it("covers the full 0-100 range without gaps, calm and chaotic alike", () => {
    for (let pct = 0; pct <= 100; pct++) {
      for (const aspects of [[], chaoticHotAspects]) {
        const { text, color } = compatibilityPunchline(pct, aspects, "romantique", "fr");
        expect(text.length).toBeGreaterThan(0);
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});
