import { ZODIAC_SIGNS } from "../types";
import type { Aspect, AspectKey, HouseCusps, PointKey, ZodiacSign } from "../types";
import type { SynastryAspect } from "../synastry";
import type { TransitAspect } from "../transits";
import type { ActivatedSynastryAspect } from "../synastry-transits";
import { PLANET_META, PLANET_GENDER_FR } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { HOUSE_META } from "./houses";
import { HOUSE_META_EN } from "./houses.en";
import { PLANET_IN_SIGN } from "./planet-in-sign";
import { PLANET_IN_SIGN_EN } from "./planet-in-sign.en";
import { PLANET_IN_HOUSE } from "./planet-in-house";
import { PLANET_IN_HOUSE_EN } from "./planet-in-house.en";
import { ASPECT_META } from "./aspects";
import { ASPECT_META_EN } from "./aspects.en";
import { ASTROCARTO_TEXT, LINE_TYPE_META } from "./astrocartography-content";
import type { LineTypeKey } from "./astrocartography-content";
import { ASTROCARTO_TEXT_EN, LINE_TYPE_META_EN } from "./astrocartography-content.en";
import { getPairTheme, isRomanticCodedPair } from "./pair-themes";
import { getPairThemeEn } from "./pair-themes.en";
import { TRANSIT_MANIFESTATIONS } from "./transit-manifestations";
import { TRANSIT_MANIFESTATIONS_EN } from "./transit-manifestations.en";
import { TRANSIT_MANIFESTATIONS_SYNASTRY } from "./transit-manifestations-synastry";
import { TRANSIT_MANIFESTATIONS_SYNASTRY_EN } from "./transit-manifestations-synastry.en";
import { TRANSIT_MANIFESTATIONS_COMPOSITE } from "./transit-manifestations-composite";
import { TRANSIT_MANIFESTATIONS_COMPOSITE_EN } from "./transit-manifestations-composite.en";
import { computeDegreeReading, DECAN_RULER_TO_POINT_KEY, DECAN_RULER_DOMICILE_SIGNS } from "../degrees";
import { signOf } from "../signs";
import type { RelationshipType } from "./relationship";

export type Locale = "fr" | "en";

const GENERATIONAL_POINTS = new Set<PointKey>(["uranus", "neptune", "pluto"]);

// Article défini français accordé (le/la/l'), utilisé partout où un nom de
// point est inséré dans une phrase — évite de coder "le" en dur devant des
// points féminins (Lune, Vénus, Part de Fortune) ou masculins à voyelle
// initiale (Ascendant, Uranus).
export function frArticle(point: PointKey, name: string): string {
  if (/^[aeiouyàâäéèêëîïôöùûü]/i.test(name)) return "l'";
  return PLANET_GENDER_FR[point] === "f" ? "la " : "le ";
}

export function frArticleCap(point: PointKey, name: string): string {
  const article = frArticle(point, name);
  return article.charAt(0).toUpperCase() + article.slice(1);
}

// Placements dont le texte personnalisé est formulé en langage de couple
// (désir, séduction, attachement amoureux) — Vénus dans son ensemble, plus
// le Mars en Scorpion qui mentionne explicitement l'énergie sexuelle. À
// éviter pour interpréter le thème composite d'une relation non romantique
// (le composite existe aussi pour la famille, l'amitié, le professionnel).
const ROMANTIC_CODED_PLANET_IN_SIGN: Partial<Record<PointKey, true | Set<ZodiacSign>>> = {
  venus: true,
  mars: new Set(["scorpion"]),
};

function isRomanticCodedPlanetInSign(point: PointKey, sign: ZodiacSign): boolean {
  const flagged = ROMANTIC_CODED_PLANET_IN_SIGN[point];
  if (!flagged) return false;
  return flagged === true || flagged.has(sign);
}

