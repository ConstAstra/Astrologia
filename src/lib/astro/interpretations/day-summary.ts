import type { TransitAspect } from "../transits";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { TRANSIT_MANIFESTATIONS } from "./transit-manifestations";
import { TRANSIT_MANIFESTATIONS_EN } from "./transit-manifestations.en";
import type { Locale } from "./compose";

/**
 * Résumé du jour (fonctionnalité Premium) : une lecture d'ensemble en un
 * paragraphe plutôt qu'une liste d'aspects à recomposer soi-même — le
 * "tu me résumes ça en une phrase ?" que la liste détaillée plus bas sur la
 * page ne donne pas telle quelle. S'appuie sur les mêmes données déjà
 * calculées pour la page (aspects majeurs du jour, phase lunaire) plutôt
 * que d'introduire un nouveau calcul.
 */
export function composeTransitDaySummary(majorAspects: TransitAspect[], moonWaxing: boolean, locale: Locale = "fr"): string {
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const manifestations = locale === "en" ? TRANSIT_MANIFESTATIONS_EN : TRANSIT_MANIFESTATIONS;

  if (majorAspects.length === 0) {
    return locale === "en"
      ? "A calm day, astrologically speaking: no major aspect is active right now. A good moment to just move forward at your own pace, without a particular current pushing one way or the other."
      : "Une journée calme, astrologiquement parlant : aucun aspect majeur n'est actif en ce moment. Un bon moment pour simplement avancer à votre rythme, sans courant particulier qui pousse dans un sens ou dans l'autre.";
  }

  const toneCounts = { harmonieux: 0, tendu: 0, neutre: 0 };
  for (const a of majorAspects) toneCounts[aspectMap[a.aspect].tone]++;

  const dominantTone: "harmonieux" | "tendu" | "neutre" =
    toneCounts.harmonieux > toneCounts.tendu && toneCounts.harmonieux >= toneCounts.neutre
      ? "harmonieux"
      : toneCounts.tendu > toneCounts.harmonieux && toneCounts.tendu >= toneCounts.neutre
        ? "tendu"
        : "neutre";

  // L'aspect le plus exact (écart à l'exact le plus faible) est celui qui se
  // fait le plus sentir aujourd'hui — le "titre" de la journée plutôt qu'un
  // aspect choisi au hasard dans la liste.
  const headline = [...majorAspects].sort((a, b) => Math.abs(a.exact) - Math.abs(b.exact))[0];
  const headlineMeta = aspectMap[headline.aspect];
  const headlinePlanetName = planetMap[headline.transitingPlanet].name;
  const headlineManifestation = manifestations[headline.transitingPlanet]?.[headlineMeta.tone];

  const openings = {
    en: {
      harmonieux: "Overall, today leans toward ease",
      tendu: "Overall, today asks for a bit more care than usual",
      neutre: "Overall, today is fairly balanced",
    },
    fr: {
      harmonieux: "Dans l'ensemble, la journée penche du côté de la fluidité",
      tendu: "Dans l'ensemble, la journée demande un peu plus de vigilance que d'habitude",
      neutre: "Dans l'ensemble, la journée reste assez équilibrée",
    },
  };

  const moonClause =
    locale === "en"
      ? moonWaxing
        ? "with a waxing Moon that favors starting things rather than finishing them"
        : "with a waning Moon that favors finishing, sorting out, and letting go rather than starting something new"
      : moonWaxing
        ? "avec une Lune croissante qui favorise plutôt les débuts que les fins"
        : "avec une Lune décroissante qui favorise plutôt les fins, le tri et le lâcher-prise que les débuts";

  const closings = {
    en: {
      harmonieux: "Worth actually using this window rather than letting it pass unnoticed.",
      tendu: "Worth naming the friction early rather than letting it build up over the day.",
      neutre: "Nothing urgent — a good day to handle what's routine.",
    },
    fr: {
      harmonieux: "Une fenêtre qui vaut la peine d'être vraiment utilisée plutôt que de la laisser passer inaperçue.",
      tendu: "Mieux vaut nommer la friction tôt que de la laisser s'accumuler au fil de la journée.",
      neutre: "Rien d'urgent — une bonne journée pour avancer sur ce qui est routinier.",
    },
  };

  if (locale === "en") {
    const headlineSentence = headlineManifestation
      ? ` The most active signature today is transiting ${headlinePlanetName}: concretely, that can look like ${headlineManifestation}`
      : "";
    return `${openings.en[dominantTone]}, ${moonClause}.${headlineSentence} ${closings.en[dominantTone]}`;
  }

  const headlineSentence = headlineManifestation
    ? ` La signature la plus active aujourd'hui vient de ${headlinePlanetName} en transit : concrètement, ça peut donner ${headlineManifestation}`
    : "";
  return `${openings.fr[dominantTone]}, ${moonClause}.${headlineSentence} ${closings.fr[dominantTone]}`;
}
