import { describe, it, expect } from "vitest";
import { computeDegreeReading } from "@/lib/astro/degrees";

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
});
