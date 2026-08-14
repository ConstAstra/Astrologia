import { PLANET_KEYS, type NatalChart, type PointKey } from "../types";
import { computeBigThree, computeDominance } from "../dominance";
import { computeAspects } from "../aspects";
import { signOf } from "../signs";
import {
  describeAspect,
  describePlanetInSign,
  describePlanetInHouse,
  frArticle,
  type Locale,
} from "./compose";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import { SIGN_RULER } from "./rulership";

// Planètes personnelles + les deux angles majeurs (Ascendant, Milieu du
// Ciel), qui structurent l'identité et la trajectoire de façon strictement
// individuelle.
const PERSONAL_AND_ANGLES: PointKey[] = ["sun", "moon", "mercury", "venus", "mars", "asc", "mc"];
// Planètes lentes : leurs aspects entre elles marquent surtout une
// génération entière (voir dominance.ts), mais un aspect entre l'une
// d'elles et un point personnel reste, lui, individuel et significatif —
// on ne les exclut donc que des paires purement lentes-lentes plus bas.
const OUTER_POINTS: PointKey[] = ["jupiter", "saturn", "uranus", "neptune", "pluto", "northNode"];
const SYNTHESIS_POINTS: PointKey[] = [...PERSONAL_AND_ANGLES, ...OUTER_POINTS];

// Occupants possibles d'une maison, pour la lecture "domaines de vie" —
// tous les points mobiles du thème (les angles sont les pointes de maison
// elles-mêmes, pas des occupants).
const DOMAIN_OCCUPANT_KEYS: PointKey[] = [...PLANET_KEYS, "fortune"];

const TENSE_ASPECT_KEYS = ["square", "opposition", "semi-square", "sesquiquadrate", "quincunx"];
const FLOWING_ASPECT_KEYS = ["trine", "sextile"];

// Paires d'éléments classiquement considérées comme antagonistes : le Feu
// (spontané, extraverti) et l'Eau (intériorisé, prudent) tirent en sens
// contraires, de même que la Terre (concrète) et l'Air (abstrait). Les
// autres combinaisons (Feu-Terre, Feu-Air, Eau-Terre, Eau-Air) se marient
// plus naturellement.
const ELEMENT_FRICTION_PAIRS: [string, string][] = [
  ["Feu", "Eau"],
  ["Terre", "Air"],
];

const ELEMENT_NAME_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

const ELEMENT_KEYWORD: Record<Locale, Record<string, string>> = {
  fr: {
    Feu: "l'élan, l'instinct d'agir sans trop attendre",
    Terre: "le concret, la prudence, le besoin de preuves tangibles",
    Air: "la distance réflexive, l'analyse avant le ressenti",
    Eau: "l'intériorisation, le besoin de sentir avant de comprendre",
  },
  en: {
    Feu: "momentum, the instinct to act without waiting too long",
    Terre: "the concrete, caution, the need for tangible proof",
    Air: "reflective distance, analysis before feeling",
    Eau: "internalization, the need to feel before understanding",
  },
};

const MODALITY_NAME_EN: Record<string, string> = { Cardinal: "Cardinal", Fixe: "Fixed", Mutable: "Mutable" };

export interface LifeDomainReading {
  house: number;
  title: string;
  text: string;
}

export interface ChartSynthesis {
  overview: string;
  ascendantRulerIntro: string | null;
  ascendantRulerSign: string | null;
  ascendantRulerHouse: string | null;
  contradictions: string[];
  strengths: string[];
  lifeDomains: LifeDomainReading[];
}

/**
 * Lecture détaillée d'une maison précise : occupée, elle réutilise
 * describePlanetInHouse (déjà écrit, planète par planète) pour chaque
 * occupant ; vide, elle se lit indirectement à travers le signe sur sa
 * pointe et la position de son maître ailleurs dans le thème (avec le même
 * niveau de détail que si la planète occupait la maison directement) —
 * une lecture classique en astrologie, plutôt que de la passer sous
 * silence faute de planète dedans. Extraite en fonction autonome pour être
 * réutilisée aussi bien par `buildLifeDomains` (les 12 maisons à la suite)
 * que par la synthèse "grimoire" (regroupement thématique de quelques
 * maisons ciblées, voir chart-domains.ts).
 */
