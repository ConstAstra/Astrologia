import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { buildSynastryFacts } from "@/lib/astro/interpretations/synastry-facts";

describe("buildSynastryFacts", () => {
  const chartA = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );
  const chartB = computeNatalChart(
    { date: "1998-03-12", time: "14:20", tzName: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
    "placidus"
  );
  const synastry = computeSynastry(chartA, chartB);
  const facts = buildSynastryFacts(chartA, chartB, synastry, "Personne A", "Personne B", "fr");

  it("uses the anonymized labels given, never a real name", () => {
    expect(facts.personA.label).toBe("Personne A");
    expect(facts.personB.label).toBe("Personne B");
  });

  it("lists each person's own planets with sign, house, and degree", () => {
    expect(facts.personA.planets.length).toBeGreaterThan(5);
    expect(facts.personB.planets.length).toBeGreaterThan(5);
    for (const p of [...facts.personA.planets, ...facts.personB.planets]) {
      expect(p.degree).toMatch(/^\d+°\d\d'$/);
    }
  });

  it("orders cross-chart aspects tightest-first and labels each side", () => {
    expect(facts.crossAspects.length).toBeGreaterThan(0);
    for (const a of facts.crossAspects) {
      expect(a.aLabel).toMatch(/^Personne A ·/);
      expect(a.bLabel).toMatch(/^Personne B ·/);
    }
    const orbs = facts.crossAspects.map((a) => parseFloat(a.orb.replace("°", ".")));
    for (let i = 1; i < orbs.length; i++) {
      expect(orbs[i]).toBeGreaterThanOrEqual(orbs[i - 1] - 0.01);
    }
  });

  it("describes house overlays in both directions with real house numbers", () => {
    expect(facts.overlaysAinB.length + facts.overlaysBinA.length).toBeGreaterThan(0);
    for (const line of [...facts.overlaysAinB, ...facts.overlaysBinA]) {
      expect(line).toMatch(/maison \d{1,2} de Personne [AB]$/);
    }
  });
});
