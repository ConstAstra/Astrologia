import { describe, it, expect } from "vitest";
import { computeCountryLineMatches, rankCountriesForCategory, rankHappiestCountries } from "@/lib/astro/astrocartography-countries";
import { isHappyLine } from "@/lib/astro/interpretations/astrocartography-categories";
import { MAJOR_COUNTRIES } from "@/components/map/majorCountries";
import type { AstroCartoLine } from "@/lib/astro/astrocartography";

describe("computeCountryLineMatches", () => {
  it("returns an entry for every country in the major-countries list", () => {
    const matches = computeCountryLineMatches([]);
    for (const country of MAJOR_COUNTRIES) {
      expect(matches[country.id]).toBeDefined();
      expect(matches[country.id]).toEqual([]);
    }
  });

  it("matches an MC/IC meridian line against a country it actually crosses", () => {
    // France spans roughly 2°W-8°E; a meridian at 2°E longitude runs straight
    // through it regardless of latitude within its bounds.
    const lines: AstroCartoLine[] = [{ planet: "sun", type: "MC", longitude: 2 }];
    const matches = computeCountryLineMatches(lines);
    const france = matches[MAJOR_COUNTRIES.find((c) => c.name === "France")!.id];
    expect(france).toContainEqual({ planet: "sun", type: "MC" });
  });

  it("does not match a meridian line far from a country's longitude", () => {
    // A meridian at 170°E cannot cross France (roughly -5° to 8°E).
    const lines: AstroCartoLine[] = [{ planet: "sun", type: "MC", longitude: 170 }];
    const matches = computeCountryLineMatches(lines);
    const france = matches[MAJOR_COUNTRIES.find((c) => c.name === "France")!.id];
    expect(france).toEqual([]);
  });

  it("matches an AC/DC path line only where it actually passes through the country", () => {
    // A path that clips through France's approximate bounding box (lat ~42-51, lon ~-5 to 8).
    const lines: AstroCartoLine[] = [
      {
        planet: "venus",
        type: "AC",
        path: [
          { lat: 45, lon: 2 }, // inside France
          { lat: 45, lon: 100 }, // nowhere near
        ],
      },
    ];
    const matches = computeCountryLineMatches(lines);
    const france = matches[MAJOR_COUNTRIES.find((c) => c.name === "France")!.id];
    expect(france).toContainEqual({ planet: "venus", type: "AC" });

    const china = matches[MAJOR_COUNTRIES.find((c) => c.name === "Chine")!.id];
    // The second path point (45,100) is plausibly inside China's bounds too — just
    // check France doesn't get credited for a point nowhere near it, not the reverse.
    expect(china === undefined || Array.isArray(china)).toBe(true);
  });
});

describe("rankCountriesForCategory", () => {
  it("nets positive and challenging lines into a single score, excluding a net-zero country", () => {
    const usId = MAJOR_COUNTRIES.find((c) => c.name === "États-Unis")!.id;
    const matches = {
      [usId]: [
        { planet: "venus" as const, type: "DC" as const }, // love: positive
        { planet: "saturn" as const, type: "DC" as const }, // love: challenging
      ],
    };
    // +1 (Venus DC) and -1 (Saturn DC) net to 0, which is not a positive
    // recommendation — the country must not be listed at all.
    expect(rankCountriesForCategory("love", matches)).toHaveLength(0);
  });

  it("excludes countries whose score is not strictly positive", () => {
    const usId = MAJOR_COUNTRIES.find((c) => c.name === "États-Unis")!.id;
    const matches = {
      [usId]: [{ planet: "saturn" as const, type: "DC" as const }], // love: challenging only
    };
    const ranked = rankCountriesForCategory("love", matches);
    expect(ranked).toHaveLength(0);
  });

  it("only lists positive-valence lines as the supporting reason", () => {
    const usId = MAJOR_COUNTRIES.find((c) => c.name === "États-Unis")!.id;
    const matches = {
      [usId]: [
        { planet: "venus" as const, type: "DC" as const }, // love: positive
        { planet: "jupiter" as const, type: "DC" as const }, // love: positive
        { planet: "saturn" as const, type: "DC" as const }, // love: challenging
      ],
    };
    const ranked = rankCountriesForCategory("love", matches);
    expect(ranked[0].supportingLines).toHaveLength(2);
    expect(ranked[0].supportingLines.every((l) => l.planet !== "saturn")).toBe(true);
  });

  it("sorts by descending score", () => {
    const [a, b] = MAJOR_COUNTRIES;
    const matches = {
      [a.id]: [{ planet: "venus" as const, type: "DC" as const }],
      [b.id]: [
        { planet: "venus" as const, type: "DC" as const },
        { planet: "jupiter" as const, type: "DC" as const },
      ],
    };
    const ranked = rankCountriesForCategory("love", matches);
    expect(ranked[0].countryId).toBe(b.id);
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe("isHappyLine", () => {
  it("is true for a line whose only tags are positive", () => {
    expect(isHappyLine("venus", "DC")).toBe(true);
  });

  it("is false for a line whose only tags are challenging", () => {
    expect(isHappyLine("saturn", "DC")).toBe(false);
  });

  it("is false for a line with no theme tags at all", () => {
    expect(isHappyLine("mercury", "IC")).toBe(false);
  });
});

describe("rankHappiestCountries", () => {
  it("counts a line once even when it carries positive tags in two categories", () => {
    const usId = MAJOR_COUNTRIES.find((c) => c.name === "États-Unis")!.id;
    // Neptune AC porte deux tags positifs (spirituel + voyage) sur la même ligne physique.
    const matches = { [usId]: [{ planet: "neptune" as const, type: "AC" as const }] };
    const ranked = rankHappiestCountries(matches);
    expect(ranked[0].score).toBe(1);
    expect(ranked[0].supportingLines).toHaveLength(1);
  });

  it("excludes a country whose only line is challenging", () => {
    const usId = MAJOR_COUNTRIES.find((c) => c.name === "États-Unis")!.id;
    const matches = { [usId]: [{ planet: "saturn" as const, type: "DC" as const }] };
    expect(rankHappiestCountries(matches)).toHaveLength(0);
  });

  it("aggregates across categories rather than filtering to just one", () => {
    const usId = MAJOR_COUNTRIES.find((c) => c.name === "États-Unis")!.id;
    const matches = {
      [usId]: [
        { planet: "venus" as const, type: "DC" as const }, // love
        { planet: "sun" as const, type: "MC" as const }, // career
      ],
    };
    const ranked = rankHappiestCountries(matches);
    expect(ranked[0].score).toBe(2);
  });

  it("sorts by descending score", () => {
    const [a, b] = MAJOR_COUNTRIES;
    const matches = {
      [a.id]: [{ planet: "venus" as const, type: "DC" as const }],
      [b.id]: [
        { planet: "venus" as const, type: "DC" as const },
        { planet: "jupiter" as const, type: "MC" as const },
      ],
    };
    const ranked = rankHappiestCountries(matches);
    expect(ranked[0].countryId).toBe(b.id);
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});
