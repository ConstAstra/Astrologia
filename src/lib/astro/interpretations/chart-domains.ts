import type { CompositeChart, EclipticPoint, HouseCusps, NatalChart, PointKey, ZodiacSign } from "../types";
import { computeDominance } from "../dominance";
import { signOf } from "../signs";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { PLANET_META } from "./planets";
import { PLANET_META_EN } from "./planets.en";
import { describePlanetInSign, describePlanetInHouse, type Locale } from "./compose";
import { describeHouseDomain } from "./synthesis";
import { describeCompositeHouseDomain } from "./composite-synthesis";
import type { RelationshipType } from "./relationship";

/**
 * La synthèse "grimoire" : cinq chapitres qui regroupent, par thème de vie
 * (amour, argent, carrière, spiritualité), la même matière que la "Lecture
 * de synthèse" (maisons occupées ou lues via leur maître, positions en
 * signe) plutôt qu'une liste de mots-clés isolée — c'est une synthèse comme
 * les autres, seule sa présentation change (chapitres qu'on feuillette,
 * plutôt qu'un bloc unique). Volontairement sans détail d'aspect (déjà
 * couvert plus bas sur la page, aspect par aspect).
 */
export interface ChartDomains {
  general: string;
  love: string;
  money: string;
  career: string;
  spiritual: string;
}

/**
 * Filet de sécurité final : si une même phrase venait à réapparaître mot
 * pour mot, dans le même chapitre ou dans un autre (ex. la synastrie, quand
 * plusieurs planètes d'une même personne tombent dans la même maison de
 * l'autre, partage une phrase de clôture identique pour chacune ; ou le
 * repli sans heure de naissance connue, où Saturne peut légitimement
 * apparaître à la fois dans "Argent" et "Carrière"), on ne la garde qu'à sa
 * toute première occurrence dans la lecture plutôt que de la répéter.
 * `seen` est partagé entre tous les appels d'un même thème (voir
 * dedupeChartDomains) pour que la déduplication joue aussi entre chapitres.
 */
export function dedupeSentences(text: string, seen: Set<string> = new Set()): string {
  // Chaque chapitre est composé de paragraphes séparés par une ligne vide
  // (voir chart-domains.ts et consorts) : la déduplication doit préserver
  // ces coupures plutôt que tout rejoindre par un simple espace, sans quoi
  // le découpage en paragraphes du grimoire disparaîtrait silencieusement à
  // cette étape.
  const paragraphs = text.split(/\n{2,}/);
  const keptParagraphs: string[] = [];
  for (const paragraph of paragraphs) {
    const parts = paragraph.split(/(?<=[.!?])\s+/);
    const kept: string[] = [];
    for (const part of parts) {
      const key = part.trim();
      if (key.length > 20) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      kept.push(part);
    }
    const joined = kept.join(" ").trim();
    if (joined) keptParagraphs.push(joined);
  }
  return keptParagraphs.join("\n\n");
}

export function dedupeChartDomains(domains: ChartDomains): ChartDomains {
  const seen = new Set<string>();
  return {
    general: dedupeSentences(domains.general, seen),
    love: dedupeSentences(domains.love, seen),
    money: dedupeSentences(domains.money, seen),
    career: dedupeSentences(domains.career, seen),
    spiritual: dedupeSentences(domains.spiritual, seen),
  };
}

export interface Signals {
  sun: ZodiacSign;
  moon: ZodiacSign;
  asc: ZodiacSign | null;
  mc: ZodiacSign | null;
  mercury: ZodiacSign | null;
  venus: ZodiacSign | null;
  mars: ZodiacSign | null;
  jupiter: ZodiacSign | null;
  saturn: ZodiacSign | null;
  neptune: ZodiacSign | null;
  northNode: ZodiacSign | null;
  dominantElements: string[];
  dominantModalities: string[];
  hasReliableHouses: boolean;
  house2: ZodiacSign | null;
  house5: ZodiacSign | null;
  house7: ZodiacSign | null;
  house8: ZodiacSign | null;
  house10: ZodiacSign | null;
  house12: ZodiacSign | null;
  ascendantRulerKey: PointKey | null;
  ascendantRulerSign: ZodiacSign | null;
  ascendantRulerHouse: number | null;
}

