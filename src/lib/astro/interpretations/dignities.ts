import type { PlanetKey, ZodiacSign } from "../types";
import { ZODIAC_SIGNS } from "../types";
import { SIGN_RULER } from "./rulership";
import type { Locale } from "./compose";

/**
 * Domicile et exil dérivés de SIGN_RULER (maîtrise moderne déjà utilisée
 * partout ailleurs dans l'app) pour rester cohérent avec le reste du moteur.
 * L'exaltation/chute suit la table traditionnelle des 7 planètes classiques
 * uniquement : l'attribution pour Uranus/Neptune/Pluton est trop disputée
 * d'une école à l'autre pour être affirmée comme un fait au LLM.
 */
const EXALTATION_SIGN: Partial<Record<PlanetKey, ZodiacSign>> = {
  sun: "belier",
  moon: "taureau",
  mercury: "vierge",
  venus: "poissons",
  mars: "capricorne",
  jupiter: "cancer",
  saturn: "balance",
};

export type DignityStatus = "domicile" | "exaltation" | "exil" | "chute";

function oppositeSign(sign: ZodiacSign): ZodiacSign {
  const i = ZODIAC_SIGNS.indexOf(sign);
  return ZODIAC_SIGNS[(i + 6) % 12];
}

/**
 * Renvoie un tableau plutôt qu'un statut unique : Mercure en Vierge est à la
 * fois en domicile ET exalté (les deux tables se recoupent sur ce seul cas
 * dans tout le zodiaque), une double dignité réelle qu'un simple statut
 * unique effacerait silencieusement.
 */
export function dignitiesOf(planet: PlanetKey, sign: ZodiacSign): DignityStatus[] {
  const statuses: DignityStatus[] = [];
  if (SIGN_RULER[sign] === planet) statuses.push("domicile");
  const exaltationSign = EXALTATION_SIGN[planet];
  if (exaltationSign === sign) statuses.push("exaltation");
  if (exaltationSign && oppositeSign(exaltationSign) === sign) statuses.push("chute");
  if (SIGN_RULER[oppositeSign(sign)] === planet) statuses.push("exil");
  return statuses;
}

const LABEL_FR: Record<DignityStatus, string> = {
  domicile: "en domicile",
  exaltation: "exalté",
  exil: "en exil",
  chute: "en chute",
};
const LABEL_EN: Record<DignityStatus, string> = {
  domicile: "in domicile",
  exaltation: "exalted",
  exil: "in detriment",
  chute: "in fall",
};

export function dignityLabel(status: DignityStatus, locale: Locale = "fr"): string {
  return locale === "en" ? LABEL_EN[status] : LABEL_FR[status];
}
