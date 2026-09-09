import { describe, it, expect } from "vitest";
import { computeDegreeReading } from "@/lib/astro/degrees";
import { describeDegree } from "@/lib/astro/interpretations/compose";

describe("computeDegreeReading", () => {
  it("assigns the Chaldean decan ruler in sequence (Mars, Sun, Venus, Mercury, Moon, Saturn, Jupiter, repeat)", () => {
    // 0° Bélier: decan 0 globally -> Mars.
    expect(computeDegreeReading(0).decanRuler).toBe("Mars");
    // 10° Bélier: decan 1 globally -> Soleil.
    expect(computeDegreeReading(10).decanRuler).toBe("Soleil");
    // 20° Bélier: decan 2 globally -> Vénus.
    expect(computeDegreeReading(20).decanRuler).toBe("Vénus");
    // 0° Taureau (30°): decan 3 globally -> Mercure.
    expect(computeDegreeReading(30).decanRuler).toBe("Mercure");
    // Global decan 7 (7 mod 7 = 0) must cycle back to Mars: that's decan
    // index 7*10=70° -> 10° Gémeaux (sign index 2, decan 1 -> global 2*3+1=7).
    expect(computeDegreeReading(70).decanRuler).toBe("Mars");
  });

  it("classifies the phase within the sign as précoce / médiane / tardive", () => {
    expect(computeDegreeReading(5).phase).toBe("précoce");
    expect(computeDegreeReading(15).phase).toBe("médiane");
    expect(computeDegreeReading(25).phase).toBe("tardive");
    // Boundaries are inclusive on the lower edge.
    expect(computeDegreeReading(10).phase).toBe("médiane");
    expect(computeDegreeReading(20).phase).toBe("tardive");
  });

  it("flags the anaretic (29th) degree", () => {
    expect(computeDegreeReading(29).isAnaretic).toBe(true);
    expect(computeDegreeReading(29.5).isAnaretic).toBe(true);
    expect(computeDegreeReading(28.9).isAnaretic).toBe(false);
  });

  it("wraps longitudes outside [0, 360) the same way signOf does", () => {
    const a = computeDegreeReading(370); // == 10°
    const b = computeDegreeReading(10);
    expect(a.decanRuler).toBe(b.decanRuler);
    expect(a.phase).toBe(b.phase);
  });

  it("produces bilingual decan/phase text without leaking the other language", () => {
    const fr = computeDegreeReading(5, "fr");
    const en = computeDegreeReading(5, "en");
    expect(fr.decanText).toMatch(/décan/i);
    expect(en.decanText).toMatch(/decan/i);
    expect(en.decanText).not.toMatch(/décan/i);
  });

  it("caps degreeLabel at 29°59' instead of showing an out-of-range 30°00' when rounding pushes past the sign", () => {
    // 29.9998° in-sign rounds to 60' at the minute level; the label must stay
    // within the 0-30° range of the current sign rather than reading 30°00'.
    const reading = computeDegreeReading(29.9998);
    expect(reading.degreeLabel).toBe("29°59'");
  });

  it("exposes the sign's modality and a distinct, concrete critical-degree text per modality", () => {
    // 0° Bélier: cardinal sign, exactly on a critical degree (0°).
    const cardinal = computeDegreeReading(0);
    expect(cardinal.modality).toBe("Cardinal");
    expect(cardinal.isCritical).toBe(true);
    expect(cardinal.criticalText).toMatch(/point de bascule/);

    // 8° Taureau: fixed sign, exactly on a critical degree (8°).
    const fixed = computeDegreeReading(38);
    expect(fixed.modality).toBe("Fixe");
    expect(fixed.isCritical).toBe(true);
    expect(fixed.criticalText).toMatch(/ténacité/);

    // 4° Gémeaux: mutable sign, exactly on a critical degree (4°).
    const mutable = computeDegreeReading(64);
    expect(mutable.modality).toBe("Mutable");
    expect(mutable.isCritical).toBe(true);
    expect(mutable.criticalText).toMatch(/dispersion/);
  });
});

describe("describeDegree ruler connection", () => {
  // 0° Bélier -> decan ruler Mars (see the Chaldean sequence test above).
  it("omits the ruler-connection sentence when chartPoints isn't provided", () => {
    const text = describeDegree(0, "sun");
    expect(text).not.toMatch(/maître de ce décan/);
  });

  it("mentions the ruler's real sign and house once chartPoints is provided", () => {
    const text = describeDegree(0, "sun", "fr", { mars: { longitude: 40, house: 5 } }); // Mars at 10° Taureau
    expect(text).toMatch(/maître de ce décan, Mars, se trouve lui-même en Taureau \(maison 5\)/);
  });

  it("flags domicile when the ruler sits on one of its own classical signs", () => {
    const inDomicile = describeDegree(0, "sun", "fr", { mars: { longitude: 5 } }); // 5° Bélier: Mars domicile
    const notInDomicile = describeDegree(0, "sun", "fr", { mars: { longitude: 40 } }); // 10° Taureau: not
    expect(inDomicile).toMatch(/chez lui/);
    expect(notInDomicile).not.toMatch(/chez lui/);
  });

  it("produces bilingual ruler-connection text without leaking the other language", () => {
    const en = describeDegree(0, "sun", "en", { mars: { longitude: 5 } });
    expect(en).toMatch(/This decan's ruler, Mars, sits in Aries/);
    expect(en).not.toMatch(/maître de ce décan/);
  });

  it("grounds the phase, critical, and anaretic text in the specific point's own keyword", () => {
    // 5° Bélier: précoce phase, Soleil.
    const early = describeDegree(5, "sun", "fr");
    expect(early).toMatch(/Pour Soleil, cela s'exprime encore de façon brute et instinctive à travers/);
    // 29° Bélier: anaretic degree, Lune.
    const anaretic = describeDegree(29, "moon", "fr");
    expect(anaretic).toMatch(/Pour Lune, cela se traduit par une urgence à vivre pleinement/);
  });

  it("grounds the critical-degree text differently depending on the sign's modality", () => {
    // 0° Bélier: cardinal.
    expect(describeDegree(0, "mars", "fr")).toMatch(/à-coups décisifs/);
    // 8° Taureau: fixed.
    expect(describeDegree(38, "mars", "fr")).toMatch(/s'ancre plus profondément/);
    // 4° Gémeaux: mutable.
    expect(describeDegree(64, "mars", "fr")).toMatch(/risque de se disperser/);
  });
});