function pointSign(points: Partial<Record<PointKey, EclipticPoint>>, key: PointKey): ZodiacSign | null {
  const p = points[key];
  return p ? signOf(p.longitude) : null;
}

export function gatherSignals(
  points: Partial<Record<PointKey, EclipticPoint>>,
  houses: HouseCusps,
  hasReliableHouses: boolean
): Signals {
  const dominance = computeDominance(points, hasReliableHouses);
  const cuspSign = (houseNumber: number) => (hasReliableHouses ? signOf(houses.cusps[houseNumber - 1]) : null);
  const ascendantRulerKey = dominance.ascendantRuler;
  const ascendantRulerPoint = ascendantRulerKey ? points[ascendantRulerKey] : undefined;

  return {
    sun: signOf(points.sun!.longitude),
    moon: signOf(points.moon!.longitude),
    asc: hasReliableHouses ? pointSign(points, "asc") : null,
    mc: hasReliableHouses ? pointSign(points, "mc") : null,
    mercury: pointSign(points, "mercury"),
    venus: pointSign(points, "venus"),
    mars: pointSign(points, "mars"),
    jupiter: pointSign(points, "jupiter"),
    saturn: pointSign(points, "saturn"),
    neptune: pointSign(points, "neptune"),
    northNode: pointSign(points, "northNode"),
    dominantElements: dominance.dominantElements,
    dominantModalities: dominance.dominantModalities,
    hasReliableHouses,
    house2: cuspSign(2),
    house5: cuspSign(5),
    house7: cuspSign(7),
    house8: cuspSign(8),
    house10: cuspSign(10),
    house12: cuspSign(12),
    ascendantRulerKey: ascendantRulerPoint ? ascendantRulerKey : null,
    ascendantRulerSign: ascendantRulerPoint ? signOf(ascendantRulerPoint.longitude) : null,
    ascendantRulerHouse: ascendantRulerPoint?.house ?? null,
  };
}

export function sn(sign: ZodiacSign, locale: Locale) {
  const m = locale === "en" ? SIGN_META_EN : SIGN_META;
  return m[sign].name;
}
export function sk(sign: ZodiacSign, locale: Locale) {
  const m = locale === "en" ? SIGN_META_EN : SIGN_META;
  return m[sign].keyword;
}
export function pn(key: PointKey, locale: Locale) {
  const m = locale === "en" ? PLANET_META_EN : PLANET_META;
  return m[key].name;
}
const ELEMENT_NAME_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

// Glose courte accolée au nom de l'élément la première fois qu'il apparaît
// dans un chapitre : sans elle, "Terre et Eau se partagent la première
// place" ne veut rien dire pour qui ne connaît pas déjà le vocabulaire —
// un mot d'astro ne doit jamais rester posé sans expliquer, en quelques
// mots, ce qu'il recouvre concrètement.
const ELEMENT_GLOSS: Record<string, string> = {
  Feu: "l'élan, l'envie d'agir",
  Terre: "le concret, ce qui se construit pas à pas",
  Air: "les idées, l'échange",
  Eau: "le ressenti, l'intuition",
};
const ELEMENT_GLOSS_EN: Record<string, string> = {
  Feu: "drive, the urge to act",
  Terre: "the concrete, what gets built step by step",
  Air: "ideas, exchange",
  Eau: "feeling, intuition",
};

const ELEMENT_FRICTION_PAIRS: [string, string][] = [
  ["Feu", "Eau"],
  ["Terre", "Air"],
];

export type ElementRelation = "same" | "friction" | "flow";

