import { describe, it, expect } from "vitest";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { computeAvatarTraits, companionForMoon, COMPANION_SHAPES, COMPANION_COLOR } from "@/components/avatar/avatarTraits";

describe("companionForMoon", () => {
  it("returns null when no moon sign is known", () => {
    expect(companionForMoon(undefined)).toBeNull();
  });

  it("returns a companion for every sign, matching that sign's element and color", () => {
    for (const sign of ZODIAC_SIGNS) {
      const element = SIGN_META[sign].element;
      const companion = companionForMoon(sign);
      expect(companion).not.toBeNull();
      expect(companion!.element).toBe(element);
      expect(companion!.color).toBe(COMPANION_COLOR[element as keyof typeof COMPANION_COLOR]);
    }
  });

  it("two signs sharing an element get the same companion", () => {
    // Bélier et Lion sont tous deux Feu.
    expect(companionForMoon("belier")).toEqual(companionForMoon("lion"));
  });
});

describe("COMPANION_SHAPES", () => {
  it("has a non-empty shape list for every element", () => {
    for (const element of Object.keys(COMPANION_COLOR) as (keyof typeof COMPANION_COLOR)[]) {
      expect(COMPANION_SHAPES[element].length).toBeGreaterThan(0);
    }
  });
});

describe("computeAvatarTraits companion wiring", () => {
  it("has no companion when the moon sign is unknown", () => {
    const traits = computeAvatarTraits("seed-1", "belier");
    expect(traits.companion).toBeNull();
  });

  it("carries a companion matching the moon sign's element when known", () => {
    const traits = computeAvatarTraits("seed-1", "belier", "cancer");
    expect(traits.companion).not.toBeNull();
    expect(traits.companion!.element).toBe(SIGN_META.cancer.element);
  });

  it("never derives companion from the sun sign alone", () => {
    const traits = computeAvatarTraits("seed-1", "cancer");
    expect(traits.companion).toBeNull();
  });
});
