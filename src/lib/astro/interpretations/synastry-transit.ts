import type { CompositeChart, NatalChart } from "../types";
import { computeTransitAspects } from "../transits";
import { computeActivatedSynastryAspects } from "../synastry-transits";
import { describeCompositeTransitAspect, describeActivatedSynastryAspect } from "./compose";

export interface RelationshipEmailSection {
  heading: string;
  paragraph: string;
}

// Transits du jour sur le thème composite du couple (points médians des deux
// thèmes, traité comme un thème à part entière) — réservé aux paires ayant
// déverrouillé la fonctionnalité "composite".
export function composeCompositeTransitSection(
  composite: CompositeChart,
  labelA: string,
  labelB: string,
  date: Date = new Date()
): RelationshipEmailSection {
  const transitAspects = computeTransitAspects(composite, date);
  const featured = transitAspects.find((a) => a.major) ?? transitAspects[0];

  const paragraph = featured
    ? describeCompositeTransitAspect(featured)
    : "Aucun transit marquant sur le thème composite aujourd'hui : une période plus neutre pour la relation.";

  return { heading: `Votre thème composite : ${labelA} & ${labelB}`, paragraph };
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
  date: Date = new Date()
): RelationshipEmailSection {
  const activated = computeActivatedSynastryAspects(chartA, chartB, date);
  const featured = activated.find((a) => a.synastryAspect.major) ?? activated[0];

  const paragraph = featured
    ? describeActivatedSynastryAspect(featured, labelA, labelB)
    : "Aucun aspect de synastrie particulièrement réactivé aujourd'hui : une période plus neutre pour cette dynamique de couple.";

  return { heading: `Votre synastrie : ${labelA} & ${labelB}`, paragraph };
}