/**
 * Compare deux signes sur l'axe des éléments : "same" (même élément, les
 * deux logiques tournent au même carburant), "friction" (Feu/Eau ou
 * Terre/Air, les paires classiquement antagonistes, cf. dominance.ts),
 * "flow" (éléments différents mais compatibles). Sert de base à toute
 * lecture de nuance entre deux placements précis, plutôt que d'affirmer
 * une tension générique valable pour n'importe quel thème.
 */
export function elementRelation(signA: ZodiacSign, signB: ZodiacSign): ElementRelation {
  const eA = SIGN_META[signA].element;
  const eB = SIGN_META[signB].element;
  if (eA === eB) return "same";
  const isFriction = ELEMENT_FRICTION_PAIRS.some(([a, b]) => (a === eA && b === eB) || (a === eB && b === eA));
  return isFriction ? "friction" : "flow";
}

/**
 * Phrase de nuance réutilisable : `roleA`/`roleB` décrivent, dans le
 * vocabulaire du domaine concerné (amour, argent...), ce que chaque
 * placement représente concrètement (ex. "Ce qui vous attire" / "la façon
 * dont vous le poursuivez"), pour que la nuance reste ancrée dans les deux
 * signes réels du thème plutôt que dans une généralité interchangeable
 * d'un thème à l'autre. `roleA` doit être fourni déjà en début de phrase
 * (majuscule), `roleB` en milieu de phrase (minuscule). Vient toujours en
 * clôture d'un chapitre, après l'explication détaillée, jamais à sa place.
 */
export function elementNuance(signA: ZodiacSign, signB: ZodiacSign, roleA: string, roleB: string, locale: Locale): string {
  const rel = elementRelation(signA, signB);
  if (locale === "en") {
    if (rel === "same") return `${roleA} and ${roleB} run on the same fuel here, a rare kind of ease.`;
    if (rel === "friction") return `${roleA} and ${roleB} pull in different directions, a real, recurring negotiation rather than a flaw.`;
    return `${roleA} and ${roleB} don't clash, but they don't speak quite the same language either, two logics that usually find a way to cooperate.`;
  }
  if (rel === "same") return `${roleA} et ${roleB} fonctionnent au même carburant ici, une forme de facilité assez rare.`;
  if (rel === "friction") return `${roleA} et ${roleB} tirent dans des directions différentes, une vraie négociation récurrente, pas un défaut.`;
  return `${roleA} et ${roleB} ne se télescopent pas, mais ne parlent pas non plus tout à fait la même langue, deux logiques qui trouvent en général le moyen de coopérer.`;
}

export function dominanceClause(s: Signals, locale: Locale): string {
  const el = s.dominantElements;
  const mod = s.dominantModalities[0];
  if (locale === "en") {
    const elText =
      el.length === 0
        ? "no single element dominates"
        : el.length > 1
          ? `${el.map((e) => `${ELEMENT_NAME_EN[e]} (${ELEMENT_GLOSS_EN[e]})`).join(" and ")} share the lead`
          : `${ELEMENT_NAME_EN[el[0]]} (${ELEMENT_GLOSS_EN[el[0]]}) leads the way`;
    const modText =
      mod === "Cardinal"
        ? "initiating rather than waiting"
        : mod === "Fixe"
          ? "holding steady rather than jumping around"
          : mod === "Mutable"
            ? "adapting on the fly rather than sticking to one plan"
            : "";
    return `Overall, ${elText}, with a way of moving through life built on ${modText}.`;
  }
  const elText =
    el.length === 0
      ? "aucun élément ne domine nettement"
      : el.length > 1
        ? `${el.map((e) => `${e} (${ELEMENT_GLOSS[e]})`).join(" et ")} se partagent la première place`
        : `${el[0]} (${ELEMENT_GLOSS[el[0]]}) mène la danse`;
  const modText =
    mod === "Cardinal"
      ? "initier plutôt qu'attendre"
      : mod === "Fixe"
        ? "tenir bon plutôt que changer souvent de cap"
        : mod === "Mutable"
          ? "s'ajuster en marchant plutôt que suivre un plan figé"
          : "";
  return `Globalement, ${elText}, avec une façon d'avancer construite sur le réflexe de ${modText}.`;
}

