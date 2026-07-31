import type { NatalChart } from "../types";
import { computeTransitAspects } from "../transits";
import { computeMoonPhase } from "../moonphase";
import { computeBigThree, computeDominance } from "../dominance";
import { describeTransitAspect } from "./compose";
import { MOON_PHASE_TEXT } from "./moonphase-content";
import { SIGN_META } from "./signs";

export interface DailyHoroscope {
  subject: string;
  headline: string;
  paragraphs: string[];
}

// Comment chaque élément dominant tend à « colorer » la manière dont un
// transit se manifeste concrètement — ce qui relie l'événement du jour au
// thème natal réel de la personne plutôt que de rester un horoscope
// générique valable pour tout le monde.
const MANIFESTATION_STYLE: Record<string, string> = {
  Feu: "de façon spontanée et vive, probablement par une envie d'agir ou de trancher rapidement",
  Terre: "de façon concrète et progressive, à travers des faits tangibles plutôt que des ressentis abstraits",
  Air: "à travers des échanges, des idées ou des informations qui circulent",
  Eau: "sur le plan émotionnel, en touchant d'abord votre ressenti avant de se traduire en actes",
};

// Horoscope quotidien = phase lunaire du jour + l'aspect en transit le plus
// signifiant (majeur et le plus serré, sinon le plus serré tout court) pour
// ce thème natal précis, relié à la signature de fond du thème (Big 3 +
// dominante élémentaire). Volontairement court : c'est un rappel
// quotidien, pas une nouvelle lecture complète du thème.
export function composeDailyHoroscope(chart: NatalChart, profileLabel: string, date: Date = new Date()): DailyHoroscope {
  const moon = computeMoonPhase(date);
  const transitAspects = computeTransitAspects(chart, date);
  const featured = transitAspects.find((a) => a.major) ?? transitAspects[0];
  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const dominance = computeDominance(chart.points);
  const dominantElement = dominance.dominantElements[0];

  const dateLabel = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const signatureLine = `Soleil ${SIGN_META[big3.sun].name} ${SIGN_META[big3.sun].symbol} · Lune ${SIGN_META[big3.moon].name} ${SIGN_META[big3.moon].symbol}${
    big3.ascendant ? ` · Ascendant ${SIGN_META[big3.ascendant].name} ${SIGN_META[big3.ascendant].symbol}` : ""
  }`;

  const paragraphs = [`☾ ${moon.name} — ${MOON_PHASE_TEXT[moon.name]}`];

  if (featured) {
    paragraphs.push(describeTransitAspect(featured));
    if (dominantElement) {
      paragraphs.push(
        `Avec une dominante ${dominantElement} dans votre thème, cette influence se manifestera plus probablement ${MANIFESTATION_STYLE[dominantElement]}.`
      );
    }
  } else {
    paragraphs.push("Aucun transit marquant sur votre thème aujourd'hui : une journée plus neutre, propice à la routine.");
  }

  return {
    subject: `Votre ciel du ${dateLabel} — ${profileLabel}`,
    headline: `${signatureLine} · ${moon.name} (${Math.round(moon.illuminatedFraction * 100)}% illuminée)`,
    paragraphs,
  };
}
