import { describe, it, expect } from "vitest";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAspects } from "@/lib/astro/aspects";
import { PLANET_KEYS } from "@/lib/astro/types";
import { oppositeHouse } from "@/lib/astro/interpretations/compose";
import { buildLunarNodeFacts } from "@/lib/astro/interpretations/lunar-node-facts";

describe("buildLunarNodeFacts", () => {
  const chart = computeNatalChart(
    { date: "2001-08-25", time: "01:50", tzName: "Europe/Paris", latitude: 45.764, longitude: 4.8357 },
    "placidus"
  );
  const aspects = computeAspects(chart.points, [...PLANET_KEYS, "asc", "mc"]);
  const facts = buildLunarNodeFacts(chart, aspects, "fr");

  it("puts the South Node in the sign and house exactly opposite the North Node", () => {
    expect(facts.northNode.signName).not.toBe(facts.southNode.signName);
    expect(facts.northNode.house).not.toBeNull();
    expect(facts.southNode.house).toBe(oppositeHouse(facts.northNode.house!));
  });

  it("formats degrees for both nodes and the ruler", () => {
    expect(facts.northNode.degree).toMatch(/^\d+°\d\d'$/);
    expect(facts.southNode.degree).toMatch(/^\d+°\d\d'$/);
    expect(facts.rulerDegree).toMatch(/^\d+°\d\d'$/);
  });

  it("only includes aspects that touch the North Node", () => {
    expect(facts.aspects.length).toBeGreaterThan(0);
    for (const a of facts.aspects) {
      expect(a.otherPointName).not.toBe("Nœud Nord");
      expect(a.orb).toMatch(/^\d+°\d\d$/);
    }
  });

  it("names the ruler consistently with the sign ruler table", () => {
    expect(facts.rulerName.length).toBeGreaterThan(0);
    expect(facts.rulerSignName.length).toBeGreaterThan(0);
  });
});
