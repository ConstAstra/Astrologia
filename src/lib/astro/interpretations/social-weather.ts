import type { NatalChart, PlanetKey } from "../types";
import { houseOfLongitude } from "../houses";
import { computeTransitingPositions } from "../transits";
import type { TransitAspect } from "../transits";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import type { Locale } from "./compose";

// Planètes "personnelles/sociales" — celles dont la maison traversée en
// transit dit quelque chose d'utile sur l'ambiance sociale du jour. On
// exclut Saturne/Uranus/Neptune/Pluton/Nœud Nord : leur mouvement est trop
// lent pour changer de maison d'un jour à l'autre, ce n'est pas un signal
// journalier.
const SOCIAL_PLANETS: readonly PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter"];

type HouseFlavor = "social" | "intime" | "neutre";

// Maisons I (identité/visibilité), III (parole/entourage), V (plaisir),
// VII (relations), XI (amis/réseau) : les cinq maisons tournées vers les
// autres. IV/VIII/XII : les maisons du repli, de l'intime, du privé. Le
// reste (II, VI, IX, X) ne penche ni d'un côté ni de l'autre pour cette
// lecture précise.
const HOUSE_FLAVOR: Record<number, HouseFlavor> = {
  1: "social",
  3: "social",
  5: "social",
  7: "social",
  11: "social",
  4: "intime",
  8: "intime",
  12: "intime",
};

function flavorOf(house: number): HouseFlavor {
  return HOUSE_FLAVOR[house] ?? "neutre";
}

export interface SocialPlacement {
  planet: PlanetKey;
  house: number;
  houseName: string;
  houseKeyword: string;
  flavor: HouseFlavor;
}

export interface SocialWeather {
  placements: SocialPlacement[];
  highlights: string[];
  cautions: string[];
  synthesis: string;
}

// Ce que chaque planète "dit" socialement selon qu'elle traverse une maison
// tournée vers les autres, une maison intime, ou une maison neutre — le
// sens de la planète reste le même, seul le terrain sur lequel elle
// s'exprime change.
const PLANET_CLAUSE: Record<Locale, Partial<Record<PlanetKey, Record<HouseFlavor, string>>>> = {
  fr: {
    sun: {
      social: "votre visibilité et votre énergie personnelle sont mises en avant",
      intime: "votre énergie se dirige plutôt vers l'intérieur ou le cercle proche que vers l'extérieur",
      neutre: "votre énergie personnelle est disponible sans être tirée d'un côté ou de l'autre",
    },
    moon: {
      social: "votre humeur est prête à se montrer, pas seulement à se vivre en privé",
      intime: "votre humeur a plutôt besoin d'un cadre calme ou familier pour bien se vivre",
      neutre: "votre humeur suit son cours sans direction particulière",
    },
    mercury: {
      social: "les échanges, la coordination et les invitations circulent facilement",
      intime: "la communication se fait plus volontiers en petit comité ou en tête-à-tête",
      neutre: "la communication suit son rythme habituel",
    },
    venus: {
      social: "le charme, le plaisir et l'envie de faire plaisir aux autres sont au rendez-vous",
      intime: "le plaisir se cherche plutôt dans le confort ou l'intimité que dans le collectif",
      neutre: "le rapport au plaisir reste stable, sans élan particulier vers le collectif",
    },
    mars: {
      social: "vous avez l'énergie et l'envie d'être visible, actif·ve, au centre de quelque chose",
      intime: "l'énergie du moment se dépense plutôt en privé qu'en public",
      neutre: "l'énergie est disponible sans chercher la scène ni l'éviter",
    },
    jupiter: {
      social: "l'enthousiasme et la générosité ambiante jouent en votre faveur",
      intime: "l'optimisme du moment se vit plutôt en petit cercle qu'à grande échelle",
      neutre: "l'optimisme ambiant reste discret, sans effet social marqué",
    },
  },
  en: {
    sun: {
      social: "your visibility and personal energy are front and center",
      intime: "your energy leans inward or toward close circles rather than outward",
      neutre: "your personal energy is available without being pulled either way",
    },
    moon: {
      social: "your mood is ready to be seen, not just lived in private",
      intime: "your mood needs a calm or familiar setting to feel good right now",
      neutre: "your mood follows its usual course, no particular pull",
    },
    mercury: {
      social: "exchanges, coordination and invitations flow easily",
      intime: "communication happens more naturally one-on-one or in small groups",
      neutre: "communication follows its usual rhythm",
    },
    venus: {
      social: "charm, pleasure and the wish to please others are all present",
      intime: "pleasure is sought more in comfort or intimacy than in a crowd",
      neutre: "your relationship to pleasure stays steady, no particular social pull",
    },
    mars: {
      social: "you have the energy and the urge to be visible, active, at the center of something",
      intime: "the moment's energy spends itself more privately than publicly",
      neutre: "energy is available without seeking or avoiding the spotlight",
    },
    jupiter: {
      social: "ambient enthusiasm and generosity work in your favor",
      intime: "the moment's optimism is better lived in a small circle than at scale",
      neutre: "ambient optimism stays quiet, no strong social effect",
    },
  },
};

