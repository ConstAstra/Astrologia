import type { NatalChart } from "../types";
import { computeTransitAspects, computeTransitingPositions } from "../transits";
import { computeMoonPhase } from "../moonphase";
import { computeBigThree, computeDominance } from "../dominance";
import { describeTransitAspect, type Locale } from "./compose";
import { MOON_PHASE_TEXT } from "./moonphase-content";
import { MOON_PHASE_TEXT_EN, MOON_PHASE_LABEL_EN } from "./moonphase-content.en";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";

export interface DailyHoroscope {
  subject: string;
  headline: string;
  /** Événements astro notables du jour (retour planétaire, Nouvelle/Pleine Lune exacte, Mercure rétrograde) — à mettre en avant, distinct du reste. */
  highlights: string[];
  paragraphs: string[];
}

const ELEMENT_LABEL_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

const RETURN_CYCLE_YEARS: Partial<Record<string, string>> = {
  saturn: "environ tous les 29 ans — un jalon classique de bilan et de restructuration",
  jupiter: "environ tous les 12 ans — une période d'expansion et de nouvelles opportunités",
};

const RETURN_CYCLE_YEARS_EN: Partial<Record<string, string>> = {
  saturn: "about every 29 years — a classic milestone for stock-taking and restructuring",
  jupiter: "about every 12 years — a period of expansion and new opportunities",
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

const MANIFESTATION_STYLE_EN: Record<string, string> = {
  Feu: "spontaneously and vividly, probably through an urge to act or decide quickly",
  Terre: "concretely and gradually, through tangible facts rather than abstract feelings",
  Air: "through exchanges, ideas or information circulating",
  Eau: "emotionally, touching your feelings first before translating into action",
};

// Horoscope quotidien = phase lunaire du jour + l'aspect en transit le plus
// signifiant (majeur et le plus serré, sinon le plus serré tout court) pour
// ce thème natal précis, relié à la signature de fond du thème (Big 3 +
// dominante élémentaire). Volontairement court : c'est un rappel
// quotidien, pas une nouvelle lecture complète du thème.
export function composeDailyHoroscope(
  chart: NatalChart,
  profileLabel: string,
  date: Date = new Date(),
  locale: Locale = "fr"
): DailyHoroscope {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const moonTextMap = locale === "en" ? MOON_PHASE_TEXT_EN : MOON_PHASE_TEXT;
  const returnCycleMap = locale === "en" ? RETURN_CYCLE_YEARS_EN : RETURN_CYCLE_YEARS;
  const manifestationMap = locale === "en" ? MANIFESTATION_STYLE_EN : MANIFESTATION_STYLE;

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
    const name = planetMap[planetaryReturn.transitingPlanet].name;
    const cycle = returnCycleMap[planetaryReturn.transitingPlanet];
    highlights.push(
      locale === "en"
        ? `🔄 ${name} Return: transiting ${name} comes back exactly onto its natal position${cycle ? ` (${cycle})` : ""}.`
        : `🔄 Retour de ${name} : ${name} en transit revient exactement sur sa position natale${cycle ? ` (${cycle})` : ""}.`
    );
  }

  if (moon.illuminatedFraction >= 0.98) {
    highlights.push(
      locale === "en"
        ? "🌕 Near-exact Full Moon today: a particularly strong culminating point."
        : "🌕 Pleine Lune quasi exacte aujourd'hui : un point culminant particulièrement marqué."
    );
  } else if (moon.illuminatedFraction <= 0.02) {
    highlights.push(
      locale === "en"
        ? "🌑 Near-exact New Moon today: a particularly favorable fresh start."
        : "🌑 Nouvelle Lune quasi exacte aujourd'hui : un nouveau départ particulièrement propice."
    );
  }

  if (transiting.mercury.retrograde) {
    highlights.push(
      locale === "en"
        ? "☿ Mercury retrograde right now: communications, contracts and travel need more double-checking than usual."
        : "☿ Mercure rétrograde en ce moment : communications, contrats et déplacements demandent plus de vérifications que d'habitude."
    );
  }

  const dateLabel = date.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const signatureLine =
    locale === "en"
      ? `Sun ${signMap[big3.sun].name} ${signMap[big3.sun].symbol} · Moon ${signMap[big3.moon].name} ${signMap[big3.moon].symbol}${
          big3.ascendant ? ` · Ascendant ${signMap[big3.ascendant].name} ${signMap[big3.ascendant].symbol}` : ""
        }`
      : `Soleil ${signMap[big3.sun].name} ${signMap[big3.sun].symbol} · Lune ${signMap[big3.moon].name} ${signMap[big3.moon].symbol}${
          big3.ascendant ? ` · Ascendant ${signMap[big3.ascendant].name} ${signMap[big3.ascendant].symbol}` : ""
        }`;

  const moonLabel = locale === "en" ? MOON_PHASE_LABEL_EN[moon.name] : moon.name;
  const paragraphs = [`☾ ${moonLabel} — ${moonTextMap[moon.name]}`];

  if (featured) {
    paragraphs.push(describeTransitAspect(featured, locale));
    if (dominantElement) {
      const elementLabel = locale === "en" ? ELEMENT_LABEL_EN[dominantElement] : dominantElement;
      paragraphs.push(
        locale === "en"
          ? `With a dominant ${elementLabel} in your chart, this influence will more likely manifest ${manifestationMap[dominantElement]}.`
          : `Avec une dominante ${elementLabel} dans votre thème, cette influence se manifestera plus probablement ${manifestationMap[dominantElement]}.`
      );
    }
  } else {
    paragraphs.push(
      locale === "en"
        ? "No notable transit on your chart today: a more neutral day, favorable for routine."
        : "Aucun transit marquant sur votre thème aujourd'hui : une journée plus neutre, propice à la routine."
    );
  }

  const subjectPrefix = highlights.length > 0 ? `${highlights[0].split(" ")[0]} ` : "";

  return {
    subject:
      locale === "en"
        ? `${subjectPrefix}Your sky for ${dateLabel} — ${profileLabel}`
        : `${subjectPrefix}Votre ciel du ${dateLabel} — ${profileLabel}`,
    headline:
      locale === "en"
        ? `${signatureLine} · ${MOON_PHASE_LABEL_EN[moon.name]} (${Math.round(moon.illuminatedFraction * 100)}% illuminated)`
        : `${signatureLine} · ${moon.name} (${Math.round(moon.illuminatedFraction * 100)}% illuminée)`,
    highlights,
    paragraphs,
  };
}
