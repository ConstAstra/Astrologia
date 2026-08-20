// Types partagés du moteur astrologique.

export const PLANET_KEYS = [
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
  "northNode",
] as const;

export type PlanetKey = (typeof PLANET_KEYS)[number];

export const ANGLE_KEYS = ["asc", "mc", "desc", "ic", "fortune"] as const;
export type AngleKey = (typeof ANGLE_KEYS)[number];

// Astéroïdes : traités à part de PLANET_KEYS plutôt qu'ajoutés dedans, pour
// ne pas les injecter silencieusement dans tout ce qui itère sur les 11
// "planètes" (transits quotidiens, synastrie, composite, cartographie,
// synthèse IA...) — chaque usage de juno est ajouté explicitement là où il a
// un sens interprétatif réel, en commençant par le thème natal.
export const ASTEROID_KEYS = ["juno"] as const;
export type AsteroidKey = (typeof ASTEROID_KEYS)[number];

// Vertex : point calculé (comme l'Ascendant/le Milieu du Ciel), pas un corps
// céleste. Traité à part de ANGLE_KEYS pour la même raison que les
// astéroïdes : éviter qu'il s'invite silencieusement partout où ANGLE_KEYS
// est déjà utilisé (composite, synastrie) avant d'avoir un vrai usage
// interprétatif dédié.
export const VERTEX_KEYS = ["vertex"] as const;
export type VertexKey = (typeof VERTEX_KEYS)[number];

export type PointKey = PlanetKey | AngleKey | AsteroidKey | VertexKey;

export const ZODIAC_SIGNS = [
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
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export type HouseSystem = "whole-sign" | "equal" | "porphyry" | "placidus";

/** Une position écliptique tropicale, en degrés [0, 360). */
export interface EclipticPoint {
  key: PointKey;
  longitude: number; // 0-360, 0 = 0° Bélier
  latitude?: number; // latitude écliptique (0 pour les angles)
  speed?: number; // degrés/jour ; négatif = rétrograde
  retrograde?: boolean;
  house?: number; // 1-12, calculé une fois les maisons connues
}

export interface BirthInput {
  /** Date de naissance ISO "YYYY-MM-DD" */
  date: string;
  /** Heure locale "HH:mm", absente si heure inconnue */
  time: string | null;
  /** Fuseau horaire IANA, ex "Europe/Paris" */
  tzName: string;
  latitude: number;
  longitude: number;
  timeUnknown?: boolean;
}

export interface HouseCusps {
  system: HouseSystem;
  /** cusps[0] = maison 1 (ASC) ... cusps[11] = maison 12 */
  cusps: number[];
  ascendant: number;
  midheaven: number;
  fellBackToWholeSign?: boolean;
}

export interface NatalChart {
  input: BirthInput;
  utcIso: string;
  julianDay: number;
  obliquity: number;
  ramc: number;
  points: Record<PointKey, EclipticPoint>;
  houses: HouseCusps;
  hasReliableHouses: boolean;
}

export interface CompositeChart {
  points: Record<PointKey, EclipticPoint>;
  houses: HouseCusps;
  hasReliableHouses: boolean;
}

export const MAJOR_ASPECTS = [
  { key: "conjunction", angle: 0, orb: 8 },
  { key: "opposition", angle: 180, orb: 8 },
  { key: "trine", angle: 120, orb: 7 },
  { key: "square", angle: 90, orb: 7 },
  { key: "sextile", angle: 60, orb: 5 },
] as const;

export const MINOR_ASPECTS = [
  { key: "quincunx", angle: 150, orb: 3 },
  { key: "semi-sextile", angle: 30, orb: 2 },
  { key: "semi-square", angle: 45, orb: 2 },
  { key: "sesquiquadrate", angle: 135, orb: 2 },
] as const;

export type AspectKey =
  | (typeof MAJOR_ASPECTS)[number]["key"]
  | (typeof MINOR_ASPECTS)[number]["key"];

export interface Aspect {
  a: PointKey;
  b: PointKey;
  aspect: AspectKey;
  angle: number;
  orb: number;
  exact: number; // écart à l'exactitude, en degrés (0 = exact)
  applying: boolean;
  major: boolean;
}