const TEXT = {
  fr: {
    placementSentence: (planet: string, houseName: string, houseKeyword: string, clause: string) =>
      `${planet} traverse votre ${houseName} (${houseKeyword}) : ${clause}.`,
    moonJupiter: "La Lune et Jupiter s'accordent aujourd'hui : un pic de joie expansive, généreuse — l'aspect classique des bons moments partagés (seul revers : la tendance à l'excès qui va avec).",
    mercuryMarsFriction:
      "Mercure carré Mars : plus d'impatience possible dans les échanges — un mot trop direct peut sortir plus vite que prévu, à vous ou à quelqu'un d'autre.",
    sunSaturnWeight:
      "Soleil carré/opposé Saturne : une responsabilité ou une limite se fait sentir en fond — de quoi peser un peu sur la confiance en soi ou l'organisation, sans rien de dramatique.",
    venusTense:
      "Vénus en tension : un petit frottement autour de vos goûts ou de vos envies — un inconfort qui invite à ajuster plutôt qu'un vrai problème.",
    synthesisHigh: "Le ciel du jour est nettement tourné vers l'extérieur : un bon climat pour recevoir, sortir ou être vu·e.",
    synthesisMid:
      "Le ciel du jour est mitigé : une partie tournée vers les autres, une partie plus intime — un évènement à taille humaine passera sans doute mieux qu'une grande soirée.",
    synthesisLow: "Le ciel du jour penche vers l'intime : plutôt un moment pour un cercle proche que pour une grande sortie.",
  },
  en: {
    placementSentence: (planet: string, houseName: string, houseKeyword: string, clause: string) =>
      `${planet} is crossing your ${houseName} (${houseKeyword}): ${clause}.`,
    moonJupiter:
      "The Moon and Jupiter are in tune today: a peak of expansive, generous joy — the classic aspect for good shared moments (the one downside: the matching tendency to overdo it).",
    mercuryMarsFriction:
      "Mercury square Mars: more impatience possible in exchanges — a too-direct word can slip out faster than planned, from you or someone else.",
    sunSaturnWeight:
      "Sun square/opposite Saturn: a responsibility or limit is felt in the background — enough to weigh a bit on confidence or organization, nothing dramatic.",
    venusTense:
      "Venus under tension: a small friction around your tastes or wants — a discomfort that invites adjusting rather than a real problem.",
    synthesisHigh: "Today's sky leans clearly outward: a good climate for hosting, going out, or being seen.",
    synthesisMid:
      "Today's sky is mixed: partly outward-facing, partly more private — a human-scale gathering will likely land better than a big party.",
    synthesisLow: "Today's sky leans private: more a moment for a close circle than for a big night out.",
  },
} as const;

function hasPair(a: TransitAspect, planetA: PlanetKey, planetB: PlanetKey): boolean {
  return (
    (a.transitingPlanet === planetA && a.natalPoint === planetB) ||
    (a.transitingPlanet === planetB && a.natalPoint === planetA)
  );
}

/**
 * Lecture "angle social" du jour : dans quelles maisons tombent les
 * planètes personnelles en transit (tournées vers les autres, ou plutôt
 * intimes), plus les aspects qui font ou défont l'ambiance (pic de joie
 * Lune-Jupiter, friction Mercure-Mars, poids Soleil-Saturne, tension
 * Vénus). Pensé pour répondre à "c'est un bon moment pour recevoir du
 * monde / faire une fête ?", pas pour remplacer la lecture des transits
 * complète déjà affichée sur la page. Retourne `null` si l'heure de
 * naissance est inconnue — les maisons ne sont alors pas fiables, et il
 * vaut mieux ne rien afficher qu'une lecture trompeuse.
 */
export function composeSocialWeather(
  chart: NatalChart,
  date: Date,
  transitAspects: TransitAspect[],
  locale: Locale = "fr"
): SocialWeather | null {
  if (!chart.hasReliableHouses) return null;

  const t = TEXT[locale];
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const clauseMap = PLANET_CLAUSE[locale];
  const positions = computeTransitingPositions(date);

  const placements: SocialPlacement[] = SOCIAL_PLANETS.map((planet) => {
    const house = houseOfLongitude(positions[planet].longitude, chart.houses.cusps);
    const meta = houseList[house - 1];
    return {
      planet,
      house,
      houseName: meta.name,
      houseKeyword: meta.keyword,
      flavor: flavorOf(house),
    };
  });

  const highlights: string[] = [];
  const cautions: string[] = [];

  for (const p of placements) {
    const clause = clauseMap[p.planet]?.[p.flavor];
    if (!clause) continue;
    const sentence = t.placementSentence(planetMap[p.planet].name, p.houseName, p.houseKeyword, clause);
    if (p.flavor === "social") highlights.push(sentence);
    else if (p.flavor === "intime" && (p.planet === "sun" || p.planet === "venus" || p.planet === "mars")) {
      cautions.push(sentence);
    }
  }

  for (const a of transitAspects) {
    if (hasPair(a, "moon", "jupiter") && ["conjunction", "trine", "sextile"].includes(a.aspect)) {
      highlights.push(t.moonJupiter);
    }
    if (hasPair(a, "mercury", "mars") && ["square", "opposition"].includes(a.aspect)) {
      cautions.push(t.mercuryMarsFriction);
    }
    if (hasPair(a, "sun", "saturn") && ["square", "opposition"].includes(a.aspect)) {
      cautions.push(t.sunSaturnWeight);
    }
    if (a.transitingPlanet === "venus" && (a.natalPoint === "venus" || a.natalPoint === "mars") && ["square", "opposition"].includes(a.aspect)) {
      cautions.push(t.venusTense);
    }
  }

  const socialCount = placements.filter((p) => p.flavor === "social").length;
  const synthesis = socialCount >= 4 ? t.synthesisHigh : socialCount >= 2 ? t.synthesisMid : t.synthesisLow;

  return { placements, highlights, cautions, synthesis };
}