export function describePlanetInSign(
  point: PointKey,
  sign: ZodiacSign,
  relationshipType?: RelationshipType,
  locale: Locale = "fr"
): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const customMap = locale === "en" ? PLANET_IN_SIGN_EN : PLANET_IN_SIGN;
  const planet = planetMap[point];
  const suppressRomantic =
    relationshipType !== undefined && relationshipType !== "romantique" && isRomanticCodedPlanetInSign(point, sign);
  const custom = suppressRomantic ? undefined : customMap[point]?.[sign];
  const signMeta = signMap[sign];

  // Uranus/Neptune/Pluton restent des années (voire des décennies) dans le
  // même signe : même avec un texte dédié par signe, ce placement marque
  // surtout une génération — la nuance vraiment personnelle se lit dans la
  // maison et les aspects. On le rappelle dans tous les cas, y compris
  // quand un texte dédié existe (custom), pour ne jamais laisser croire
  // qu'un signe seul dit tout de ce placement.
  const generationalSuffix = !GENERATIONAL_POINTS.has(point)
    ? ""
    : locale === "en"
      ? ` Since ${planet.name} stays for years (even decades) in the same sign, this placement marks an entire generation rather than a strictly personal trait: what's truly yours plays out mainly through its house and aspects, read below.`
      : ` ${planet.name} restant des années (voire des décennies) dans le même signe, ce placement marque toute une génération plutôt qu'un trait strictement personnel : ce qui vous est propre se joue surtout dans sa maison et ses aspects, à lire ci-dessous.`;

  if (custom) return `${custom}${generationalSuffix}`;

  if (locale === "en") {
    const base = `${planet.name} expresses here ${planet.keyword}, colored by the ${signMeta.name} tone (${signMeta.keyword}). ${signMeta.paragraph}`;
    return `${base}${generationalSuffix}`;
  }

  const base = `${planet.name} exprime ici ${planet.keyword}, teinté${
    PLANET_GENDER_FR[point] === "f" ? "e" : ""
  } par la tonalité ${signMeta.name} (${signMeta.keyword}). ${signMeta.paragraph}`;
  return `${base}${generationalSuffix}`;
}

/**
 * Où se trouve, dans le thème réel de la personne, la planète qui gouverne
 * ce décan — pour ancrer la lecture dans SON thème plutôt que dans une
 * généralité valable pour tout le monde né avec le même décan. `chartPoints`
 * est optionnel : sans lui (ex. pages SEO génériques sans thème réel), la
 * phrase est simplement omise.
 */
function rulerConnectionText(
  decanRuler: ReturnType<typeof computeDegreeReading>["decanRuler"],
  chartPoints: Partial<Record<PointKey, { longitude: number; house?: number }>> | undefined,
  locale: Locale
): string {
  if (!chartPoints) return "";
  const rulerKey = DECAN_RULER_TO_POINT_KEY[decanRuler];
  const rulerPoint = chartPoints[rulerKey];
  if (!rulerPoint) return "";

  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const rulerSign = signOf(rulerPoint.longitude);
  const rulerName = planetMap[rulerKey].name;
  const signName = signMap[rulerSign].name;
  const isDomicile = DECAN_RULER_DOMICILE_SIGNS[decanRuler].includes(rulerSign);

  if (locale === "en") {
    const housePart = rulerPoint.house ? ` (house ${rulerPoint.house})` : "";
    const domicilePart = isDomicile
      ? " It's even in one of its own signs there, which reinforces this coloring further."
      : "";
    return ` This decan's ruler, ${rulerName}, sits in ${signName}${housePart} in your own chart — worth reading alongside this one to see how that influence actually plays out for you.${domicilePart}`;
  }
  const housePart = rulerPoint.house ? ` (maison ${rulerPoint.house})` : "";
  const domicilePart = isDomicile
    ? " Il y est d'ailleurs chez lui (dans l'un de ses propres signes), ce qui renforce encore cette coloration."
    : "";
  return ` Le maître de ce décan, ${rulerName}, se trouve lui-même en ${signName}${housePart} dans votre thème — un point qui vaut la peine d'être lu en écho de celui-ci pour voir comment cette influence se vit concrètement chez vous.${domicilePart}`;
}

/**
 * Lecture du degré exact (décan, phase précoce/médiane/tardive, degré
 * anarétique ou critique). `chartPoints` (optionnel) permet d'ajouter où se
 * trouve réellement le maître du décan dans le thème de la personne — voir
 * rulerConnectionText.
 */
