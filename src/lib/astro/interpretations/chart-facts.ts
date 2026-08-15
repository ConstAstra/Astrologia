import { PLANET_KEYS } from "../types";
import type { NatalChart, PointKey, ZodiacSign, EclipticPoint } from "../types";
import { computeAspects } from "../aspects";
import { signOf, formatLongitude } from "../signs";
import { computeDominance } from "../dominance";
import { dignitiesOf, dignityLabel, type DignityStatus } from "./dignities";
import { detectAspectPatterns, type AspectPattern } from "./aspect-patterns";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import type { Locale } from "./compose";

/**
 * Angles et Ascendant/MC inclus dans la détection de motifs, mais pas
 * Descendant/Fond du Ciel/Part de Fortune : DESC et IC sont par construction
 * l'exact opposé d'ASC et MC, ce qui produirait des motifs artificiels
 * (une "opposition" ASC-DESC n'apprend rien sur le thème).
 */
const PATTERN_POINT_KEYS: PointKey[] = [...PLANET_KEYS, "asc", "mc"];

export interface PlanetFact {
  key: PointKey;
  name: string;
  sign: ZodiacSign;
  signName: string;
  degree: string;
  house: number | null;
  retrograde: boolean;
  dignities: DignityStatus[];
  dignityLabel: string | null;
}

export interface AspectFact {
  aKey: PointKey;
  bKey: PointKey;
  aName: string;
  bName: string;
  aspect: string;
  aspectName: string;
  /** Écart au degré exact de l'aspect, formaté "0°48" — plus c'est petit, plus l'aspect est serré. */
  orb: string;
  applying: boolean;
  major: boolean;
}

export interface PatternFact {
  type: AspectPattern["type"];
  points: string[];
  apex?: string;
  sign?: string;
}

export interface ChartFacts {
  planets: PlanetFact[];
  ascendant: { sign: string; degree: string } | null;
  midheaven: { sign: string; degree: string; house: number | null } | null;
  hasReliableHouses: boolean;
  aspects: AspectFact[];
  patterns: PatternFact[];
  dominantElements: string[];
  dominantModalities: string[];
  ascendantRulerName: string | null;
  ascendantRulerPlacement: { sign: string; house: number | null } | null;
}

const ELEMENT_LABEL_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };
const MODALITY_LABEL_EN: Record<string, string> = { Cardinal: "Cardinal", Fixe: "Fixed", Mutable: "Mutable" };

function formatOrb(exact: number): string {
  const abs = Math.abs(exact);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  if (min === 60) return `${deg + 1}°00`;
  return `${deg}°${String(min).padStart(2, "0")}`;
}

/**
 * Construit l'ensemble complet des faits astrologiques exacts d'un thème
 * (signes, maisons, degrés, dignités, aspects avec orbe précis, motifs
 * d'aspects, dominantes) : l'unique matière factuelle transmise au LLM pour
 * rédiger la synthèse profonde, jamais de texte tout fait. Rien ici n'est de
 * l'interprétation, seulement des faits calculés et vérifiables.
 */
export function buildChartFacts(chart: NatalChart, locale: Locale = "fr"): ChartFacts {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;

  function nameOf(key: PointKey): string {
    if (key === "asc") return locale === "en" ? "Ascendant" : "Ascendant";
    if (key === "mc") return locale === "en" ? "Midheaven" : "Milieu du Ciel";
    if (key === "desc" || key === "ic" || key === "fortune") return key;
    return planetMap[key].name;
  }

  const planets: PlanetFact[] = [];
  for (const key of PLANET_KEYS) {
    const point = chart.points[key];
    if (!point) continue;
    const sign = signOf(point.longitude);
    const dignities = dignitiesOf(key, sign);
    planets.push({
      key,
      name: planetMap[key].name,
      sign,
      signName: signMap[sign].name,
      degree: formatLongitude(point.longitude),
      house: chart.hasReliableHouses ? (point.house ?? null) : null,
      retrograde: Boolean(point.retrograde),
      dignities,
      dignityLabel:
        dignities.length > 0 ? dignities.map((d) => dignityLabel(d, locale)).join(locale === "en" ? " and " : " et ") : null,
    });
  }

  let ascendant: ChartFacts["ascendant"] = null;
  let midheaven: ChartFacts["midheaven"] = null;
  if (chart.hasReliableHouses) {
    const ascPoint = chart.points.asc;
    const mcPoint = chart.points.mc;
    if (ascPoint) {
      const sign = signOf(ascPoint.longitude);
      ascendant = { sign: signMap[sign].name, degree: formatLongitude(ascPoint.longitude) };
    }
    if (mcPoint) {
      const sign = signOf(mcPoint.longitude);
      midheaven = { sign: signMap[sign].name, degree: formatLongitude(mcPoint.longitude), house: mcPoint.house ?? null };
    }
  }

  const patternPoints: Partial<Record<PointKey, EclipticPoint>> = {};
  for (const key of PATTERN_POINT_KEYS) {
    if ((key === "asc" || key === "mc") && !chart.hasReliableHouses) continue;
    const point = chart.points[key];
    if (point) patternPoints[key] = point;
  }
  const rawAspects = computeAspects(patternPoints, Object.keys(patternPoints) as PointKey[]);

  const aspects: AspectFact[] = rawAspects.map((asp) => ({
    aKey: asp.a,
    bKey: asp.b,
    aName: nameOf(asp.a),
    bName: nameOf(asp.b),
    aspect: asp.aspect,
    aspectName: aspectMap[asp.aspect].name,
    orb: formatOrb(asp.exact),
    applying: asp.applying,
    major: asp.major,
  }));

  const rawPatterns = detectAspectPatterns(rawAspects, patternPoints);
  const patterns: PatternFact[] = rawPatterns.map((p) => ({
    type: p.type,
    points: p.points.map(nameOf),
    apex: p.apex ? nameOf(p.apex) : undefined,
    sign: p.sign ? signMap[p.sign].name : undefined,
  }));

  const dominance = computeDominance(chart.points, chart.hasReliableHouses);
  const dominantElements = dominance.dominantElements.map((e) => (locale === "en" ? ELEMENT_LABEL_EN[e] : e));
  const dominantModalities = dominance.dominantModalities.map((m) => (locale === "en" ? MODALITY_LABEL_EN[m] : m));

  const ascendantRulerKey = dominance.ascendantRuler;
  let ascendantRulerPlacement: ChartFacts["ascendantRulerPlacement"] = null;
  if (ascendantRulerKey) {
    const rulerPoint = chart.points[ascendantRulerKey];
    if (rulerPoint) {
      const sign = signOf(rulerPoint.longitude);
      ascendantRulerPlacement = {
        sign: signMap[sign].name,
        house: chart.hasReliableHouses ? (rulerPoint.house ?? null) : null,
      };
    }
  }

  return {
    planets,
    ascendant,
    midheaven,
    hasReliableHouses: chart.hasReliableHouses,
    aspects,
    patterns,
    dominantElements,
    dominantModalities,
    ascendantRulerName: ascendantRulerKey ? planetMap[ascendantRulerKey].name : null,
    ascendantRulerPlacement,
  };
}