// Les 8 maisons couvertes en détail par les quatre chapitres thématiques
// (amour V+VII, argent II+VIII, carrière VI+X, spiritualité IX+XII) : si le
// maître de l'Ascendant occupe l'une d'elles, son placement y est déjà
// expliqué en entier, inutile de recoller le même paragraphe dans "Vue
// d'ensemble".
export const COVERED_HOUSES = [2, 5, 6, 7, 8, 9, 10, 12];

/** Paragraphe détaillé (signe puis maison) du maître de l'Ascendant, prêt à être inséré dans le chapitre "général". */
function ascendantRulerParagraph(s: Signals, relationshipType: RelationshipType | undefined, locale: Locale): string {
  if (!s.asc || !s.ascendantRulerKey || !s.ascendantRulerSign) return "";
  const rulerName = pn(s.ascendantRulerKey, locale);
  const signText = describePlanetInSign(s.ascendantRulerKey, s.ascendantRulerSign, relationshipType, locale);
  const houseAlreadyCovered = Boolean(s.ascendantRulerHouse && COVERED_HOUSES.includes(s.ascendantRulerHouse));
  if (locale === "en") {
    const houseText = houseAlreadyCovered
      ? ` It sits in house ${s.ascendantRulerHouse}, detailed further in this reading.`
      : s.ascendantRulerHouse
        ? `\n\n${describePlanetInHouse(s.ascendantRulerKey, s.ascendantRulerHouse, locale)}`
        : "";
    return `\n\nTraditionally, ${sn(s.asc, locale)} is ruled by ${rulerName}: how that first impression is actually lived day to day comes down to where this ruler sits. ${signText}${houseText}`;
  }
  const houseText = houseAlreadyCovered
    ? ` Il se trouve en maison ${s.ascendantRulerHouse}, détaillée plus loin dans cette lecture.`
    : s.ascendantRulerHouse
      ? `\n\n${describePlanetInHouse(s.ascendantRulerKey, s.ascendantRulerHouse, locale)}`
      : "";
  return `\n\nEn astrologie, ${sn(s.asc, locale)} est gouverné par ${rulerName} : la façon dont cette première impression se vit concrètement au quotidien tient à la position de ce maître. ${signText}${houseText}`;
}

// ---------------------------------------------------------------------------
// NATAL (voix "vous")
// ---------------------------------------------------------------------------

function generalNatal(s: Signals, locale: Locale): string {
  const rulerText = ascendantRulerParagraph(s, undefined, locale);
  if (locale === "en") {
    const layers = s.asc
      ? "wanting something consciously (Sun), feeling it in the body before trusting it (Moon), and walking into a room a certain way (Ascendant)"
      : "wanting something consciously (Sun), and feeling it in the body before trusting it (Moon)";
    const layerCount = s.asc ? "three layers" : "two layers";
    return `Sun in ${sn(s.sun, locale)} (${sk(s.sun, locale)}) and Moon in ${sn(s.moon, locale)} (${sk(s.moon, locale)}) form the backbone of who you are.${
      s.asc ? ` Ascendant in ${sn(s.asc, locale)} (${sk(s.asc, locale)}) sits on top of that: it's the first impression you give, before anyone knows the rest.` : ""
    }\n\n${dominanceClause(s, locale)} Put together, this chart is built on ${layerCount} that don't always agree, and don't need to: ${layers}.${rulerText}`;
  }
  const layers = s.asc
    ? "vouloir consciemment quelque chose (le Soleil), le ressentir dans le corps avant d'y croire (la Lune), et entrer dans une pièce d'une certaine façon (l'Ascendant)"
    : "vouloir consciemment quelque chose (le Soleil), et le ressentir dans le corps avant d'y croire (la Lune)";
  const layerCount = s.asc ? "trois couches" : "deux couches";
  return `Le Soleil en ${sn(s.sun, locale)} (${sk(s.sun, locale)}) et la Lune en ${sn(s.moon, locale)} (${sk(s.moon, locale)}) forment le socle de ce que vous êtes.${
    s.asc ? ` L'Ascendant en ${sn(s.asc, locale)} (${sk(s.asc, locale)}) vient se poser par-dessus : c'est la première impression que vous donnez, avant que qui que ce soit ne connaisse le reste.` : ""
  }\n\n${dominanceClause(s, locale)} Mis bout à bout, ce thème repose sur ${layerCount} qui ne sont pas toujours d'accord, et n'ont pas besoin de l'être : ${layers}.${rulerText}`;
}

