import { describe, it, expect } from "vitest";
import { projectAstroCartoLines } from "@/components/map/ProjectedLine";
import { MAJOR_COUNTRIES } from "@/components/map/majorCountries";
import { MAJOR_COUNTRIES_EN } from "@/components/map/majorCountries.en";

describe("projectAstroCartoLines country path identification", () => {
  it("attaches a countryId to every polygon whose topojson name matches a MAJOR_COUNTRIES entry (fr)", () => {
    const data = projectAstroCartoLines([], 960, 500, "fr");
    const matchedIds = new Set(data.countryPaths.map((cp) => cp.countryId).filter((id): id is string => id !== undefined));
    for (const country of MAJOR_COUNTRIES) {
      expect(matchedIds.has(country.id)).toBe(true);
    }
  });

  it("attaches a countryId to every polygon whose topojson name matches a MAJOR_COUNTRIES_EN entry (en)", () => {
    const data = projectAstroCartoLines([], 960, 500, "en");
    const matchedIds = new Set(data.countryPaths.map((cp) => cp.countryId).filter((id): id is string => id !== undefined));
    for (const country of MAJOR_COUNTRIES_EN) {
      expect(matchedIds.has(country.id)).toBe(true);
    }
  });

  it("leaves countryId undefined for polygons outside the curated list", () => {
    const data = projectAstroCartoLines([], 960, 500, "fr");
    const unmatched = data.countryPaths.filter((cp) => cp.countryId === undefined);
    // La liste couverte (24 pays) est bien plus petite que le nombre total de
    // polygones du monde (177) : la grande majorité doit rester non cliquable.
    expect(unmatched.length).toBeGreaterThan(data.countryPaths.length - MAJOR_COUNTRIES.length - 5);
  });

  it("every matched path has a non-empty SVG path string", () => {
    const data = projectAstroCartoLines([], 960, 500, "fr");
    for (const cp of data.countryPaths) {
      expect(cp.d.length).toBeGreaterThan(0);
    }
  });
});