export function describeHouseDomain(chart: NatalChart, houseNumber: number, locale: Locale = "fr"): LifeDomainReading {
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;

  const house = houseList[houseNumber - 1];
  const occupants = DOMAIN_OCCUPANT_KEYS.filter((key) => chart.points[key]?.house === houseNumber);

  if (occupants.length > 0) {
    const paragraphs = occupants.map((key) => describePlanetInHouse(key, houseNumber, locale)).join(" ");
    const names = occupants.map((key) => planetMap[key].name).join(locale === "en" ? " and " : " et ");
    const intro =
      occupants.length > 1
        ? locale === "en"
          ? `${house.name} concentrates several placements at once (${names}), a domain that carries real weight in this chart. `
          : `${house.name} concentre plusieurs placements à la fois (${names}), un domaine qui pèse particulièrement dans ce thème. `
        : "";
    return { house: houseNumber, title: house.name, text: `${intro}${paragraphs}` };
  }

  const cuspSign = signOf(chart.houses.cusps[houseNumber - 1]);
  const cuspSignName = signMap[cuspSign].name;
  const rulerKey = SIGN_RULER[cuspSign];
  const rulerPoint = chart.points[rulerKey];
  const rulerName = planetMap[rulerKey].name;

  // Ne pas se contenter de dire où se trouve le maître de la maison : le
  // lecteur qui n'a jamais fait d'astrologie n'a aucun moyen de deviner ce
  // que "Mercure en Poissons, maison 8" veut dire concrètement. On
  // réutilise donc le même texte détaillé par signe/maison que celui
  // affiché quand la planète occupe directement la maison, pour que la
  // profondeur de lecture soit la même, qu'on lise le maître ou l'occupant.
  let text: string;
  if (locale === "en") {
    let rulerPlace = "";
    if (rulerPoint) {
      const rulerSign = signOf(rulerPoint.longitude);
      const rulerSignText = describePlanetInSign(rulerKey, rulerSign, undefined, locale);
      const rulerHouseText = rulerPoint.house ? describePlanetInHouse(rulerKey, rulerPoint.house, locale) : null;
      rulerPlace = ` In this chart, ${rulerName}, this house's ruler, sits in ${signMap[rulerSign].name}${
        rulerPoint.house ? `, house ${rulerPoint.house}` : ""
      }: that placement is where this domain's real story actually plays out. Concretely, here's what that means: ${rulerSignText}${
        rulerHouseText ? ` ${rulerHouseText}` : ""
      }`;
    }
    text = `${house.name} holds no planet of its own: this domain is read indirectly, through ${cuspSignName} on its cusp (${house.keyword}) and through its ruler, ${rulerName}.${rulerPlace}`;
  } else {
    let rulerPlace = "";
    if (rulerPoint) {
      const rulerSign = signOf(rulerPoint.longitude);
      const rulerSignText = describePlanetInSign(rulerKey, rulerSign, undefined, locale);
      const rulerHouseText = rulerPoint.house ? describePlanetInHouse(rulerKey, rulerPoint.house, locale) : null;
      rulerPlace = ` Dans ce thème, ${frArticle(rulerKey, rulerName)}${rulerName}, maître de cette maison, se trouve en ${signMap[rulerSign].name}${
        rulerPoint.house ? `, maison ${rulerPoint.house}` : ""
      } : c'est là que se joue concrètement l'histoire réelle de ce domaine. Concrètement, voici ce que ça signifie : ${rulerSignText}${
        rulerHouseText ? ` ${rulerHouseText}` : ""
      }`;
    }
    text = `${house.name} n'abrite aucune planète en propre : ce domaine se lit indirectement, à travers le signe ${cuspSignName} sur sa pointe (${house.keyword}) et à travers ${frArticle(rulerKey, rulerName)}${rulerName}, son maître.${rulerPlace}`;
  }

  return { house: houseNumber, title: house.name, text };
}

