import { PLANET_KEYS, type CompositeChart, type PointKey } from "../types";
import { computeBigThree, computeDominance } from "../dominance";
import { computeAspects } from "../aspects";
import { signOf } from "../signs";
import { describeAspect, describePlanetInSign, describePlanetInHouse, frArticle, type Locale } from "./compose";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import { SIGN_RULER } from "./rulership";
import type { RelationshipType } from "./relationship";

const PERSONAL_AND_ANGLES: PointKey[] = ["sun", "moon", "mercury", "venus", "mars", "asc", "mc"];
const OUTER_POINTS: PointKey[] = ["jupiter", "saturn", "uranus", "neptune", "pluto", "northNode"];
const SYNTHESIS_POINTS: PointKey[] = [...PERSONAL_AND_ANGLES, ...OUTER_POINTS];
const DOMAIN_OCCUPANT_KEYS: PointKey[] = [...PLANET_KEYS, "fortune"];

const TENSE_ASPECT_KEYS = ["square", "opposition", "semi-square", "sesquiquadrate", "quincunx"];
const FLOWING_ASPECT_KEYS = ["trine", "sextile"];

export interface CompositeLifeDomainReading {
  house: number;
  title: string;
  text: string;
}

export interface CompositeSynthesis {
  overview: string;
  tensions: string[];
  strengths: string[];
  lifeDomains: CompositeLifeDomainReading[];
}

/**
 * Lecture détaillée d'une maison précise du composite. Extraite en
 * fonction autonome pour être réutilisée aussi bien par
 * `buildCompositeLifeDomains` (les 12 maisons à la suite) que par la
 * synthèse "grimoire" (regroupement thématique de quelques maisons
 * ciblées, voir chart-domains.ts).
 */
export function describeCompositeHouseDomain(
  composite: CompositeChart,
  relationshipType: RelationshipType,
  houseNumber: number,
  locale: Locale
): CompositeLifeDomainReading {
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;

  const house = houseList[houseNumber - 1];
  const occupants = DOMAIN_OCCUPANT_KEYS.filter((key) => composite.points[key]?.house === houseNumber);

  if (occupants.length > 0) {
    const paragraphs = occupants.map((key) => describePlanetInHouse(key, houseNumber, locale)).join(" ");
    const names = occupants.map((key) => planetMap[key].name).join(locale === "en" ? " and " : " et ");
    const intro =
      occupants.length > 1
        ? locale === "en"
          ? `${house.name} concentrates several placements at once in this relationship's composite chart (${names}), a domain that carries real weight for this bond. `
          : `${house.name} concentre plusieurs placements à la fois dans le thème composite de cette relation (${names}), un domaine qui pèse particulièrement pour ce lien. `
        : "";
    return { house: houseNumber, title: house.name, text: `${intro}${paragraphs}` };
  }

  const cuspSign = signOf(composite.houses.cusps[houseNumber - 1]);
  const cuspSignName = signMap[cuspSign].name;
  const rulerKey = SIGN_RULER[cuspSign];
  const rulerPoint = composite.points[rulerKey];
  const rulerName = planetMap[rulerKey].name;

  // Comme pour la synthèse natale : ne pas se contenter d'énoncer où se
  // trouve le maître de la maison, mais réutiliser le texte détaillé par
  // signe/maison pour expliquer concrètement ce que ce placement veut dire.
  let text: string;
  if (locale === "en") {
    let rulerPlace = "";
    if (rulerPoint) {
      const rulerSign = signOf(rulerPoint.longitude);
      const rulerSignText = describePlanetInSign(rulerKey, rulerSign, relationshipType, locale);
      const rulerHouseText = rulerPoint.house ? describePlanetInHouse(rulerKey, rulerPoint.house, locale) : null;
      rulerPlace = ` In this relationship's composite chart, ${rulerName}, this house's ruler, sits in ${signMap[rulerSign].name}${
        rulerPoint.house ? `, house ${rulerPoint.house}` : ""
      }: that placement is where this domain's real story actually plays out for the bond. Concretely, here's what that means: ${rulerSignText}${
        rulerHouseText ? ` ${rulerHouseText}` : ""
      }`;
    }
    text = `${house.name} holds no planet of its own in this composite chart: this domain is read indirectly, through ${cuspSignName} on its cusp (${house.keyword}) and through its ruler, ${rulerName}.${rulerPlace}`;
  } else {
    let rulerPlace = "";
    if (rulerPoint) {
      const rulerSign = signOf(rulerPoint.longitude);
      const rulerSignText = describePlanetInSign(rulerKey, rulerSign, relationshipType, locale);
      const rulerHouseText = rulerPoint.house ? describePlanetInHouse(rulerKey, rulerPoint.house, locale) : null;
      rulerPlace = ` Dans le thème composite de cette relation, ${frArticle(rulerKey, rulerName)}${rulerName}, maître de cette maison, se trouve en ${signMap[rulerSign].name}${
        rulerPoint.house ? `, maison ${rulerPoint.house}` : ""
      } : c'est là que se joue concrètement l'histoire réelle de ce domaine pour ce lien. Concrètement, voici ce que ça signifie : ${rulerSignText}${
        rulerHouseText ? ` ${rulerHouseText}` : ""
      }`;
    }
    text = `${house.name} n'abrite aucune planète en propre dans ce thème composite : ce domaine se lit indirectement, à travers le signe ${cuspSignName} sur sa pointe (${house.keyword}) et à travers ${frArticle(rulerKey, rulerName)}${rulerName}, son maître.${rulerPlace}`;
  }

  return { house: houseNumber, title: house.name, text };
}

