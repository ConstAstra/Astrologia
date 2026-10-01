import type { NatalChart, PointKey } from "../types";
import { signOf, formatLongitude } from "../signs";
import type { SynastryResult, HouseOverlay } from "../synastry";
import { buildPlanetFacts, pointDisplayName, formatOrb, type PlanetFact } from "./chart-facts";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import type { Locale } from "./compose";

export interface SynastryPersonFacts {
  label: string;
  planets: PlanetFact[];
  ascendant: { sign: string; degree: string } | null;
}

export interface SynastryCrossAspectFact {
  aLabel: string;
  bLabel: string;
  aspectName: string;
  orb: string;
  applying: boolean;
  major: boolean;
}

export interface SynastryFacts {
  personA: SynastryPersonFacts;
  personB: SynastryPersonFacts;
  crossAspects: SynastryCrossAspectFact[];
  overlaysBinA: string[];
  overlaysAinB: string[];
}

function personFacts(chart: NatalChart, label: string, locale: Locale): SynastryPersonFacts {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  let ascendant: SynastryPersonFacts["ascendant"] = null;
  if (chart.hasReliableHouses && chart.points.asc) {
    const sign = signOf(chart.points.asc.longitude);
    ascendant = { sign: signMap[sign].name, degree: formatLongitude(chart.points.asc.longitude) };
  }
  return { label, planets: buildPlanetFacts(chart, locale), ascendant };
}

function overlayLines(overlays: HouseOverlay[], ownerLabel: string, houseOwnerLabel: string, locale: Locale): string[] {
  return overlays.map((o) => {
    const name = pointDisplayName(o.point, locale);
    return locale === "en"
      ? `${ownerLabel}'s ${name} falls in ${houseOwnerLabel}'s house ${o.house}`
      : `${name} de ${ownerLabel} tombe en maison ${o.house} de ${houseOwnerLabel}`;
  });
}

/**
 * Construit les faits croisés d'une synastrie : positions propres à chaque
 * personne (mêmes faits que buildChartFacts, sans les aspects/motifs internes
 * à chacune pour garder le prompt centré sur la relation), aspects entre les
 * deux thèmes avec orbe exact, et recouvrements de maisons dans les deux
 * sens. `labelA`/`labelB` doivent être des placeholders anonymisés (ex.
 * "Personne A"/"Personne B"), jamais un nom réel : voir narrateDeepSynthesis,
 * qui ne doit jamais recevoir de donnée d'identification.
 */
export function buildSynastryFacts(
  chartA: NatalChart,
  chartB: NatalChart,
  synastry: SynastryResult,
  labelA: string,
  labelB: string,
  locale: Locale = "fr"
): SynastryFacts {
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;

  const crossAspects: SynastryCrossAspectFact[] = synastry.aspects.map((asp) => ({
    aLabel: `${labelA} · ${pointDisplayName(asp.personA as PointKey, locale)}`,
    bLabel: `${labelB} · ${pointDisplayName(asp.personB as PointKey, locale)}`,
    aspectName: aspectMap[asp.aspect].name,
    orb: formatOrb(asp.exact),
    applying: asp.applying,
    major: asp.major,
  }));

  return {
    personA: personFacts(chartA, labelA, locale),
    personB: personFacts(chartB, labelB, locale),
    crossAspects,
    overlaysBinA: overlayLines(synastry.bPlanetsInAHouses, labelB, labelA, locale),
    overlaysAinB: overlayLines(synastry.aPlanetsInBHouses, labelA, labelB, locale),
  };
}
