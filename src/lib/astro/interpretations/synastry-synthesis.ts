import type { SynastryAspect } from "../synastry";
import { describeAspect, type Locale } from "./compose";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import type { RelationshipType } from "./relationship";

const TENSE_ASPECT_KEYS = ["square", "opposition", "semi-square", "sesquiquadrate", "quincunx"];
const FLOWING_ASPECT_KEYS = ["trine", "sextile"];

export interface RelationshipSynthesis {
  overview: string;
  strengths: string[];
  tensions: string[];
}

/**
 * Lecture de synthèse (fonctionnalité Premium) pour la synastrie : au lieu
 * de laisser chaque aspect croisé isolé à interpréter un par un (déjà
 * listés individuellement plus haut sur la page), condense la dynamique
 * d'ensemble en un seul récit — pourcentage, tonalité dominante, puis les
 * aspects qui pèsent le plus dans un sens et dans l'autre.
 */
export function composeSynastrySynthesis(
  aspects: SynastryAspect[],
  compatibilityPercentage: number,
  punchline: string,
  labelA: string,
  labelB: string,
  relationshipType: RelationshipType,
  locale: Locale = "fr"
): RelationshipSynthesis {
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const majorAspects = aspects.filter((a) => a.major);

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
      ? `${labelA} and ${labelB} score ${compatibilityPercentage}% compatibility on this reading — ${punchline}. Out of ${majorAspects.length} major aspects linking them, ${harmoniousCount} flow easily and ${tenseCount} run tense${
          neutralCount > 0 ? `, with ${neutralCount} more neutral` : ""
        }. ${
          dominant === "harmonious"
            ? "This is a bond that tends to work without much conscious effort day to day — the real work, if there is any, plays out elsewhere, not in the relationship itself."
            : dominant === "tense"
              ? "This is a bond that asks for real, conscious effort to work well — nothing alarming in itself, just little ease handed to them for free."
              : "This is a bond that mixes real ease with real friction, in roughly equal measure — neither a smooth ride nor a constant struggle."
        }`
      : `${labelA} et ${labelB} affichent ${compatibilityPercentage} % de compatibilité sur cette lecture — ${punchline}. Sur les ${majorAspects.length} aspects majeurs qui les relient, ${harmoniousCount} circulent facilement et ${tenseCount} sont tendus${
          neutralCount > 0 ? `, avec ${neutralCount} de plus neutres` : ""
        }. ${
          dominant === "harmonious"
            ? "C'est un lien qui a tendance à fonctionner sans trop d'efforts conscients au quotidien — le vrai travail, s'il y en a un, se joue ailleurs, pas dans la relation elle-même."
            : dominant === "tense"
              ? "C'est un lien qui demande un vrai travail conscient pour bien fonctionner — rien d'alarmant en soi, juste peu de facilité acquise d'avance."
              : "C'est un lien qui mélange une vraie facilité et de vraies frictions, à peu près à parts égales — ni un long fleuve tranquille, ni une lutte permanente."
        }`;

  const sorted = [...majorAspects].sort((a, b) => Math.abs(a.exact) - Math.abs(b.exact));

  const tensions = sorted
    .filter((a) => TENSE_ASPECT_KEYS.includes(a.aspect))
    .slice(0, 4)
    .map((a) => describeAspect(a, "synastry", relationshipType, locale));

  const strengths = sorted
    .filter((a) => FLOWING_ASPECT_KEYS.includes(a.aspect))
    .slice(0, 4)
    .map((a) => describeAspect(a, "synastry", relationshipType, locale));

  return { overview, strengths, tensions };
}
