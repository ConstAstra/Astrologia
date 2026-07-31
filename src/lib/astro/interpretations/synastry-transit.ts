import type { CompositeChart } from "../types";
import { computeTransitAspects } from "../transits";
import { describeCompositeTransitAspect } from "./compose";

export interface SynastryTransitSection {
  heading: string;
  paragraph: string;
}

// Transits du jour sur le thème composite du couple : la façon classique de
// lire « ce que traverse la relation elle-même » aujourd'hui, distincte des
// transits sur chaque thème natal pris isolément.
export function composeSynastryTransitSection(
  composite: CompositeChart,
  labelA: string,
  labelB: string,
  date: Date = new Date()
): SynastryTransitSection {
  const transitAspects = computeTransitAspects(composite, date);
  const featured = transitAspects.find((a) => a.major) ?? transitAspects[0];

  const paragraph = featured
    ? describeCompositeTransitAspect(featured)
    : "Aucun transit marquant sur le thème composite aujourd'hui : une période plus neutre pour la relation.";

  return {
    heading: `Votre relation : ${labelA} & ${labelB}`,
    paragraph,
  };
}
