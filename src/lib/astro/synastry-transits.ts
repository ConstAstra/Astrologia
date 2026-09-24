import { computeSynastry } from "./synastry";
import { computeTransitAspects } from "./transits";
import type { NatalChart } from "./types";
import type { SynastryAspect } from "./synastry";
import type { TransitAspect } from "./transits";

export interface ActivatedSynastryAspect {
  synastryAspect: SynastryAspect;
  transit: TransitAspect;
  /** Le côté (A ou B) dont le point natal est touché par le transit du jour. */
  side: "A" | "B";
}

// À distinguer des transits sur le thème composite (technique différente,
// voir composite.ts) : ici on part d'un aspect de synastrie réel entre les
// deux thèmes (ex. Vénus de A trigone Mars de B) et on regarde si une
// planète en transit aujourd'hui « réactive » l'un des deux points
// impliqués — une façon classique de repérer quand une dynamique de couple
// déjà présente redevient d'actualité.
export function computeActivatedSynastryAspects(
  chartA: NatalChart,
  chartB: NatalChart,
  date: Date = new Date()
): ActivatedSynastryAspect[] {
  const synastry = computeSynastry(chartA, chartB);
  const transitsA = computeTransitAspects(chartA, date);
  const transitsB = computeTransitAspects(chartB, date);

  const results: ActivatedSynastryAspect[] = [];
  for (const synastryAspect of synastry.aspects) {
    const hitA = transitsA.find((t) => t.natalPoint === synastryAspect.personA);
    if (hitA) results.push({ synastryAspect, transit: hitA, side: "A" });
    const hitB = transitsB.find((t) => t.natalPoint === synastryAspect.personB);
    if (hitB) results.push({ synastryAspect, transit: hitB, side: "B" });
  }

  return results.sort((x, y) => Math.abs(x.transit.exact) - Math.abs(y.transit.exact));
}