export function describeDegree(
  longitude: number,
  locale: Locale = "fr",
  chartPoints?: Partial<Record<PointKey, { longitude: number; house?: number }>>
): string {
  const r = computeDegreeReading(longitude, locale);
  const parts = [r.decanText + rulerConnectionText(r.decanRuler, chartPoints, locale), r.phaseText];
  if (r.isAnaretic) parts.push(r.anareticText!);
  if (r.isCritical) parts.push(r.criticalText!);
  return parts.join(" ");
}

export function describePlanetInHouse(point: PointKey, houseNumber: number, locale: Locale = "fr"): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const customMap = locale === "en" ? PLANET_IN_HOUSE_EN : PLANET_IN_HOUSE;
  const planet = planetMap[point];
  const house = houseList[houseNumber - 1];
  if (!house) return "";

  const custom = customMap[point]?.[houseNumber];
  if (custom) return custom;

  if (locale === "en") {
    return `${planet.name} in ${house.name}: this energy (${planet.essence}) expresses itself above all through ${house.keyword}. ${house.paragraph}`;
  }
  return `${planet.name} en ${house.name} : cette énergie (${planet.essence}) s'exprime avant tout à travers ${house.keyword}. ${house.paragraph}`;
}

// Contraction de "de" + un groupe nominal français commençant par un article
// défini (le/la/l'/les) — évite les "de les" ou "de le" mal formés quand un
// keyword de maison/planète (qui inclut déjà son propre article) est inséré
// après "de" dans une phrase composée.
function deContract(phrase: string): string {
  if (/^les /i.test(phrase)) return `des ${phrase.slice(4)}`;
  if (/^le /i.test(phrase)) return `du ${phrase.slice(3)}`;
  return `de ${phrase}`;
}

// Contraction de "à" + "le"/"les" en "au"/"aux" quand un connecteur
// d'aspect se termine par "à" (ex. "se superpose à", "peine à s'ajuster à")
// et que l'objet qui suit porte un article généré par frArticle — évite les
// "se superpose à le Nœud Nord" mal formés. "la"/"l'" ne contractent pas et
// restent inchangés ; les connecteurs qui ne se terminent pas par "à"
// (contre/avec/etc.) n'ont de toute façon rien à contracter.
function joinConnector(connector: string, articledObject: string): string {
  if (connector.endsWith("à")) {
    if (articledObject.startsWith("le ")) return `${connector.slice(0, -1)}au ${articledObject.slice(3)}`;
    if (articledObject.startsWith("les ")) return `${connector.slice(0, -1)}aux ${articledObject.slice(4)}`;
  }
  return `${connector} ${articledObject}`;
}

/**
 * Signification, en synastrie, du fait que la planète de l'une des deux
 * personnes ("guest") tombe dans une maison natale de l'autre ("host").
 * Contrairement au simple mot-clé affiché auparavant, cette fonction relie
 * la planète invitée au thème de vie complet de la maison d'accueil
 * (réutilise HOUSE_META.paragraph, déjà écrit pour ça) pour que le lecteur
 * comprenne concrètement ce que ce recouvrement change au quotidien.
 */
export function describeHouseOverlay(
  point: PointKey,
  houseNumber: number,
  guestLabel: string,
  hostLabel: string,
  locale: Locale = "fr"
): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const planet = planetMap[point];
  const house = houseList[houseNumber - 1];
  if (!house) return "";

  if (locale === "en") {
    return `${guestLabel}'s ${planet.name} falls in ${hostLabel}'s house ${houseNumber} (${house.name}): ${guestLabel} tends to bring ${planet.keyword} into ${hostLabel}'s everyday experience of ${house.keyword}. ${house.paragraph}`;
  }
  return `${planet.name} de ${guestLabel} tombe dans la maison ${houseNumber} de ${hostLabel} (${house.name}) : ${guestLabel} a tendance à apporter ${planet.keyword} dans le quotidien ${deContract(house.keyword)} chez ${hostLabel}. ${house.paragraph}`;
}

