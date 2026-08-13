import { describe, it, expect } from "vitest";
import { describeAspect } from "@/lib/astro/interpretations/compose";
import type { Aspect } from "@/lib/astro/types";

describe("describeAspect — French preposition contraction", () => {
  it("contracts 'à' + 'le' into 'au' for a conjunction with a masculine object (Jupiter conjunct North Node)", () => {
    const aspect: Aspect = { a: "jupiter", b: "northNode", aspect: "conjunction", angle: 0, orb: 8, exact: 5.5, applying: true, major: true };
    const text = describeAspect(aspect, "natal", undefined, "fr");
    expect(text).toContain("se superpose au Nœud Nord");
    expect(text).not.toContain("à le ");
  });

  it("contracts 'à' + 'le' into 'au' for a quincunx with a masculine object (Sun quincunx Saturn)", () => {
    const aspect: Aspect = { a: "sun", b: "saturn", aspect: "quincunx", angle: 150, orb: 3, exact: 1.2, applying: true, major: false };
    const text = describeAspect(aspect, "natal", undefined, "fr");
    expect(text).toContain("au Saturne");
    expect(text).not.toContain("à le ");
  });

  it("leaves 'à' + 'la'/'l'' unchanged for feminine or vowel-led objects", () => {
    const conjunctionWithMoon: Aspect = { a: "sun", b: "moon", aspect: "conjunction", angle: 0, orb: 8, exact: 2, applying: true, major: true };
    const text = describeAspect(conjunctionWithMoon, "natal", undefined, "fr");
    expect(text).toContain("se superpose à la Lune");

    const conjunctionWithAsc: Aspect = { a: "sun", b: "asc", aspect: "conjunction", angle: 0, orb: 8, exact: 2, applying: true, major: true };
    const textAsc = describeAspect(conjunctionWithAsc, "natal", undefined, "fr");
    expect(textAsc).toContain("se superpose à l'Ascendant");
  });
});
