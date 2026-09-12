import { describe, it, expect } from "vitest";
import {
  describeAspect,
  describeTransitAspect,
  describeCompositeTransitAspect,
  describeActivatedSynastryAspect,
} from "@/lib/astro/interpretations/compose";
import type { Aspect } from "@/lib/astro/types";
import type { TransitAspect } from "@/lib/astro/transits";
import type { ActivatedSynastryAspect } from "@/lib/astro/synastry-transits";

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

describe("transit manifestations — personal vs synastry vs composite framing", () => {
  const sunHarmonious: TransitAspect = {
    transitingPlanet: "sun",
    natalPoint: "moon",
    aspect: "trine",
    angle: 120,
    orb: 6,
    exact: 1,
    applying: true,
    major: true,
  };

  it("uses personal 'votre présence' framing for a plain natal transit", () => {
    const text = describeTransitAspect(sunHarmonious, "fr");
    expect(text).toContain("votre présence passe bien");
  });

  it("uses relationship-entity framing ('la relation') for a composite transit, never the personal text", () => {
    const text = describeCompositeTransitAspect(sunHarmonious, "fr");
    expect(text).toContain("la relation elle-même se fait remarquer");
    expect(text).not.toContain("votre présence passe bien");
  });

  it("uses two-person dynamic framing ('l'un de vous deux') for an activated synastry transit, never the personal or composite text", () => {
    const activated: ActivatedSynastryAspect = {
      synastryAspect: { personA: "venus", personB: "mars", aspect: "trine", angle: 120, orb: 6, exact: 1, applying: true, major: true },
      transit: sunHarmonious,
      side: "A",
    };
    const text = describeActivatedSynastryAspect(activated, "Alice", "Bob", "fr");
    expect(text).toContain("l'un de vous deux se sent vu et valorisé");
    expect(text).not.toContain("votre présence passe bien");
    expect(text).not.toContain("la relation elle-même se fait remarquer");
  });
});