export function describeAspect(
  aspect: Aspect | SynastryAspect,
  context: "natal" | "synastry" | "composite" = "natal",
  relationshipType?: RelationshipType,
  locale: Locale = "fr"
): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const meta = aspectMap[aspect.aspect as AspectKey];
  const keyA = "a" in aspect ? aspect.a : aspect.personA;
  const keyB = "b" in aspect ? aspect.b : aspect.personB;
  const nameA = planetMap[keyA]?.name ?? keyA;
  const nameB = planetMap[keyB]?.name ?? keyB;
  const gap = Math.abs(aspect.exact).toFixed(1);

  // Les thèmes de fond formulés en langage de couple (désir, séduction,
  // attachement amoureux) n'ont rien à faire dans une lecture famille,
  // amitié ou professionnelle — on ne les affiche qu'en lecture natale
  // (auto-description) ou en cadrage romantique.
  const suppressRomantic =
    context !== "natal" && relationshipType !== undefined && relationshipType !== "romantique" && isRomanticCodedPair(keyA, keyB);

  if (locale === "en") {
    const subjectA = context === "synastry" ? `The first person's ${nameA}` : nameA;
    const objectB = context === "synastry" ? `the second person's ${nameB}` : nameB;
    const relationSuffix = context === "composite" ? ", in your relationship's composite chart" : "";
    const pairTheme = suppressRomantic ? undefined : getPairThemeEn(keyA, keyB);
    const themeSentence = pairTheme ? ` Underlying theme: ${pairTheme}` : "";
    const nameLower = meta.name.toLowerCase();
    const article = /^[aeiou]/i.test(nameLower) ? "an" : "a";
    return `${subjectA} ${meta.transitConnector} ${objectB}${relationSuffix} (gap to exact: ${gap}°) — what astrologers call ${article} ${nameLower} (${meta.symbol}). ${meta.description}${themeSentence}`;
  }

  const subjectA =
    context === "synastry"
      ? `${frArticleCap(keyA, nameA)}${nameA} de la première personne`
      : `${frArticleCap(keyA, nameA)}${nameA}`;
  const objectB =
    context === "synastry" ? `${frArticle(keyB, nameB)}${nameB} de la seconde` : `${frArticle(keyB, nameB)}${nameB}`;
  const relationSuffix = context === "composite" ? ", dans le thème composite de votre relation" : "";

  const pairTheme = suppressRomantic ? undefined : getPairTheme(keyA, keyB);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";
  const article = meta.genderFr === "f" ? "une" : "un";

  return `${subjectA} ${joinConnector(meta.transitConnector, objectB)}${relationSuffix} (écart à l'exact : ${gap}°) — ce que les astrologues appellent ${article} ${meta.name.toLowerCase()} (${meta.symbol}). ${meta.description}${themeSentence}`;
}

/**
 * Aspect entre une planète en transit (aujourd'hui) et un point du thème
 * natal. `omitOrb` retire la précision technique en degrés (utile pour
 * l'e-mail quotidien, un contexte sans autre repère pour l'interpréter —
 * gardée par défaut sur la page transits, où elle voisine avec le détail
 * des positions).
 */
