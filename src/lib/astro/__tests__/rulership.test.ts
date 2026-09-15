import { describe, it, expect } from "vitest";
import { ascendantRulerOf, SIGN_RULER } from "@/lib/astro/interpretations/rulership";
import { ZODIAC_SIGNS } from "@/lib/astro/types";

describe("SIGN_RULER / ascendantRulerOf", () => {
  it("has a ruler for every zodiac sign", () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(SIGN_RULER[sign]).toBeDefined();
    }
  });

  it("uses classical rulership for the 7 signs unaffected by the outer planets", () => {
    expect(ascendantRulerOf("belier")).toBe("mars");
    expect(ascendantRulerOf("taureau")).toBe("venus");
    expect(ascendantRulerOf("gemeaux")).toBe("mercury");
    expect(ascendantRulerOf("cancer")).toBe("moon");
    expect(ascendantRulerOf("lion")).toBe("sun");
    expect(ascendantRulerOf("vierge")).toBe("mercury");
    expect(ascendantRulerOf("sagittaire")).toBe("jupiter");
    expect(ascendantRulerOf("capricorne")).toBe("saturn");
  });

  it("uses modern rulership for Scorpion/Verseau/Poissons", () => {
    expect(ascendantRulerOf("scorpion")).toBe("pluto");
    expect(ascendantRulerOf("verseau")).toBe("uranus");
    expect(ascendantRulerOf("poissons")).toBe("neptune");
  });

  it("Vénus and Balance both point back to venus (dual classical rulership)", () => {
    expect(ascendantRulerOf("balance")).toBe("venus");
  });
});
