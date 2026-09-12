import { PLANET_KEYS } from "../types";
import type { NatalChart, PointKey, ZodiacSign } from "../types";
import { signOf } from "../signs";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { PLANET_META, PLANET_GENDER_FR } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { composeSignCompatibility } from "./sign-compatibility";
import { composeSignCompatibilityEn } from "./sign-compatibility.en";
import type { Locale } from "./compose";

/** Les mêmes points que la synastrie standard (SYNASTRY_POINT_KEYS) : planètes + Ascendant + Milieu du Ciel. */
export const COMPARABILITY_POINTS: PointKey[] = [...PLANET_KEYS, "asc", "mc"];

export interface PlanetSignComparability {
  point: PointKey;
  signA: ZodiacSign;
  signB: ZodiacSign;
  score: number;
  text: string;
}

/**
 * Compare, planète par planète, le signe de chacune des deux personnes,
 * pas un aspect entre deux points différents (déjà couvert par les aspects
 * croisés), mais la même énergie (le même point) vécue à travers deux
 * signes potentiellement très différents. Réutilise le moteur
 * élément/modalité déjà écrit pour la compatibilité de signes solaires
 * (sign-compatibility.ts), objectif et déjà validé, plutôt que d'écrire
 * 144 textes à la main pour chacun des 13 points comparés.
 */
export function composePlanetSignComparability(
  point: PointKey,
  signA: ZodiacSign,
  signB: ZodiacSign,
  labelA: string,
  labelB: string,
  locale: Locale = "fr"
): PlanetSignComparability {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planet = planetMap[point];
  const compat = locale === "en" ? composeSignCompatibilityEn(signA, signB) : composeSignCompatibility(signA, signB);
  const sameSign = signA === signB;

  if (locale === "en") {
    const opening = sameSign
      ? `${labelA} and ${labelB} share the same sign for ${planet.name}: ${signMap[signA].name} (${signMap[signA].keyword}), a common starting point for ${planet.keyword}, even if it never plays out quite the same way on both sides.`
      : `${labelA}'s ${planet.name} is in ${signMap[signA].name} (${signMap[signA].keyword}), ${labelB}'s in ${signMap[signB].name} (${signMap[signB].keyword}): two different starting points for ${planet.keyword}.`;
    const closing =
      compat.score >= 4
        ? "On this specific ground, little structural friction: it tends to flow naturally."
        : `On this specific ground, ${planet.keyword}, the friction is real and worth naming rather than assuming it'll sort itself out.`;
    return {
      point,
      signA,
      signB,
      score: compat.score,
      text: `${opening} ${compat.elementText} ${compat.modalityText} ${closing}`,
    };
  }

  const pronoun = PLANET_GENDER_FR[point] === "f" ? "celle" : "celui";
  const opening = sameSign
    ? `${labelA} et ${labelB} partagent le même signe pour ${planet.name} : ${signMap[signA].name} (${signMap[signA].keyword}), un point de départ commun pour ${planet.keyword}, même si ça ne se vit jamais tout à fait pareil des deux côtés.`
    : `${planet.name} de ${labelA} est en ${signMap[signA].name} (${signMap[signA].keyword}), ${pronoun} de ${labelB} en ${signMap[signB].name} (${signMap[signB].keyword}) : deux points de départ différents pour ${planet.keyword}.`;
  const closing =
    compat.score >= 4
      ? "Sur ce terrain précis, peu de friction structurelle : ça circule plutôt naturellement."
      : `Sur ce terrain précis, ${planet.keyword}, la friction est réelle et mérite d'être nommée plutôt que supposée se résoudre toute seule.`;

  return {
    point,
    signA,
    signB,
    score: compat.score,
    text: `${opening} ${compat.elementText} ${compat.modalityText} ${closing}`,
  };
}

/**
 * Calcule la comparabilité de signe pour tous les points comparables entre
 * deux thèmes réels (COMPARABILITY_POINTS). L'Ascendant et le Milieu du
 * Ciel sont écartés si l'une des deux personnes n'a pas d'heure de
 * naissance fiable (hasReliableHouses), puisqu'ils dépendent directement de
 * l'heure exacte. Trié par score croissant : les terrains les plus
 * friables d'abord, ceux qui filent tout seuls en dernier, pour mettre en
 * avant ce qui mérite vraiment d'être lu.
 */
export function composeAllPlanetSignComparabilities(
  chartA: NatalChart,
  chartB: NatalChart,
  labelA: string,
  labelB: string,
  locale: Locale = "fr"
): PlanetSignComparability[] {
  const housesReliable = chartA.hasReliableHouses && chartB.hasReliableHouses;
  const points = COMPARABILITY_POINTS.filter((p) => housesReliable || (p !== "asc" && p !== "mc"));

  const results: PlanetSignComparability[] = [];
  for (const point of points) {
    const pointA = chartA.points[point];
    const pointB = chartB.points[point];
    if (!pointA || !pointB) continue;
    const signA = signOf(pointA.longitude);
    const signB = signOf(pointB.longitude);
    results.push(composePlanetSignComparability(point, signA, signB, labelA, labelB, locale));
  }

  return results.sort((a, b) => a.score - b.score);
}