/**
 * Parcourt les 12 maisons une à une pour que la synthèse couvre tout le
 * thème, domaine de vie par domaine de vie — pas seulement Big 3 et
 * quelques aspects.
 */
function buildLifeDomains(chart: NatalChart, locale: Locale = "fr"): LifeDomainReading[] {
  if (!chart.hasReliableHouses) return [];
  const domains: LifeDomainReading[] = [];
  for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
    domains.push(describeHouseDomain(chart, houseNumber, locale));
  }
  return domains;
}

/**
 * Lecture de synthèse (fonctionnalité Premium) : relie Big 3, dominantes,
 * maître de l'Ascendant, tensions et forces internes en un seul récit,
 * plutôt que de laisser chaque placement isolé à interpréter soi-même.
 */
export function composeChartSynthesis(chart: NatalChart, locale: Locale = "fr"): ChartSynthesis {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;

  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const dominance = computeDominance(chart.points, chart.hasReliableHouses);
  // Une dominante peut être partagée entre plusieurs éléments/modalités à
  // égalité de score : les lister tous plutôt que d'en garder un
  // arbitrairement évite de faire disparaître une vraie égalité.
  const dominantElements = dominance.dominantElements;
  const dominantModalities = dominance.dominantModalities;

  const sunMeta = signMap[big3.sun];
  const moonMeta = signMap[big3.moon];
  const ascMeta = big3.ascendant ? signMap[big3.ascendant] : null;
  const sunElement = SIGN_META[big3.sun].element;
  const moonElement = SIGN_META[big3.moon].element;

  const elementsEnList = dominantElements.map((e) => ELEMENT_NAME_EN[e]);
  const elementsFrList = dominantElements;
  const modalitiesEnList = dominantModalities.map((m) => MODALITY_NAME_EN[m]);
  const primaryModality = dominantModalities[0];

  const overview =
    locale === "en"
      ? `Sun in ${sunMeta.name} ${sunMeta.symbol}, Moon in ${moonMeta.name} ${moonMeta.symbol}${
          ascMeta ? `, Ascendant in ${ascMeta.name} ${ascMeta.symbol}` : ""
        }. ${
          elementsEnList.length > 0
            ? elementsEnList.length > 1
              ? `Your chart is evenly split between ${elementsEnList.join(" and ")} overall, no single one wins outright`
              : `Your chart leans ${elementsEnList[0]} overall`
            : "No single element clearly dominates your chart"
        }${
          modalitiesEnList.length > 0
            ? `, with a ${modalitiesEnList.join("/")} approach to how you act on it`
            : ""
        }, meaning, in practice, ${
          primaryModality === "Cardinal"
            ? "you tend to initiate and set things in motion rather than wait for the right moment"
            : primaryModality === "Fixe"
              ? "you tend to hold your course once committed, more than jump between directions"
              : "you tend to adjust fluidly to context rather than impose a fixed plan"
        }.`
      : `Soleil en ${sunMeta.name} ${sunMeta.symbol}, Lune en ${moonMeta.name} ${moonMeta.symbol}${
          ascMeta ? `, Ascendant en ${ascMeta.name} ${ascMeta.symbol}` : ""
        }. ${
          elementsFrList.length > 0
            ? elementsFrList.length > 1
              ? `Votre thème est partagé à égalité entre ${elementsFrList.join(" et ")}, aucun des deux ne l'emporte franchement`
              : `Votre thème penche globalement du côté ${elementsFrList[0] === "Air" || elementsFrList[0] === "Eau" ? "de l'" : "du "}${elementsFrList[0]}`
            : "Aucun élément ne domine nettement votre thème"
        }${
          dominantModalities.length > 0 ? `, avec une approche ${dominantModalities.join("/")} de la façon dont vous agissez dessus` : ""
        }, concrètement, ${
          primaryModality === "Cardinal"
            ? "vous avez tendance à lancer les choses et à initier plutôt qu'à attendre le bon moment"
            : primaryModality === "Fixe"
              ? "vous avez tendance à tenir le cap une fois engagé·e, plus qu'à changer souvent de direction"
              : "vous avez tendance à vous ajuster avec fluidité au contexte plutôt qu'à imposer un plan fixe"
        }.`;

  let ascendantRulerIntro: string | null = null;
  let ascendantRulerSign: string | null = null;
  let ascendantRulerHouse: string | null = null;

  if (big3.ascendant && dominance.ascendantRuler && chart.points[dominance.ascendantRuler]) {
    const ruler = dominance.ascendantRuler;
    const rulerPlanet = planetMap[ruler];
    const rulerPoint = chart.points[ruler]!;
    const rulerSign = signOf(rulerPoint.longitude);

    ascendantRulerIntro =
      locale === "en"
        ? `Your Ascendant is in ${ascMeta!.name}, traditionally ruled by ${rulerPlanet.name} ${rulerPlanet.symbol}. In astrology this "chart ruler" is treated as the guide of the whole chart: its own sign and house color HOW you actually go about embodying the persona your rising sign presents to the world.`
        : `Votre Ascendant est en ${ascMeta!.name}, traditionnellement gouverné par ${rulerPlanet.name} ${rulerPlanet.symbol}. Ce "maître de l'Ascendant" est considéré en astrologie comme le guide de l'ensemble du thème : son propre signe et sa maison colorent la façon dont vous incarnez concrètement le personnage que votre signe ascendant présente au monde.`;

    ascendantRulerSign = describePlanetInSign(ruler, rulerSign, undefined, locale);
    ascendantRulerHouse = rulerPoint.house ? describePlanetInHouse(ruler, rulerPoint.house, locale) : null;
  }

  const contradictions: string[] = [];
  const strengths: string[] = [];

  if (sunElement !== moonElement) {
    const isFriction = ELEMENT_FRICTION_PAIRS.some(
      ([a, b]) => (a === sunElement && b === moonElement) || (a === moonElement && b === sunElement)
    );
    if (isFriction) {
      const kw = ELEMENT_KEYWORD[locale];
      contradictions.push(
        locale === "en"
          ? `Your conscious identity (Sun in ${sunMeta.name}, ${ELEMENT_NAME_EN[sunElement]}) and your emotional world (Moon in ${moonMeta.name}, ${ELEMENT_NAME_EN[moonElement]}) pull in different directions: one runs on ${kw[sunElement]}, the other on ${kw[moonElement]}. Expect a real, ongoing negotiation between what you consciously want and what you actually feel, not a flaw, just two different operating systems sharing one person.`
          : `Votre identité consciente (Soleil en ${sunMeta.name}, ${sunElement}) et votre monde émotionnel (Lune en ${moonMeta.name}, ${moonElement}) tirent dans des directions différentes : l'un fonctionne à ${kw[sunElement]}, l'autre à ${kw[moonElement]}. Attendez-vous à une vraie négociation permanente entre ce que vous voulez consciemment et ce que vous ressentez réellement, ce n'est pas un défaut, juste deux logiques différentes qui partagent la même personne.`
      );
    }
  }

  // Un aspect entre deux planètes lentes (ex. Uranus-Neptune) marque surtout
  // une génération entière plutôt que la personne — on ne garde donc que les
  // aspects touchant au moins un point personnel ou un angle.
  const keyAspects = computeAspects(chart.points, SYNTHESIS_POINTS)
    .filter((a) => PERSONAL_AND_ANGLES.includes(a.a) || PERSONAL_AND_ANGLES.includes(a.b))
    .sort((a, b) => Math.abs(a.exact) - Math.abs(b.exact));

  const tense = keyAspects.filter((a) => TENSE_ASPECT_KEYS.includes(a.aspect)).slice(0, 4);
  for (const a of tense) {
    contradictions.push(describeAspect(a, "natal", undefined, locale));
  }

  const flowing = keyAspects.filter((a) => FLOWING_ASPECT_KEYS.includes(a.aspect)).slice(0, 4);
  for (const a of flowing) {
    strengths.push(describeAspect(a, "natal", undefined, locale));
  }

  const lifeDomains = buildLifeDomains(chart, locale);

  return {
    overview,
    ascendantRulerIntro,
    ascendantRulerSign,
    ascendantRulerHouse,
    contradictions,
    strengths,
    lifeDomains,
  };
}