function loveNatal(chart: NatalChart, s: Signals, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.venus && s.mars ? elementNuance(s.venus, s.mars, locale === "en" ? "What draws you in" : "Ce qui vous attire", locale === "en" ? "how you actually go after it" : "la façon dont vous allez réellement le chercher", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 5 && h !== 7), ...usedHouses];
    const fifth = describeHouseDomain(chart, 5, locale, avoid);
    const seventh = describeHouseDomain(chart, 7, locale, avoid);
    usedHouses.add(5).add(7);
    if (fifth.rulerHouse) usedHouses.add(fifth.rulerHouse);
    if (seventh.rulerHouse) usedHouses.add(seventh.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry the weight of your love life: pleasure and romance (${fifth.title}), and partnership itself (${seventh.title}).`
        : `Deux maisons portent le poids de votre vie amoureuse : le plaisir et la romance (${fifth.title}), et le partenariat lui-même (${seventh.title}).`;
    return `${intro}\n\n${fifth.text}\n\n${seventh.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const venusText = s.venus ? describePlanetInSign("venus", s.venus, undefined, locale) : "";
  const marsText = s.mars ? describePlanetInSign("mars", s.mars, undefined, locale) : "";
  return `${venusText}${marsText ? `\n\n${marsText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

function moneyNatal(chart: NatalChart, s: Signals, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.jupiter && s.saturn ? elementNuance(s.jupiter, s.saturn, locale === "en" ? "Your instinct to expand" : "Votre instinct d'expansion", locale === "en" ? "your instinct to hold back and consolidate" : "votre instinct de retenue et de consolidation", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 2 && h !== 8), ...usedHouses];
    const second = describeHouseDomain(chart, 2, locale, avoid);
    const eighth = describeHouseDomain(chart, 8, locale, avoid);
    usedHouses.add(2).add(8);
    if (second.rulerHouse) usedHouses.add(second.rulerHouse);
    if (eighth.rulerHouse) usedHouses.add(eighth.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry your relationship to money: what you earn and build yourself (${second.title}), and what gets shared, merged or owed with someone else (${eighth.title}).`
        : `Deux maisons portent votre rapport à l'argent : ce que vous gagnez et construisez par vous-même (${second.title}), et ce qui se partage, se fusionne ou se doit avec quelqu'un d'autre (${eighth.title}).`;
    return `${intro}\n\n${second.text}\n\n${eighth.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const jupiterText = s.jupiter ? describePlanetInSign("jupiter", s.jupiter, undefined, locale) : "";
  const saturnText = s.saturn ? describePlanetInSign("saturn", s.saturn, undefined, locale) : "";
  return `${jupiterText}${saturnText ? `\n\n${saturnText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

function careerNatal(chart: NatalChart, s: Signals, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.mars && s.saturn ? elementNuance(s.mars, s.saturn, locale === "en" ? "Your natural pace" : "Votre rythme naturel", locale === "en" ? "the discipline this path demands" : "la discipline que ce chemin exige", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 6 && h !== 10), ...usedHouses];
    const sixth = describeHouseDomain(chart, 6, locale, avoid);
    const tenth = describeHouseDomain(chart, 10, locale, avoid);
    usedHouses.add(6).add(10);
    if (sixth.rulerHouse) usedHouses.add(sixth.rulerHouse);
    if (tenth.rulerHouse) usedHouses.add(tenth.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry your work life: daily work and routine (${sixth.title}), and the public role you're building toward (${tenth.title}).`
        : `Deux maisons portent votre vie professionnelle : le travail au quotidien (${sixth.title}), et le rôle public que vous construisez (${tenth.title}).`;
    return `${intro}\n\n${sixth.text}\n\n${tenth.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const sunText = describePlanetInSign("sun", s.sun, undefined, locale);
  const saturnText = s.saturn ? describePlanetInSign("saturn", s.saturn, undefined, locale) : "";
  return `${sunText}${saturnText ? `\n\n${saturnText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

function spiritualNatal(chart: NatalChart, s: Signals, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.moon && s.neptune ? elementNuance(s.moon, s.neptune, locale === "en" ? "What already soothes you" : "Ce qui vous apaise déjà", locale === "en" ? "the pull toward something less definable" : "l'attirance vers quelque chose de moins définissable", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 9 && h !== 12), ...usedHouses];
    const ninth = describeHouseDomain(chart, 9, locale, avoid);
    const twelfth = describeHouseDomain(chart, 12, locale, avoid);
    usedHouses.add(9).add(12);
    if (ninth.rulerHouse) usedHouses.add(ninth.rulerHouse);
    if (twelfth.rulerHouse) usedHouses.add(twelfth.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry your inner life: the search for meaning (${ninth.title}), and what happens once you stop performing for anyone (${twelfth.title}).`
        : `Deux maisons portent votre vie intérieure : la quête de sens (${ninth.title}), et ce qui se passe une fois que vous cessez de jouer un rôle pour qui que ce soit (${twelfth.title}).`;
    return `${intro}\n\n${ninth.text}\n\n${twelfth.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const moonText = describePlanetInSign("moon", s.moon, undefined, locale);
  const neptuneText = s.neptune ? describePlanetInSign("neptune", s.neptune, undefined, locale) : "";
  return `${moonText}${neptuneText ? `\n\n${neptuneText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

export function composeChartDomains(chart: NatalChart, locale: Locale = "fr"): ChartDomains {
  const s = gatherSignals(chart.points, chart.houses, chart.hasReliableHouses);
  // Partagée entre les 4 chapitres thématiques (traités dans cet ordre) pour
  // qu'un même maître de maison, une fois expliqué en entier quelque part,
  // ne soit plus jamais recollé mot pour mot ailleurs dans la lecture, même
  // quand la maison qu'il occupe n'est pas elle-même l'une des 8 maisons
  // ciblées par les chapitres (voir describeHouseDomain).
  const usedHouses = new Set<number>();
  return dedupeChartDomains({
    general: generalNatal(s, locale),
    love: loveNatal(chart, s, locale, usedHouses),
    money: moneyNatal(chart, s, locale, usedHouses),
    career: careerNatal(chart, s, locale, usedHouses),
    spiritual: spiritualNatal(chart, s, locale, usedHouses),
  });
}

// ---------------------------------------------------------------------------
// COMPOSITE (voix "cette relation")
// ---------------------------------------------------------------------------

function generalComposite(s: Signals, relationshipType: RelationshipType, locale: Locale): string {
  const rulerText = ascendantRulerParagraph(s, relationshipType, locale);
  if (locale === "en") {
    return `This bond's own composite Sun sits in ${sn(s.sun, locale)} (${sk(s.sun, locale)}), its composite Moon in ${sn(s.moon, locale)} (${sk(s.moon, locale)}): not what either of you is alone, but what the two of you generate together.${
      s.asc ? ` Its composite Ascendant in ${sn(s.asc, locale)} (${sk(s.asc, locale)}) is the face this relationship shows before anyone's looked closer.` : ""
    }\n\n${dominanceClause(s, locale)} That's a relationship with its own identity, its own comfort zone, and its own instincts, distinct from what either person would build solo.${rulerText}`;
  }
  return `Le Soleil composite de ce lien se trouve en ${sn(s.sun, locale)} (${sk(s.sun, locale)}), sa Lune composite en ${sn(s.moon, locale)} (${sk(s.moon, locale)}) : pas ce que chacun de vous est séparément, mais ce que vous deux générez ensemble.${
    s.asc ? ` Son Ascendant composite en ${sn(s.asc, locale)} (${sk(s.asc, locale)}) est le visage que cette relation montre avant que quiconque ne regarde de plus près.` : ""
  }\n\n${dominanceClause(s, locale)} C'est une relation qui a sa propre identité, sa propre zone de confort et ses propres réflexes, distincts de ce que chacun bâtirait seul.${rulerText}`;
}

function loveComposite(composite: CompositeChart, s: Signals, relationshipType: RelationshipType, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.venus && s.mars ? elementNuance(s.venus, s.mars, locale === "en" ? "What this bond values" : "Ce que ce lien valorise", locale === "en" ? "how the two of you push for it" : "la façon dont vous deux le poursuivez", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 5 && h !== 7), ...usedHouses];
    const fifth = describeCompositeHouseDomain(composite, relationshipType, 5, locale, avoid);
    const seventh = describeCompositeHouseDomain(composite, relationshipType, 7, locale, avoid);
    usedHouses.add(5).add(7);
    if (fifth.rulerHouse) usedHouses.add(fifth.rulerHouse);
    if (seventh.rulerHouse) usedHouses.add(seventh.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry this bond's love life: shared pleasure (${fifth.title}), and the couple facing itself (${seventh.title}).`
        : `Deux maisons portent la vie amoureuse de ce lien : le plaisir partagé (${fifth.title}), et le couple qui se regarde lui-même (${seventh.title}).`;
    return `${intro}\n\n${fifth.text}\n\n${seventh.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const venusText = s.venus ? describePlanetInSign("venus", s.venus, relationshipType, locale) : "";
  const marsText = s.mars ? describePlanetInSign("mars", s.mars, relationshipType, locale) : "";
  return `${venusText}${marsText ? `\n\n${marsText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

function moneyComposite(composite: CompositeChart, s: Signals, relationshipType: RelationshipType, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.jupiter && s.saturn ? elementNuance(s.jupiter, s.saturn, locale === "en" ? "This bond's instinct to expand" : "L'instinct d'expansion de ce lien", locale === "en" ? "its instinct to consolidate" : "son instinct de consolidation", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 2 && h !== 8), ...usedHouses];
    const second = describeCompositeHouseDomain(composite, relationshipType, 2, locale, avoid);
    const eighth = describeCompositeHouseDomain(composite, relationshipType, 8, locale, avoid);
    usedHouses.add(2).add(8);
    if (second.rulerHouse) usedHouses.add(second.rulerHouse);
    if (eighth.rulerHouse) usedHouses.add(eighth.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry this bond's relationship to money: what it builds and protects together (${second.title}), and what's merged or owed between you (${eighth.title}).`
        : `Deux maisons portent le rapport de ce lien à l'argent : ce qu'il construit et protège ensemble (${second.title}), et ce qui est fusionné ou dû entre vous (${eighth.title}).`;
    return `${intro}\n\n${second.text}\n\n${eighth.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const jupiterText = s.jupiter ? describePlanetInSign("jupiter", s.jupiter, relationshipType, locale) : "";
  const saturnText = s.saturn ? describePlanetInSign("saturn", s.saturn, relationshipType, locale) : "";
  return `${jupiterText}${saturnText ? `\n\n${saturnText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

function careerComposite(composite: CompositeChart, s: Signals, relationshipType: RelationshipType, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.sun && s.saturn ? elementNuance(s.sun, s.saturn, locale === "en" ? "What this bond is trying to become" : "Ce que ce lien essaie de devenir", locale === "en" ? "the discipline it needs to get there" : "la discipline dont il a besoin pour y arriver", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 6 && h !== 10), ...usedHouses];
    const sixth = describeCompositeHouseDomain(composite, relationshipType, 6, locale, avoid);
    const tenth = describeCompositeHouseDomain(composite, relationshipType, 10, locale, avoid);
    usedHouses.add(6).add(10);
    if (sixth.rulerHouse) usedHouses.add(sixth.rulerHouse);
    if (tenth.rulerHouse) usedHouses.add(tenth.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry this bond's shared work: its daily upkeep (${sixth.title}), and what it stands for once others can see it (${tenth.title}).`
        : `Deux maisons portent le travail commun de ce lien : son entretien au quotidien (${sixth.title}), et ce qu'il représente une fois que d'autres peuvent le voir (${tenth.title}).`;
    return `${intro}\n\n${sixth.text}\n\n${tenth.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const sunText = describePlanetInSign("sun", s.sun, relationshipType, locale);
  const saturnText = s.saturn ? describePlanetInSign("saturn", s.saturn, relationshipType, locale) : "";
  return `${sunText}${saturnText ? `\n\n${saturnText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

function spiritualComposite(composite: CompositeChart, s: Signals, relationshipType: RelationshipType, locale: Locale, usedHouses: Set<number>): string {
  const nuance = s.moon && s.neptune ? elementNuance(s.moon, s.neptune, locale === "en" ? "What this bond reaches for instinctively" : "Ce vers quoi ce lien se tourne instinctivement", locale === "en" ? "the harder-to-name pull it also carries" : "l'attirance plus difficile à nommer qu'il porte aussi", locale) : "";
  if (s.hasReliableHouses) {
    const avoid = [...COVERED_HOUSES.filter((h) => h !== 9 && h !== 12), ...usedHouses];
    const ninth = describeCompositeHouseDomain(composite, relationshipType, 9, locale, avoid);
    const twelfth = describeCompositeHouseDomain(composite, relationshipType, 12, locale, avoid);
    usedHouses.add(9).add(12);
    if (ninth.rulerHouse) usedHouses.add(ninth.rulerHouse);
    if (twelfth.rulerHouse) usedHouses.add(twelfth.rulerHouse);
    const intro =
      locale === "en"
        ? `Two houses carry this bond's inner life: the meaning it searches for together (${ninth.title}), and what it shares below the surface, unspoken (${twelfth.title}).`
        : `Deux maisons portent la vie intérieure de ce lien : le sens qu'il cherche ensemble (${ninth.title}), et ce qu'il partage sous la surface, sans le dire (${twelfth.title}).`;
    return `${intro}\n\n${ninth.text}\n\n${twelfth.text}${nuance ? `\n\n${nuance}` : ""}`;
  }
  const moonText = describePlanetInSign("moon", s.moon, relationshipType, locale);
  const neptuneText = s.neptune ? describePlanetInSign("neptune", s.neptune, relationshipType, locale) : "";
  return `${moonText}${neptuneText ? `\n\n${neptuneText}` : ""}${nuance ? `\n\n${nuance}` : ""}`;
}

export function composeCompositeChartDomains(
  composite: CompositeChart,
  relationshipType: RelationshipType,
  locale: Locale = "fr"
): ChartDomains {
  const s = gatherSignals(composite.points, composite.houses, composite.hasReliableHouses);
  const usedHouses = new Set<number>();
  return dedupeChartDomains({
    general: generalComposite(s, relationshipType, locale),
    love: loveComposite(composite, s, relationshipType, locale, usedHouses),
    money: moneyComposite(composite, s, relationshipType, locale, usedHouses),
    career: careerComposite(composite, s, relationshipType, locale, usedHouses),
    spiritual: spiritualComposite(composite, s, relationshipType, locale, usedHouses),
  });
}
