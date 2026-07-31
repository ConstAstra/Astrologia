import type { CompositeChart, NatalChart } from "../types";
import { computeTransitAspects } from "../transits";
import { computeActivatedSynastryAspects } from "../synastry-transits";
import { describeCompositeTransitAspect, describeActivatedSynastryAspect, type Locale } from "./compose";

export interface RelationshipEmailSection {
  heading: string;
  paragraph: string;
}

const TEXT: Record<Locale, { compositeHeading: (a: string, b: string) => string; compositeNeutral: string; synastryHeading: (a: string, b: string) => string; synastryNeutral: string }> = {
  fr: {
    compositeHeading: (a, b) => `Votre thème composite : ${a} & ${b}`,
    compositeNeutral: "Aucun transit marquant sur le thème composite aujourd'hui : une période plus neutre pour la relation.",
    synastryHeading: (a, b) => `Votre synastrie : ${a} & ${b}`,
    synastryNeutral: "Aucun aspect de synastrie particulièrement réactivé aujourd'hui : une période plus neutre pour cette dynamique de couple.",
  },
  en: {
    compositeHeading: (a, b) => `Your composite chart: ${a} & ${b}`,
    compositeNeutral: "No notable transit on the composite chart today: a more neutral period for the relationship.",
    synastryHeading: (a, b) => `Your synastry: ${a} & ${b}`,
    synastryNeutral: "No synastry aspect particularly reactivated today: a more neutral period for this dynamic between you two.",
  },
};

// Transits du jour sur le thème composite du couple (points médians des deux
// thèmes, traité comme un thème à part entière) — réservé aux paires ayant
// déverrouillé la fonctionnalité "composite".
export function composeCompositeTransitSection(
  composite: CompositeChart,
  labelA: string,
  labelB: string,
  date: Date = new Date(),
  locale: Locale = "fr"
): RelationshipEmailSection {
  const t = TEXT[locale];
  const transitAspects = computeTransitAspects(composite, date);
  const featured = transitAspects.find((a) => a.major) ?? transitAspects[0];

  const paragraph = featured ? describeCompositeTransitAspect(featured, locale) : t.compositeNeutral;

  return { heading: t.compositeHeading(labelA, labelB), paragraph };
}

// Aspects de synastrie (comparaison directe des deux thèmes natals)
// réactivés par les transits du jour — réservé aux paires ayant
// déverrouillé la fonctionnalité "synastrie". Technique distincte du thème
// composite : on ne recalcule aucun thème, on regarde si un lien de couple
// déjà existant est « allumé » aujourd'hui.
export function composeSynastryTransitSection(
  chartA: NatalChart,
  chartB: NatalChart,
  labelA: string,
  labelB: string,
  date: Date = new Date(),
  locale: Locale = "fr"
): RelationshipEmailSection {
  const t = TEXT[locale];
  const activated = computeActivatedSynastryAspects(chartA, chartB, date);
  const featured = activated.find((a) => a.synastryAspect.major) ?? activated[0];

  const paragraph = featured ? describeActivatedSynastryAspect(featured, labelA, labelB, locale) : t.synastryNeutral;

  return { heading: t.synastryHeading(labelA, labelB), paragraph };
}
