import { describe, it, expect } from "vitest";
import { signOf, degreeInSign, toDegreeParts, formatLongitude } from "@/lib/astro/signs";

describe("signOf", () => {
  it("maps 0° to Bélier (first sign)", () => {
    expect(signOf(0)).toBe("belier");
  });

  it("maps the boundary just before 30° to Bélier, and exactly 30° to Taureau", () => {
    expect(signOf(29.999)).toBe("belier");
    expect(signOf(30)).toBe("taureau");
  });

  it("maps 359.999° to Poissons (last sign)", () => {
    expect(signOf(359.999)).toBe("poissons");
  });

  it("wraps longitudes outside [0, 360) via modulo", () => {
    expect(signOf(360)).toBe("belier");
    expect(signOf(390)).toBe("taureau");
    expect(signOf(-10)).toBe("poissons");
  });

  it("covers every 30° segment with the expected sign", () => {
    const expected = [
      "belier",
      "taureau",
      "gemeaux",
      "cancer",
      "lion",
      "vierge",
      "balance",
      "scorpion",
      "sagittaire",
      "capricorne",
      "verseau",
      "poissons",
    ];
    expected.forEach((sign, i) => {
      expect(signOf(i * 30 + 5)).toBe(sign);
    });
  });
});

describe("degreeInSign", () => {
  it("returns the offset within the current 30° sign", () => {
    expect(degreeInSign(0)).toBeCloseTo(0);
    expect(degreeInSign(35)).toBeCloseTo(5);
    expect(degreeInSign(95)).toBeCloseTo(5);
  });
});

describe("toDegreeParts", () => {
  it("splits a longitude into sign + degrees + minutes", () => {
    const parts = toDegreeParts(95.5); // 5°30' Cancer (Cancer starts at 90°)
    expect(parts.sign).toBe("cancer");
    expect(parts.degrees).toBe(5);
    expect(parts.minutes).toBe(30);
  });

  it("rolls 59.99 minutes up to the next degree instead of showing 60'", () => {
    const parts = toDegreeParts(30.999);
    expect(parts.minutes).toBe(0);
    expect(parts.degrees).toBe(1);
  });
});

describe("formatLongitude", () => {
  it("formats as degrees°minutes'", () => {
    expect(formatLongitude(95.5)).toBe("5°30'");
    expect(formatLongitude(0)).toBe("0°00'");
  });
});
