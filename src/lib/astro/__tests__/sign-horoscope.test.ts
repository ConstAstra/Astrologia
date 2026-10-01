import { describe, it, expect } from "vitest";
import { composeSignHoroscope } from "@/lib/astro/interpretations/sign-horoscope";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";

describe("composeSignHoroscope", () => {
  const date = new Date("2026-08-07T17:00:00Z");

  it("produces a complete reading for every sign", () => {
    for (const sign of ZODIAC_SIGNS) {
      const h = composeSignHoroscope(sign, date, "fr");
      expect(h.sign).toBe(sign);
      expect(h.headline.length).toBeGreaterThan(0);
      expect(h.punchline.length).toBeGreaterThan(0);
      expect(h.punchline).toContain(SIGN_META[sign].name);
      expect(h.moonPhaseLine.length).toBeGreaterThan(0);
      expect(h.housePlacements).toHaveLength(6);
      expect(h.precisionNote.length).toBeGreaterThan(0);
      for (const p of h.housePlacements) {
        expect(p.house).toBeGreaterThanOrEqual(1);
        expect(p.house).toBeLessThanOrEqual(12);
      }
    }
  });

  it("places the transiting Sun in House V for Bélier on this date (verified manually)", () => {
    const h = composeSignHoroscope("belier", date, "fr");
    const sun = h.housePlacements.find((p) => p.planet === "sun")!;
    expect(sun.house).toBe(5);
    expect(sun.houseName).toContain("Maison V");
  });

  it("shifts the same transiting Sun to a different whole-sign house for a different anchor sign", () => {
    const belier = composeSignHoroscope("belier", date, "fr");
    const cancer = composeSignHoroscope("cancer", date, "fr");
    const sunBelier = belier.housePlacements.find((p) => p.planet === "sun")!;
    const sunCancer = cancer.housePlacements.find((p) => p.planet === "sun")!;
    expect(sunBelier.house).not.toBe(sunCancer.house);
  });

  it("finds a Vénus carré Mars mundane aspect on this date (verified manually)", () => {
    const h = composeSignHoroscope("balance", date, "fr");
    expect(h.skyAspectText).not.toBeNull();
    expect(h.skyAspectText).toContain("Vénus");
    expect(h.skyAspectText).toContain("Mars");
    expect(h.skyAspectText).toContain("carré");
  });

  it("produces the exact same sky aspect text regardless of the anchor sign (same sky for everyone)", () => {
    const belier = composeSignHoroscope("belier", date, "fr");
    const poissons = composeSignHoroscope("poissons", date, "fr");
    expect(belier.skyAspectText).toBe(poissons.skyAspectText);
  });

  it("reflects the tense tone of the featured mundane aspect (Vénus carré Mars) in the punchline suffix", () => {
    const h = composeSignHoroscope("balance", date, "fr");
    expect(h.punchline).toContain("pas sans un peu de friction");
  });

  it("produces bilingual output without leaking the other language", () => {
    const fr = composeSignHoroscope("lion", date, "fr");
    const en = composeSignHoroscope("lion", date, "en");
    expect(fr.headline).not.toBe(en.headline);
    expect(fr.punchline).not.toBe(en.punchline);
    expect(fr.housePlacements[0].houseName).toMatch(/Maison/);
    expect(en.housePlacements[0].houseName).toMatch(/House/);
    expect(fr.precisionNote).not.toBe(en.precisionNote);
  });
});
