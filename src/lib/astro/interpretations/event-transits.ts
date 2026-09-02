import type { NatalChart, PlanetKey, PointKey } from "../types";
import { houseOfLongitude } from "../houses";
import { computeTransitingPositions } from "../transits";
import type { TransitAspect } from "../transits";
import type { MoonPhaseReading } from "../moonphase";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import { MOON_PHASE_TEXT } from "./moonphase-content";
import { MOON_PHASE_TEXT_EN, MOON_PHASE_LABEL_EN } from "./moonphase-content.en";
import { describeTransitAspect, type Locale } from "./compose";
import { composeSocialWeather } from "./social-weather";

export const EVENT_TYPES = ["voyage", "anniversaire", "mariage", "soutenance"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

const SOCIAL_PLANETS: readonly PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter"];

// Maisons et points natals les plus parlants pour chaque type d'événement —
// pas les seuls thèmes possibles, mais ceux qui répondent le plus
// directement à "c'est un bon jour pour X ?".
const EVENT_FOCUS_HOUSES: Record<EventType, number[]> = {
  voyage: [9, 3],
  anniversaire: [1, 5, 11],
  mariage: [7, 5],
  soutenance: [9, 10],
};

const EVENT_FOCUS_POINTS: Record<EventType, PointKey[]> = {
  voyage: ["jupiter", "moon", "mercury"],
  anniversaire: ["sun", "venus", "moon"],
  mariage: ["venus", "moon", "mars"],
  soutenance: ["mercury", "saturn", "sun"],
};

const EVENT_LABEL: Record<Locale, Record<EventType, string>> = {
  fr: { voyage: "Voyage", anniversaire: "Anniversaire", mariage: "Mariage", soutenance: "Soutenance / examen" },
  en: { voyage: "Trip", anniversaire: "Birthday", mariage: "Wedding", soutenance: "Thesis defense / exam" },
};

const EVENT_INTRO: Record<Locale, Record<EventType, string>> = {
  fr: {
    voyage: "Pour un voyage prévu ce jour-là, ce sont les maisons IX (l'ailleurs, les grands horizons) et III (les trajets, l'organisation concrète) qui comptent le plus.",
    anniversaire: "Pour une fête ce jour-là, ce sont les maisons I (être vu·e), V (le plaisir) et XI (les amis) qui donnent le ton.",
    mariage: "Pour un mariage ce jour-là, ce sont la maison VII (le couple, l'engagement) et la maison V (le plaisir, la fête) qui comptent le plus.",
    soutenance: "Pour une soutenance ou un examen ce jour-là, ce sont la maison IX (le savoir) et la maison X (la reconnaissance, le statut) qui comptent le plus.",
  },
  en: {
    voyage: "For a trip planned that day, House IX (far horizons) and House III (short trips, logistics) matter most.",
    anniversaire: "For a party that day, House I (being seen), House V (pleasure) and House XI (friends) set the tone.",
    mariage: "For a wedding that day, House VII (partnership, commitment) and House V (pleasure, celebration) matter most.",
    soutenance: "For a thesis defense or exam that day, House IX (knowledge) and House X (recognition, status) matter most.",
  },
};

export interface EventHousePlacement {
  planet: PlanetKey;
  house: number;
  houseName: string;
  houseKeyword: string;
  isFocus: boolean;
}

export interface EventAspectLine {
  text: string;
  tone: "harmonieux" | "tendu" | "neutre";
  isFocus: boolean;
}

export interface EventBriefing {
  eventType: EventType;
  eventLabel: string;
  intro: string;
  moonPhaseLabel: string;
  moonPhaseText: string;
  housePlacements: EventHousePlacement[];
  aspects: EventAspectLine[];
  /** Synthèse déterministe (gabarit, pas d'IA) — filet de sécurité si l'IA n'est pas configurée ou échoue. */
  templateSynthesis: string;
}

/**
 * Lecture des transits centrée sur un type d'événement précis (voyage,
 * anniversaire, mariage, soutenance) : quelles maisons/points sont
 * concernés, quels aspects jouent pour ou contre. Sert de base factuelle
 * à la fois à l'affichage direct (repli sans IA) et au prompt envoyé à
 * l'IA pour la version narrée — jamais l'inverse, l'IA ne reçoit que ce
 * qui a déjà été calculé ici, elle n'invente aucun fait astrologique.
 * `anniversaire` réutilise composeSocialWeather (même lecture, déjà
 * conçue et testée pour ce cas précis) plutôt que de dupliquer sa logique.
 */
export function composeEventBriefing(
  chart: NatalChart,
  date: Date,
  transitAspects: TransitAspect[],
  moon: MoonPhaseReading,
  eventType: EventType,
  locale: Locale = "fr"
): EventBriefing | null {
  if (!chart.hasReliableHouses) return null;

  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const moonTextMap = locale === "en" ? MOON_PHASE_TEXT_EN : MOON_PHASE_TEXT;
  const moonLabel = locale === "en" ? MOON_PHASE_LABEL_EN[moon.name] : moon.name;

  const focusHouses = new Set(EVENT_FOCUS_HOUSES[eventType]);
  const focusPoints = new Set(EVENT_FOCUS_POINTS[eventType]);

  if (eventType === "anniversaire") {
    const social = composeSocialWeather(chart, date, transitAspects, locale);
    if (!social) return null;
    const housePlacements: EventHousePlacement[] = social.placements.map((p) => ({
      planet: p.planet,
      house: p.house,
      houseName: p.houseName,
      houseKeyword: p.houseKeyword,
      isFocus: p.flavor === "social",
    }));
    const aspects: EventAspectLine[] = transitAspects
      .filter((a) => a.major)
      .slice(0, 6)
      .map((a) => ({
        text: describeTransitAspect(a, locale),
        tone: aspectMap[a.aspect].tone,
        isFocus: focusPoints.has(a.natalPoint) || focusPoints.has(a.transitingPlanet),
      }));
    const templateSynthesis = [social.synthesis, ...social.highlights, ...social.cautions].join(" ");
    return {
      eventType,
      eventLabel: EVENT_LABEL[locale][eventType],
      intro: EVENT_INTRO[locale][eventType],
      moonPhaseLabel: moonLabel,
      moonPhaseText: moonTextMap[moon.name],
      housePlacements,
      aspects,
      templateSynthesis,
    };
  }

  const positions = computeTransitingPositions(date);
  const housePlacements: EventHousePlacement[] = SOCIAL_PLANETS.map((planet) => {
    const house = houseOfLongitude(positions[planet].longitude, chart.houses.cusps);
    const meta = houseList[house - 1];
    return {
      planet,
      house,
      houseName: meta.name,
      houseKeyword: meta.keyword,
      isFocus: focusHouses.has(house),
    };
  });

  // Aspects touchant un point natal pertinent pour l'événement en premier,
  // puis les autres aspects majeurs pour garder du contexte — jamais
  // plus de 6, pour rester un vrai résumé et pas une liste exhaustive.
  const focusAspects = transitAspects.filter((a) => a.major && focusPoints.has(a.natalPoint));
  const otherAspects = transitAspects.filter((a) => a.major && !focusPoints.has(a.natalPoint));
  const aspects: EventAspectLine[] = [...focusAspects, ...otherAspects].slice(0, 6).map((a) => ({
    text: describeTransitAspect(a, locale),
    tone: aspectMap[a.aspect].tone,
    isFocus: focusPoints.has(a.natalPoint),
  }));

  const focusCount = housePlacements.filter((p) => p.isFocus).length;
  const harmoniousFocus = aspects.filter((a) => a.isFocus && a.tone === "harmonieux").length;
  const tenseFocus = aspects.filter((a) => a.isFocus && a.tone === "tendu").length;

  const synthesisParts: string[] = [EVENT_INTRO[locale][eventType]];
  if (focusCount > 0) {
    const planetsInFocus = housePlacements
      .filter((p) => p.isFocus)
      .map((p) => planetMap[p.planet].name)
      .join(locale === "en" ? ", " : ", ");
    synthesisParts.push(
      locale === "en"
        ? `Right now: ${planetsInFocus} ${housePlacements.filter((p) => p.isFocus).length > 1 ? "are" : "is"} placed exactly there.`
        : `En ce moment : ${planetsInFocus} s'y trouve${housePlacements.filter((p) => p.isFocus).length > 1 ? "nt" : ""} justement.`
    );
  }
  if (harmoniousFocus > 0 && tenseFocus === 0) {
    synthesisParts.push(locale === "en" ? "The aspects touching this theme are supportive." : "Les aspects qui touchent ce thème sont plutôt porteurs.");
  } else if (tenseFocus > 0 && harmoniousFocus === 0) {
    synthesisParts.push(
      locale === "en"
        ? "The aspects touching this theme carry some friction — worth planning around rather than a reason to cancel."
        : "Les aspects qui touchent ce thème portent une part de friction — de quoi anticiper, pas de quoi annuler."
    );
  } else if (harmoniousFocus > 0 && tenseFocus > 0) {
    synthesisParts.push(
      locale === "en"
        ? "Mixed signal: something supportive and something tense both touch this theme."
        : "Signal mitigé : quelque chose de porteur et quelque chose de tendu touchent tous les deux ce thème."
    );
  }

  return {
    eventType,
    eventLabel: EVENT_LABEL[locale][eventType],
    intro: EVENT_INTRO[locale][eventType],
    moonPhaseLabel: moonLabel,
    moonPhaseText: moonTextMap[moon.name],
    housePlacements,
    aspects,
    templateSynthesis: synthesisParts.join(" "),
  };
}
