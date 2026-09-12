import { describe, it, expect } from "vitest";
import { dignitiesOf, dignityLabel } from "@/lib/astro/interpretations/dignities";
import { PLANET_KEYS, ZODIAC_SIGNS } from "@/lib/astro/types";

describe("dignitiesOf", () => {
  it("finds domicile for every sign's ruler", () => {
    expect(dignitiesOf("mars", "belier")).toEqual(["domicile"]);
    expect(dignitiesOf("venus", "taureau")).toEqual(["domicile"]);
    expect(dignitiesOf("pluto", "scorpion")).toEqual(["domicile"]);
    expect(dignitiesOf("uranus", "verseau")).toEqual(["domicile"]);
    expect(dignitiesOf("neptune", "poissons")).toEqual(["domicile"]);
  });

  it("finds exaltation and its opposite fall for the 7 classical planets", () => {
    expect(dignitiesOf("sun", "belier")).toEqual(["exaltation"]);
    expect(dignitiesOf("sun", "balance")).toEqual(["chute"]);
    expect(dignitiesOf("moon", "taureau")).toEqual(["exaltation"]);
    expect(dignitiesOf("moon", "scorpion")).toEqual(["chute"]);
    expect(dignitiesOf("saturn", "balance")).toEqual(["exaltation"]);
    expect(dignitiesOf("saturn", "belier")).toEqual(["chute"]);
  });

  it("finds exil (detriment) as the sign opposite domicile", () => {
    expect(dignitiesOf("mars", "balance")).toEqual(["exil"]);
    expect(dignitiesOf("venus", "scorpion")).toEqual(["exil"]);
    expect(dignitiesOf("sun", "verseau")).toEqual(["exil"]);
  });

  it("returns an empty array for a neutral sign", () => {
    expect(dignitiesOf("mars", "gemeaux")).toEqual([]);
    expect(dignitiesOf("jupiter", "taureau")).toEqual([]);
  });

  it("finds the double dignity of Mercure in Vierge (domicile AND exaltation)", () => {
    expect(dignitiesOf("mercury", "vierge")).toEqual(["domicile", "exaltation"]);
  });

  it("never asserts exaltation/chute for the three outer planets", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(dignitiesOf("uranus", sign)).not.toContain("exaltation");
      expect(dignitiesOf("uranus", sign)).not.toContain("chute");
      expect(dignitiesOf("neptune", sign)).not.toContain("exaltation");
      expect(dignitiesOf("neptune", sign)).not.toContain("chute");
      expect(dignitiesOf("pluto", sign)).not.toContain("exaltation");
      expect(dignitiesOf("pluto", sign)).not.toContain("chute");
    }
  });

  it("every planet has at least one domicile sign among the 12 (Mercure/Vénus have two)", () => {
    for (const planet of PLANET_KEYS) {
      if (planet === "northNode") continue;
      const domiciles = ZODIAC_SIGNS.filter((sign) => dignitiesOf(planet, sign).includes("domicile"));
      expect(domiciles.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("dignityLabel", () => {
  it("returns a French label by default", () => {
    expect(dignityLabel("domicile")).toBe("en domicile");
    expect(dignityLabel("exaltation")).toBe("exalté");
  });

  it("returns an English label", () => {
    expect(dignityLabel("domicile", "en")).toBe("in domicile");
    expect(dignityLabel("chute", "en")).toBe("in fall");
  });
});