export function describeTransitAspect(aspect: TransitAspect, locale: Locale = "fr", omitOrb = false): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const meta = aspectMap[aspect.aspect];
  const transitName = planetMap[aspect.transitingPlanet].name;
  const natalName = planetMap[aspect.natalPoint]?.name ?? aspect.natalPoint;
  const gap = Math.abs(aspect.exact).toFixed(1);

  if (locale === "en") {
    const timing = aspect.applying
      ? "The aspect is tightening: its influence is building over the coming days."
      : "The aspect is loosening: its influence was stronger a few days ago and is now fading.";
    const pairTheme = getPairThemeEn(aspect.transitingPlanet, aspect.natalPoint);
    const themeSentence = pairTheme ? ` Underlying theme: ${pairTheme}` : "";
    const orbClause = omitOrb ? "" : ` (orb: ${gap}°)`;
    const nameLower = meta.name.toLowerCase();
    const article = /^[aeiou]/i.test(nameLower) ? "an" : "a";
    const manifestation = TRANSIT_MANIFESTATIONS_EN[aspect.transitingPlanet]?.[meta.tone];
    const manifestationSentence = manifestation ? ` Concretely, this can look like: ${manifestation}` : "";
    return `Transiting ${transitName} ${meta.transitConnector} your natal ${natalName}${orbClause} — what astrologers call ${article} ${nameLower} (${meta.symbol}). ${meta.description}${themeSentence} ${timing}${manifestationSentence}`;
  }

  const timing = aspect.applying
    ? "L'aspect se resserre : son influence monte en puissance dans les prochains jours."
    : "L'aspect se relâche : son influence était plus forte il y a quelques jours et s'estompe désormais.";

  const pairTheme = getPairTheme(aspect.transitingPlanet, aspect.natalPoint);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";

  const orbClause = omitOrb ? "" : ` (écart à l'exact : ${gap}°)`;
  const article = meta.genderFr === "f" ? "une" : "un";
  const manifestation = TRANSIT_MANIFESTATIONS[aspect.transitingPlanet]?.[meta.tone];
  const manifestationSentence = manifestation ? ` Concrètement, ça peut se traduire par : ${manifestation}` : "";
  return `${transitName} en transit ${meta.transitConnector} votre ${natalName} natal${
    PLANET_GENDER_FR[aspect.natalPoint] === "f" ? "e" : ""
  }${orbClause} — ce que les astrologues appellent ${article} ${meta.name.toLowerCase()} (${meta.symbol}). ${meta.description}${themeSentence} ${timing}${manifestationSentence}`;
}

/** Aspect entre une planète en transit (aujourd'hui) et un point du thème composite d'un couple. */
export function describeCompositeTransitAspect(aspect: TransitAspect, locale: Locale = "fr"): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const meta = aspectMap[aspect.aspect];
  const transitName = planetMap[aspect.transitingPlanet].name;
  const compositeName = planetMap[aspect.natalPoint]?.name ?? aspect.natalPoint;
  const gap = Math.abs(aspect.exact).toFixed(1);

  // Le thème composite existe pour tout type de relation (famille, amitié,
  // pro, pas seulement les couples) et cette fonction n'a pas connaissance
  // du cadrage choisi : on écarte par prudence les thèmes de fond formulés
  // en langage de couple plutôt que de risquer d'en afficher un à tort.
  const suppressRomantic = isRomanticCodedPair(aspect.transitingPlanet, aspect.natalPoint);

  if (locale === "en") {
    const timing = aspect.applying
      ? "The aspect is tightening: its influence is building over the coming days for the relationship."
      : "The aspect is loosening: its influence was stronger a few days ago and is now fading.";
    const pairTheme = suppressRomantic ? undefined : getPairThemeEn(aspect.transitingPlanet, aspect.natalPoint);
    const themeSentence = pairTheme ? ` Underlying theme: ${pairTheme}` : "";
    const nameLower = meta.name.toLowerCase();
    const article = /^[aeiou]/i.test(nameLower) ? "an" : "a";
    const manifestation = TRANSIT_MANIFESTATIONS_COMPOSITE_EN[aspect.transitingPlanet]?.[meta.tone];
    const manifestationSentence = manifestation ? ` Concretely, for the relationship this can look like: ${manifestation}` : "";
    return `Transiting ${transitName} ${meta.transitConnector} the ${compositeName} of your relationship's composite chart (orb: ${gap}°) — what astrologers call ${article} ${nameLower} (${meta.symbol}). ${meta.description}${themeSentence} ${timing}${manifestationSentence}`;
  }

  const timing = aspect.applying
    ? "L'aspect se resserre : son influence monte en puissance dans les prochains jours pour la relation."
    : "L'aspect se relâche : son influence était plus forte il y a quelques jours et s'estompe désormais.";
  const pairTheme = suppressRomantic ? undefined : getPairTheme(aspect.transitingPlanet, aspect.natalPoint);
  const themeSentence = pairTheme ? ` Thème de fond : ${pairTheme}` : "";
  const article = meta.genderFr === "f" ? "une" : "un";
  const manifestation = TRANSIT_MANIFESTATIONS_COMPOSITE[aspect.transitingPlanet]?.[meta.tone];
  const manifestationSentence = manifestation ? ` Concrètement, pour la relation, ça peut se traduire par : ${manifestation}` : "";

  const compositeObject = `${frArticle(aspect.natalPoint, compositeName)}${compositeName}`;
  return `${transitName} en transit ${joinConnector(meta.transitConnector, compositeObject)} du thème composite de votre relation (écart à l'exact : ${gap}°) — ce que les astrologues appellent ${article} ${meta.name.toLowerCase()} (${meta.symbol}). ${meta.description}${themeSentence} ${timing}${manifestationSentence}`;
}

