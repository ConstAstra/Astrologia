import type { NatalChart } from "../types";
import { computeTransitAspects, computeTransitingPositions } from "../transits";
import { computeMoonPhase } from "../moonphase";
import { computeBigThree, computeDominance } from "../dominance";
import { describeTransitAspect } from "./compose";
import { MOON_PHASE_TEXT } from "./moonphase-content";
import { SIGN_META } from "./signs";
import { PLANET_META } from "./planets";

export interface DailyHoroscope {
  subject: string;
  headline: string;
  /** Événements astro notables du jour (retour planétaire, Nouvelle/Pleine Lune exacte, Mercure rétrograde) — à mettre en avant, distinct du reste. */
  highlights: string[];
  paragraphs: string[];
}

const RETURN_CYCLE_YEARS: Partial<Record<string, string>> = {
  saturn: "environ tous les 29 ans — un jalon classique de bilan et de restructuration",
  jupiter: "environ tous les 12 ans — une période d'expansion et de nouvelles opportunités",
};

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
  const transiting = computeTransitingPositions(date);
  const transitAspects = computeTransitAspects(chart, date);
  const featured = transitAspects.find((a) => a.major) ?? transitAspects[0];
  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const dominance = computeDominance(chart.points);
  const dominantElement = dominance.dominantElements[0];

  const highlights: string[] = [];

  // Retour planétaire : la planète en transit revient conjoindre exactement
  // sa propre position natale — un jalon personnel classique (retour de
  // Saturne, de Jupiter...), assez rare pour mériter d'être mis en avant.
  const planetaryReturn = transitAspects.find(
    (a) => a.aspect === "conjunction" && a.transitingPlanet === a.natalPoint && Math.abs(a.exact) < 1
  );
  if (planetaryReturn) {
    const name = PLANET_META[planetaryReturn.transitingPlanet].name;
    const cycle = RETURN_CYCLE_YEARS[planetaryReturn.transitingPlanet];
    highlights.push(`🔄 Retour de ${name} : ${name} en transit revient exactement sur sa position natale${cycle ? ` (${cycle})` : ""}.`);
  }

  if (moon.illuminatedFraction >= 0.98) {
    highlights.push("🌕 Pleine Lune quasi exacte aujourd'hui : un point culminant particulièrement marqué.");
  } else if (moon.illuminatedFraction <= 0.02) {
    highlights.push("🌑 Nouvelle Lune quasi exacte aujourd'hui : un nouveau départ particulièrement propice.");
  }

  if (transiting.mercury.retrograde) {
    highlights.push(
      "☿ Mercure rétrograde en ce moment : communications, contrats et déplacements demandent plus de vérifications que d'habitude."
    );
  }

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

  const subjectPrefix = highlights.length > 0 ? `${highlights[0].split(" ")[0]} ` : "";

  return {
    subject: `${subjectPrefix}Votre ciel du ${dateLabel} — ${profileLabel}`,
    headline: `${signatureLine} · ${moon.name} (${Math.round(moon.illuminatedFraction * 100)}% illuminée)`,
    highlights,
    paragraphs,
  };
}
