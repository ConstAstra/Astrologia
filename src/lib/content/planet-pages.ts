import type { PointKey } from "@/lib/astro/types";

/**
 * Les points pour lesquels planet-in-sign.ts / .en.ts fournissent un texte
 * dédié par signe (voir PLANET_IN_SIGN) — sert de source unique pour générer
 * les pages publiques /planetes/[slug] et /en/planets/[slug]
 * (generateStaticParams, sitemap, page d'index). Junon et Chiron y figurent
 * depuis qu'ils ont chacun leurs 12 textes de signe dédiés ; Vertex et la
 * Part du Mariage restent hors de cette liste tant qu'ils n'ont que le
 * texte générique de repli (voir compose.ts), pour ne pas publier de pages
 * SEO moins riches que le reste du site.
 */
export const PLANET_PAGE_KEYS: PointKey[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "asc",
  "juno",
  "chiron",
];

// Mot-clé d'URL par point — FR privilégie un mot français lisible dans la
// recherche ("vénus en balance"), EN garde le nom anglais tout en gardant la
// clé de signe interne telle quelle (ex. /en/planets/venus-in-belier), pour
// rester cohérent avec le reste du site (voir /en/horoscope/[sign]).
export const PLANET_SLUG_FR: Record<PointKey, string> = {
  sun: "soleil",
  moon: "lune",
  mercury: "mercure",
  venus: "venus",
  mars: "mars",
  jupiter: "jupiter",
  saturn: "saturne",
  uranus: "uranus",
  neptune: "neptune",
  pluto: "pluton",
  asc: "ascendant",
  northNode: "noeud-nord",
  mc: "milieu-du-ciel",
  desc: "descendant",
  ic: "fond-du-ciel",
  fortune: "part-de-fortune",
  juno: "junon",
  vertex: "vertex",
  partMarriage: "part-du-mariage",
  chiron: "chiron",
};

export const PLANET_SLUG_EN: Record<PointKey, string> = {
  sun: "sun",
  moon: "moon",
  mercury: "mercury",
  venus: "venus",
  mars: "mars",
  jupiter: "jupiter",
  saturn: "saturn",
  uranus: "uranus",
  neptune: "neptune",
  pluto: "pluto",
  asc: "ascendant",
  northNode: "north-node",
  mc: "midheaven",
  desc: "descendant",
  ic: "ic",
  fortune: "part-of-fortune",
  juno: "juno",
  vertex: "vertex",
  partMarriage: "part-of-marriage",
  chiron: "chiron",
};

export function planetSlugToKey(slug: string, map: Record<PointKey, string>): PointKey | null {
  const entry = (Object.entries(map) as [PointKey, string][]).find(([, s]) => s === slug);
  return entry ? entry[0] : null;
}