/** Aspect de synastrie réactivé aujourd'hui par un transit sur le point natal de l'un des deux partenaires. */
export function describeActivatedSynastryAspect(
  activated: ActivatedSynastryAspect,
  labelA: string,
  labelB: string,
  locale: Locale = "fr"
): string {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const { synastryAspect, transit, side } = activated;
  const personLabel = side === "A" ? labelA : labelB;
  const partnerLabel = side === "A" ? labelB : labelA;
  const personPoint = side === "A" ? synastryAspect.personA : synastryAspect.personB;
  const partnerPoint = side === "A" ? synastryAspect.personB : synastryAspect.personA;
  const personName = planetMap[personPoint]?.name ?? personPoint;
  const partnerName = planetMap[partnerPoint]?.name ?? partnerPoint;

  const synMeta = aspectMap[synastryAspect.aspect];
  const transitMeta = aspectMap[transit.aspect];
  const transitPlanetName = planetMap[transit.transitingPlanet].name;
  const gap = Math.abs(transit.exact).toFixed(1);

  // Même prudence que pour le composite : cette fonction ne sait pas si le
  // lien est romantique, familial, amical ou professionnel.
  const suppressRomantic = isRomanticCodedPair(personPoint, partnerPoint);

  if (locale === "en") {
    const pairTheme = suppressRomantic ? undefined : getPairThemeEn(personPoint, partnerPoint);
    const themeSentence = pairTheme ? ` Underlying theme of the bond: ${pairTheme}` : "";
    const manifestation = TRANSIT_MANIFESTATIONS_SYNASTRY_EN[transit.transitingPlanet]?.[transitMeta.tone];
    const manifestationSentence = manifestation
      ? ` Concretely, between you two this can look like: ${manifestation}`
      : " This is the moment when this dynamic between you two is most likely to manifest concretely.";
    return `The ${synMeta.name.toLowerCase()} (${synMeta.symbol}) between ${personLabel}'s ${personName} and ${partnerLabel}'s ${partnerName} is switched on today: transiting ${transitPlanetName} ${transitMeta.transitConnector} ${personLabel}'s ${personName} (orb: ${gap}°) — a ${transitMeta.name.toLowerCase()} (${transitMeta.symbol}) in astrological terms.${themeSentence}${manifestationSentence}`;
  }

  const pairTheme = suppressRomantic ? undefined : getPairTheme(personPoint, partnerPoint);
  const themeSentence = pairTheme ? ` Thème de fond du lien : ${pairTheme}` : "";

  const personArticle = frArticle(personPoint, personName);
  const partnerArticle = frArticle(partnerPoint, partnerName);
  const transitArticle = transitMeta.genderFr === "f" ? "une" : "un";
  const manifestation = TRANSIT_MANIFESTATIONS_SYNASTRY[transit.transitingPlanet]?.[transitMeta.tone];
  const manifestationSentence = manifestation
    ? ` Concrètement, entre vous deux, ça peut se traduire par : ${manifestation}`
    : " C'est le moment où cette dynamique entre vous deux a le plus de chances de se manifester concrètement.";
  const personObject = `${personArticle}${personName} de ${personLabel}`;
  return `La dynamique ${synMeta.name.toLowerCase()} (${synMeta.symbol}) entre ${personArticle}${personName} de ${personLabel} et ${partnerArticle}${partnerName} de ${partnerLabel} s'active aujourd'hui : ${transitPlanetName} en transit ${joinConnector(transitMeta.transitConnector, personObject)} (écart à l'exact : ${gap}°) — ${transitArticle} ${transitMeta.name.toLowerCase()} (${transitMeta.symbol}) en langage astrologique.${themeSentence}${manifestationSentence}`;
}

