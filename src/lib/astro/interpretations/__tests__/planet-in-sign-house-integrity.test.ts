import { describe, it, expect } from "vitest";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { PLANET_IN_SIGN } from "@/lib/astro/interpretations/planet-in-sign";
import { PLANET_IN_SIGN_EN } from "@/lib/astro/interpretations/planet-in-sign.en";
import { PLANET_IN_HOUSE } from "@/lib/astro/interpretations/planet-in-house";
import { PLANET_IN_HOUSE_EN } from "@/lib/astro/interpretations/planet-in-house.en";

// Ces textes retombent silencieusement sur un gabarit générique (compose.ts)
// dès qu'une entrée manque — un trou passe donc totalement inaperçu à l'usage
// normal. Ces tests figent l'invariant réel : une planète présente dans la
// table couvre ENTIÈREMENT ses 12 signes/maisons (pas de couverture partielle
// à l'intérieur d'une planète), et les deux locales restent en miroir exact.
// Attrape aussi la classe de bug #244 (parenthèses/guillemets corrompus lors
// d'une traduction EN).
//
// Exception documentée : l'Ascendant (clé "asc") est par définition toujours
// en maison I, quel que soit le système de maisons — sa seule entrée
// possible est donc house[1], pas les 12.

const HOUSES = Array.from({ length: 12 }, (_, i) => i + 1);
const FIXED_HOUSE_KEYS = new Set(["asc"]);

function hasBalancedDelimiters(text: string): boolean {
  let parens = 0;
  let quotes = 0;
  for (const ch of text) {
    if (ch === "(") parens++;
    else if (ch === ")") parens--;
    else if (ch === '"') quotes++;
    if (parens < 0) return false;
  }
  return parens === 0 && quotes % 2 === 0;
}

describe("PLANET_IN_SIGN integrity", () => {
  const planetKeys = Object.keys(PLANET_IN_SIGN) as (keyof typeof PLANET_IN_SIGN)[];

  it("covers every planet key it lists for all 12 signs, in both locales", () => {
    for (const key of planetKeys) {
      const fr = PLANET_IN_SIGN[key]!;
      const en = PLANET_IN_SIGN_EN[key];
      expect(en, `${String(key)} is missing from the EN sign table`).toBeDefined();
      for (const sign of ZODIAC_SIGNS) {
        expect(fr[sign], `${String(key)}.${sign} (FR) is missing or empty`).toBeTruthy();
        expect(en![sign], `${String(key)}.${sign} (EN) is missing or empty`).toBeTruthy();
      }
    }
  });

  it("has no stray unbalanced parentheses or quotes in any entry", () => {
    for (const key of planetKeys) {
      for (const sign of ZODIAC_SIGNS) {
        const fr = PLANET_IN_SIGN[key]![sign];
        const en = PLANET_IN_SIGN_EN[key]?.[sign];
        if (fr) expect(hasBalancedDelimiters(fr), `${String(key)}.${sign} (FR) has unbalanced ()/"`).toBe(true);
        if (en) expect(hasBalancedDelimiters(en), `${String(key)}.${sign} (EN) has unbalanced ()/"`).toBe(true);
      }
    }
  });

  it.each(["chiron", "juno", "vertex", "partMarriage"] as const)(
    "covers the newer point %s with full sign content in both locales",
    (key) => {
      expect(PLANET_IN_SIGN[key], `${key} missing from FR sign table`).toBeDefined();
      expect(PLANET_IN_SIGN_EN[key], `${key} missing from EN sign table`).toBeDefined();
      for (const sign of ZODIAC_SIGNS) {
        expect(PLANET_IN_SIGN[key]![sign]).toBeTruthy();
        expect(PLANET_IN_SIGN_EN[key]![sign]).toBeTruthy();
      }
    }
  );
});

describe("PLANET_IN_HOUSE integrity", () => {
  const planetKeys = Object.keys(PLANET_IN_HOUSE) as (keyof typeof PLANET_IN_HOUSE)[];

  it("covers every planet key it lists for all 12 houses, in both locales (except angles fixed to a single house)", () => {
    for (const key of planetKeys) {
      const fr = PLANET_IN_HOUSE[key]!;
      const en = PLANET_IN_HOUSE_EN[key];
      expect(en, `${String(key)} is missing from the EN house table`).toBeDefined();
      const houses = FIXED_HOUSE_KEYS.has(String(key)) ? [1] : HOUSES;
      for (const house of houses) {
        expect(fr[house], `${String(key)}.${house} (FR) is missing or empty`).toBeTruthy();
        expect(en![house], `${String(key)}.${house} (EN) is missing or empty`).toBeTruthy();
      }
    }
  });

  it("has no stray unbalanced parentheses or quotes in any entry", () => {
    for (const key of planetKeys) {
      const houses = FIXED_HOUSE_KEYS.has(String(key)) ? [1] : HOUSES;
      for (const house of houses) {
        const fr = PLANET_IN_HOUSE[key]![house];
        const en = PLANET_IN_HOUSE_EN[key]?.[house];
        if (fr) expect(hasBalancedDelimiters(fr), `${String(key)}.${house} (FR) has unbalanced ()/"`).toBe(true);
        if (en) expect(hasBalancedDelimiters(en), `${String(key)}.${house} (EN) has unbalanced ()/"`).toBe(true);
      }
    }
  });

  it.each(["chiron", "juno", "vertex", "partMarriage"] as const)(
    "covers the newer point %s with full house content in both locales",
    (key) => {
      expect(PLANET_IN_HOUSE[key], `${key} missing from FR house table`).toBeDefined();
      expect(PLANET_IN_HOUSE_EN[key], `${key} missing from EN house table`).toBeDefined();
      for (const house of HOUSES) {
        expect(PLANET_IN_HOUSE[key]![house]).toBeTruthy();
        expect(PLANET_IN_HOUSE_EN[key]![house]).toBeTruthy();
      }
    }
  );
});
