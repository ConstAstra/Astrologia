import type { SynastryResult } from "../synastry";
import type { NatalChart } from "../types";
import { describeAspect, type Locale } from "./compose";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import type { RelationshipType } from "./relationship";

const TENSE_ASPECT_KEYS = ["square", "opposition", "semi-square", "sesquiquadrate", "quincunx"];
const FLOWING_ASPECT_KEYS = ["trine", "sextile"];

export interface RelationshipSynthesis {
  overview: string;
  /** Résumé des maisons les plus "activées" par les planètes de l'autre ; null si les heures de naissance ne sont pas fiables des deux côtés. */
  housesOverview: string | null;
  strengths: string[];
  tensions: string[];
}

/**
 * Identifie, parmi tous les recouvrements de maisons des deux côtés
 * (déjà détaillés maison par maison plus bas sur la page), celle qui
 * concentre le plus de planètes de l'autre — le point du thème le plus
 * "chargé" par la relation. Une simple liste de recouvrements dilue
 * l'information ; ce comptage fait ressortir ce qui compte vraiment.
 */
function summarizeHouses(
  synastry: SynastryResult,
  chartA: NatalChart,
  chartB: NatalChart,
  labelA: string,
  labelB: string,
  locale: Locale
): string | null {
  if (!chartA.hasReliableHouses || !chartB.hasReliableHouses) return null;

  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const countsInA = new Map<number, number>();
  for (const overlay of synastry.bPlanetsInAHouses) countsInA.set(overlay.house, (countsInA.get(overlay.house) ?? 0) + 1);
  const countsInB = new Map<number, number>();
  for (const overlay of synastry.aPlanetsInBHouses) countsInB.set(overlay.house, (countsInB.get(overlay.house) ?? 0) + 1);

  const topA = [...countsInA.entries()].sort((x, y) => y[1] - x[1])[0];
  const topB = [...countsInB.entries()].sort((x, y) => y[1] - x[1])[0];
  if (!topA || !topB) return null;

  const houseNameA = houseList[topA[0] - 1].name;
  const houseNameB = houseList[topB[0] - 1].name;

  if (locale === "en") {
    return `${labelB}'s planets cluster most in ${labelA}'s house ${topA[0]} (${houseNameA}), and ${labelA}'s planets cluster most in ${labelB}'s house ${topB[0]} (${houseNameB}). Those two houses, more than any other, are where this bond concretely lands in each person's life. See the full house-by-house breakdown below for what each domain means.`;
  }
  return `Les planètes de ${labelB} se concentrent le plus dans la maison ${topA[0]} de ${labelA} (${houseNameA}), et celles de ${labelA} dans la maison ${topB[0]} de ${labelB} (${houseNameB}). Ces deux maisons, plus que les autres, sont là où ce lien atterrit concrètement dans la vie de chacun·e. Voir le détail maison par maison plus bas pour ce que chaque domaine signifie.`;
}

/**
 * Lecture de synthèse (fonctionnalité Premium) pour la synastrie : au lieu
 * de laisser chaque aspect croisé isolé à interpréter un par un (déjà
 * listés individuellement plus bas sur la page), condense la dynamique
 * d'ensemble en un seul récit — pourcentage, tonalité dominante, la
 * totalité des aspects majeurs qui pèsent dans un sens et dans l'autre, et
 * un pointeur vers les maisons les plus concernées par le lien.
 */
export function composeSynastrySynthesis(
  synastry: SynastryResult,
  chartA: NatalChart,
  chartB: NatalChart,
  compatibilityPercentage: number,
  punchline: string,
  labelA: string,
  labelB: string,
  relationshipType: RelationshipType,
  locale: Locale = "fr"
): RelationshipSynthesis {
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const majorAspects = synastry.aspects.filter((a) => a.major);

  let harmoniousCount = 0;
  let tenseCount = 0;
  let neutralCount = 0;
  for (const a of majorAspects) {
    const tone = aspectMap[a.aspect].tone;
    if (tone === "harmonieux") harmoniousCount++;
    else if (tone === "tendu") tenseCount++;
    else neutralCount++;
  }

  const dominant =
    harmoniousCount > tenseCount * 1.4
      ? "harmonious"
      : tenseCount > harmoniousCount * 1.4
        ? "tense"
        : "balanced";

  const overview =
    locale === "en"
      ? `${labelA} and ${labelB} score ${compatibilityPercentage}% compatibility on this reading: ${punchline}. Out of ${majorAspects.length} major aspects linking them, ${harmoniousCount} flow easily and ${tenseCount} run tense${
          neutralCount > 0 ? `, with ${neutralCount} more neutral` : ""
        }. ${
          dominant === "harmonious"
            ? "This is a bond that tends to work without much conscious effort day to day. The real work, if there is any, plays out elsewhere, not in the relationship itself."
            : dominant === "tense"
              ? "This is a bond that asks for real, conscious effort to work well. Nothing alarming in itself, just little ease handed to them for free."
              : "This is a bond that mixes real ease with real friction, in roughly equal measure: neither a smooth ride nor a constant struggle."
        }`
      : `${labelA} et ${labelB} affichent ${compatibilityPercentage} % de compatibilité sur cette lecture : ${punchline}. Sur les ${majorAspects.length} aspects majeurs qui les relient, ${harmoniousCount} circulent facilement et ${tenseCount} sont tendus${
          neutralCount > 0 ? `, avec ${neutralCount} de plus neutres` : ""
        }. ${
          dominant === "harmonious"
            ? "C'est un lien qui a tendance à fonctionner sans trop d'efforts conscients au quotidien. Le vrai travail, s'il y en a un, se joue ailleurs, pas dans la relation elle-même."
            : dominant === "tense"
              ? "C'est un lien qui demande un vrai travail conscient pour bien fonctionner. Rien d'alarmant en soi, juste peu de facilité acquise d'avance."
              : "C'est un lien qui mélange une vraie facilité et de vraies frictions, à peu près à parts égales : ni un long fleuve tranquille, ni une lutte permanente."
        }`;

  const sorted = [...majorAspects].sort((a, b) => Math.abs(a.exact) - Math.abs(b.exact));

  // Volontairement non plafonné : la synthèse doit couvrir tout le thème,
  // pas une sélection arbitraire des quelques aspects les plus serrés.
  const tensions = sorted
    .filter((a) => TENSE_ASPECT_KEYS.includes(a.aspect))
    .map((a) => describeAspect(a, "synastry", relationshipType, locale));

  const strengths = sorted
    .filter((a) => FLOWING_ASPECT_KEYS.includes(a.aspect))
    .map((a) => describeAspect(a, "synastry", relationshipType, locale));

  const housesOverview = summarizeHouses(synastry, chartA, chartB, labelA, labelB, locale);

  return { overview, strengths, tensions, housesOverview };
}