export function describeAstroCartoLine(planet: PointKey, type: LineTypeKey, locale: Locale = "fr"): string {
  const planetMeta = (locale === "en" ? PLANET_META_EN : PLANET_META)[planet];
  const lineMetaMap = locale === "en" ? LINE_TYPE_META_EN : LINE_TYPE_META;
  const textMap = locale === "en" ? ASTROCARTO_TEXT_EN : ASTROCARTO_TEXT;
  const lineMeta = lineMetaMap[type];
  const text = textMap[planet as keyof typeof textMap]?.[type];
  return locale === "en"
    ? `${planetMeta.name} — ${lineMeta.name}: ${text ?? lineMeta.explanation}`
    : `${planetMeta.name} — ${lineMeta.name} : ${text ?? lineMeta.explanation}`;
}

/**
 * Explique pourquoi un pays ressort en tête du classement "meilleurs
 * endroits" pour un thème donné : combien de lignes favorables le
 * traversent réellement, et ce que ce(s) type(s) de ligne gouverne(nt)
 * concrètement (réutilise `LINE_TYPE_META`, déjà écrit pour ça, plutôt que
 * d'inventer un nouveau texte par thème).
 */
export function explainCountryRanking(
  supportingLines: { type: LineTypeKey }[],
  locale: Locale = "fr"
): string {
  const lineMetaMap = locale === "en" ? LINE_TYPE_META_EN : LINE_TYPE_META;
  const count = supportingLines.length;
  const types = Array.from(new Set(supportingLines.map((l) => l.type)));
  const explanations = types.map((t) => lineMetaMap[t].explanation).join(" ");
  const plural = count > 1;

  if (locale === "en") {
    return `${count} line${plural ? "s" : ""} favorable to this theme actually cross${plural ? "" : "es"} this country — the more of them line up here, the more this theme tends to play out concretely. ${explanations}`;
  }
  return `${count} ligne${plural ? "s" : ""} favorable${plural ? "s" : ""} à ce thème traverse${plural ? "nt" : ""} réellement ce pays — plus elles se recoupent ici, plus ce thème a de chances de se concrétiser dans le vécu quotidien. ${explanations}`;
}

export function describeHouseSystem(houses: HouseCusps, locale: Locale = "fr"): string {
  if (locale === "en") {
    const labelsEn: Record<string, string> = {
      "whole-sign": "whole sign",
      equal: "equal houses",
      porphyry: "Porphyry",
      placidus: "Placidus",
    };
    const labelEn = labelsEn[houses.system] ?? houses.system;
    if (houses.fellBackToWholeSign) {
      return `The Placidus system can't be calculated at this latitude (too close to the polar circle): the chart automatically falls back to whole sign houses, a traditional system that's always defined, to stay reliable rather than showing a false precision.`;
    }
    return `House system used: ${labelEn}.`;
  }

  const labels: Record<string, string> = {
    "whole-sign": "signes entiers",
    equal: "maisons égales",
    porphyry: "Porphyre",
    placidus: "Placidus",
  };
  const label = labels[houses.system] ?? houses.system;
  if (houses.fellBackToWholeSign) {
    return `Le système Placidus n'est pas calculable à cette latitude (trop proche du cercle polaire) : le thème utilise automatiquement les signes entiers, un système traditionnel et toujours défini, pour rester fiable plutôt que d'afficher une fausse précision.`;
  }
  return `Système de maisons utilisé : ${label}.`;
}

export function signOfPoint(longitude: number) {
  return signOf(longitude);
}

export function oppositeSign(sign: ZodiacSign): ZodiacSign {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return ZODIAC_SIGNS[(idx + 6) % 12];
}

export function oppositeHouse(house: number): number {
  return ((house + 5) % 12) + 1;
}