function buildCompositeLifeDomains(
  composite: CompositeChart,
  relationshipType: RelationshipType,
  locale: Locale
): CompositeLifeDomainReading[] {
  if (!composite.hasReliableHouses) return [];
  const domains: CompositeLifeDomainReading[] = [];
  for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
    domains.push(describeCompositeHouseDomain(composite, relationshipType, houseNumber, locale));
  }
  return domains;
}

/**
 * Lecture de synthèse (fonctionnalité Premium) pour le thème composite :
 * relie Big 3 composite, dominante et domaines de vie en un seul récit
 * centré sur l'identité propre de la relation — ce qu'elle "est" en tant
 * qu'entité — plutôt que de renvoyer chaque personne à ses propres traits.
 */
export function composeCompositeSynthesis(
  composite: CompositeChart,
  relationshipType: RelationshipType,
  locale: Locale = "fr"
): CompositeSynthesis {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;

  const big3 = computeBigThree(composite.points, composite.hasReliableHouses);
  const dominance = computeDominance(composite.points, composite.hasReliableHouses);
  const dominantElements = dominance.dominantElements;
  const dominantModalities = dominance.dominantModalities;

  const sunMeta = signMap[big3.sun];
  const moonMeta = signMap[big3.moon];
  const ascMeta = big3.ascendant ? signMap[big3.ascendant] : null;

  const primaryModality = dominantModalities[0];

  const overview =
    locale === "en"
      ? `This relationship's own composite Sun is in ${sunMeta.name} ${sunMeta.symbol}, its composite Moon in ${moonMeta.name} ${moonMeta.symbol}${
          ascMeta ? `, its composite Ascendant in ${ascMeta.name} ${ascMeta.symbol}` : ""
        }, not what either of you is individually, but what the bond itself tends to look like from the outside and feel like from within. ${
          dominantElements.length > 0
            ? dominantElements.length > 1
              ? `The relationship leans evenly between ${dominantElements.join(" and ")} overall`
              : `The relationship leans ${dominantElements[0]} overall`
            : "No single element clearly dominates this bond"
        }${dominantModalities.length > 0 ? `, with a ${dominantModalities.join("/")} way of handling itself` : ""}, in practice, ${
          primaryModality === "Cardinal"
            ? "this is a relationship that tends to initiate, decide, and set things in motion together rather than wait for the right moment"
            : primaryModality === "Fixe"
              ? "this is a relationship that tends to hold its course once it commits to something, more than jump between directions"
              : "this is a relationship that tends to adjust fluidly to circumstances rather than lock itself into a fixed shape"
        }.`
      : `Le Soleil composite de cette relation est en ${sunMeta.name} ${sunMeta.symbol}, sa Lune composite en ${moonMeta.name} ${moonMeta.symbol}${
          ascMeta ? `, son Ascendant composite en ${ascMeta.name} ${ascMeta.symbol}` : ""
        }, pas ce que chacun de vous est individuellement, mais ce que le lien lui-même a tendance à montrer de l'extérieur et à ressentir de l'intérieur. ${
          dominantElements.length > 0
            ? dominantElements.length > 1
              ? `La relation penche à égalité entre ${dominantElements.join(" et ")}`
              : `La relation penche globalement du côté ${dominantElements[0] === "Air" || dominantElements[0] === "Eau" ? "de l'" : "du "}${dominantElements[0]}`
            : "Aucun élément ne domine nettement ce lien"
        }${dominantModalities.length > 0 ? `, avec une façon ${dominantModalities.join("/")} de se gérer` : ""}, concrètement, ${
          primaryModality === "Cardinal"
            ? "c'est une relation qui a tendance à initier, décider et lancer les choses ensemble plutôt qu'attendre le bon moment"
            : primaryModality === "Fixe"
              ? "c'est une relation qui a tendance à tenir le cap une fois engagée sur quelque chose, plus qu'à changer souvent de direction"
              : "c'est une relation qui a tendance à s'ajuster avec fluidité aux circonstances plutôt qu'à se figer dans une forme fixe"
        }.`;

  const keyAspects = computeAspects(composite.points, SYNTHESIS_POINTS)
    .filter((a) => PERSONAL_AND_ANGLES.includes(a.a) || PERSONAL_AND_ANGLES.includes(a.b))
    .sort((a, b) => Math.abs(a.exact) - Math.abs(b.exact));

  // Volontairement non plafonné : la synthèse doit couvrir tout le thème,
  // pas une sélection arbitraire des quelques aspects les plus serrés.
  const tensions = keyAspects
    .filter((a) => TENSE_ASPECT_KEYS.includes(a.aspect))
    .map((a) => describeAspect(a, "composite", relationshipType, locale));

  const strengths = keyAspects
    .filter((a) => FLOWING_ASPECT_KEYS.includes(a.aspect))
    .map((a) => describeAspect(a, "composite", relationshipType, locale));

  const lifeDomains = buildCompositeLifeDomains(composite, relationshipType, locale);

  return { overview, tensions, strengths, lifeDomains };
}
