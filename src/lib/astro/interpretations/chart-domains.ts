import type { CompositeChart, EclipticPoint, HouseCusps, NatalChart, PointKey, ZodiacSign } from "../types";
import { computeDominance } from "../dominance";
import { signOf } from "../signs";
import { SIGN_META } from "./signs";
import { SIGN_META_EN } from "./signs.en";
import { SIGN_RULER } from "./rulership";
import type { Locale } from "./compose";

/**
 * La synthèse "grimoire" : cinq chapitres qui mettent bout à bout tout le
 * thème (Big 3, dominantes, planètes clés, maisons) en un récit continu,
 * sans jamais entrer dans le détail aspect par aspect, cette lecture-là
 * reste plus bas dans la page. Une lecture "livre qu'on feuillette", pas
 * une liste technique de plus.
 */
export interface ChartDomains {
  general: string;
  love: string;
  money: string;
  career: string;
  spiritual: string;
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
  house10RulerSign: ZodiacSign | null;
  house2RulerSign: ZodiacSign | null;
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
  const house10 = cuspSign(10);
  const house2 = cuspSign(2);

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
    house2,
    house5: cuspSign(5),
    house7: cuspSign(7),
    house8: cuspSign(8),
    house10,
    house12: cuspSign(12),
    house10RulerSign: house10 ? pointSign(points, SIGN_RULER[house10]) : null,
    house2RulerSign: house2 ? pointSign(points, SIGN_RULER[house2]) : null,
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
const ELEMENT_NAME_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

export function dominanceClause(s: Signals, locale: Locale): string {
  const el = s.dominantElements;
  const mod = s.dominantModalities[0];
  if (locale === "en") {
    const elText =
      el.length === 0
        ? "no single element dominates"
        : el.length > 1
          ? `${el.map((e) => ELEMENT_NAME_EN[e]).join(" and ")} share the lead`
          : `${ELEMENT_NAME_EN[el[0]]} leads the way`;
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
        ? `${el.join(" et ")} se partagent la première place`
        : `${el[0]} mène la danse`;
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

// ---------------------------------------------------------------------------
// NATAL (voix "vous")
// ---------------------------------------------------------------------------

function generalNatal(s: Signals, locale: Locale): string {
  if (locale === "en") {
    return `Sun in ${sn(s.sun, locale)} (${sk(s.sun, locale)}) and Moon in ${sn(s.moon, locale)} (${sk(s.moon, locale)}) form the backbone of who you are${
      s.asc ? `, wrapped in an Ascendant in ${sn(s.asc, locale)} (${sk(s.asc, locale)}), the first impression you give before anyone knows the rest` : ""
    }. ${dominanceClause(s, locale)} Put together, this is a chart that wants to want something consciously (Sun), feel it in the body before trusting it (Moon)${
      s.asc ? ", and walk into a room a certain way while doing both" : ""
    }, three layers that don't always agree, and don't need to.`;
  }
  return `Le Soleil en ${sn(s.sun, locale)} (${sk(s.sun, locale)}) et la Lune en ${sn(s.moon, locale)} (${sk(s.moon, locale)}) forment le socle de ce que vous êtes${
    s.asc ? `, enveloppé d'un Ascendant en ${sn(s.asc, locale)} (${sk(s.asc, locale)}), la première impression que vous donnez avant que qui que ce soit ne connaisse le reste` : ""
  }. ${dominanceClause(s, locale)} Mis bout à bout, c'est un thème qui veut vouloir consciemment quelque chose (le Soleil), le ressentir dans le corps avant d'y croire (la Lune)${
    s.asc ? ", et entrer dans une pièce d'une certaine façon en faisant les deux à la fois" : ""
  }, trois couches qui ne sont pas toujours d'accord, et n'ont pas besoin de l'être.`;
}

function loveNatal(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house7
      ? locale === "en"
        ? ` The 7th house, the terrain of partnership itself, falls in ${sn(s.house7, locale)} (${sk(s.house7, locale)}), shaping the kind of "other" you keep finding yourself drawn to build something with.`
        : ` La maison VII, le terrain du couple lui-même, tombe en ${sn(s.house7, locale)} (${sk(s.house7, locale)}), ce qui colore le type d'autre avec qui vous vous retrouvez à vouloir construire quelque chose.`
      : "";
  if (locale === "en") {
    return `${s.venus ? `Venus in ${sn(s.venus, locale)} shows what you're drawn to and how you show affection (${sk(s.venus, locale)}).` : ""} ${s.mars ? `Mars in ${sn(s.mars, locale)} shows how you pursue what you want and how you fight for it (${sk(s.mars, locale)}).` : ""} Your Moon in ${sn(s.moon, locale)} decides what actually makes you feel safe once the chase is over.${houseBit} Read together, that's desire, pursuit and emotional need, three different questions a relationship has to answer, not one.`;
  }
  return `${s.venus ? `Vénus en ${sn(s.venus, locale)} montre ce qui vous attire et la façon dont vous montrez votre affection (${sk(s.venus, locale)}).` : ""} ${s.mars ? `Mars en ${sn(s.mars, locale)} montre comment vous poursuivez ce que vous voulez et comment vous vous battez pour l'obtenir (${sk(s.mars, locale)}).` : ""} Votre Lune en ${sn(s.moon, locale)} décide de ce qui vous fait vraiment vous sentir en sécurité une fois la conquête terminée.${houseBit} Mis ensemble, c'est le désir, la conquête et le besoin affectif, trois questions différentes auxquelles une relation doit répondre, pas une seule.`;
}

function moneyNatal(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house2
      ? locale === "en"
        ? ` The 2nd house, money earned by your own means, sits in ${sn(s.house2, locale)} (${sk(s.house2, locale)})${
            s.house2RulerSign ? `, ruled by a planet that itself sits in ${sn(s.house2RulerSign, locale)}, which is where the real story of your finances actually plays out` : ""
          }.${s.house8 ? ` The 8th house, shared resources, debt, what you build with someone else's money as much as your own, falls in ${sn(s.house8, locale)} (${sk(s.house8, locale)}).` : ""}`
        : ` La maison II, l'argent gagné par vos propres moyens, se trouve en ${sn(s.house2, locale)} (${sk(s.house2, locale)})${
            s.house2RulerSign ? `, gouvernée par une planète qui se trouve elle-même en ${sn(s.house2RulerSign, locale)}, là où se joue réellement l'histoire de vos finances` : ""
          }.${s.house8 ? ` La maison VIII, les ressources partagées, les dettes, ce que vous construisez avec l'argent d'un autre autant qu'avec le vôtre, tombe en ${sn(s.house8, locale)} (${sk(s.house8, locale)}).` : ""}`
      : "";
  if (locale === "en") {
    return `${s.venus ? `What you value, and what feels worth paying for, is colored by Venus in ${sn(s.venus, locale)}.` : ""}${
      s.jupiter ? ` Jupiter in ${sn(s.jupiter, locale)} shows where you naturally expect things to grow (${sk(s.jupiter, locale)}).` : ""
    }${s.saturn ? ` Saturn in ${sn(s.saturn, locale)} shows where discipline is required before anything solid gets built (${sk(s.saturn, locale)}).` : ""}${houseBit} Growth and caution rarely point the same direction here, and that tension is exactly what shapes real financial habits over time, not a one-time decision.`;
  }
  return `${s.venus ? `Ce que vous valorisez, ce qui vous semble mériter d'être payé, est coloré par Vénus en ${sn(s.venus, locale)}.` : ""}${
    s.jupiter ? ` Jupiter en ${sn(s.jupiter, locale)} montre où vous vous attendez naturellement à ce que les choses grandissent (${sk(s.jupiter, locale)}).` : ""
  }${s.saturn ? ` Saturne en ${sn(s.saturn, locale)} montre où la discipline est nécessaire avant que quoi que ce soit de solide ne se construise (${sk(s.saturn, locale)}).` : ""}${houseBit} L'expansion et la prudence pointent rarement dans la même direction ici, et c'est justement cette tension qui façonne vos vraies habitudes financières dans la durée, pas une décision unique.`;
}

function careerNatal(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house10
      ? locale === "en"
        ? ` Your Midheaven in ${sn(s.mc!, locale)} sets the public role you're aiming for${
            s.house10RulerSign ? `, and its ruler sits in ${sn(s.house10RulerSign, locale)}, which is the flavor that role actually takes once you're the one living it` : ""
          }.`
        : ` Votre Milieu du Ciel en ${sn(s.mc!, locale)} fixe le rôle public que vous visez${
            s.house10RulerSign ? `, et son maître se trouve en ${sn(s.house10RulerSign, locale)}, la couleur que ce rôle prend réellement une fois que c'est vous qui le vivez` : ""
          }.`
      : "";
  if (locale === "en") {
    return `Career here is less about a job title than about what your Sun in ${sn(s.sun, locale)} is trying to prove to the world.${houseBit}${
      s.saturn ? ` Saturn in ${sn(s.saturn, locale)} names where you have to put in the hours before anyone hands you credit (${sk(s.saturn, locale)}).` : ""
    }${s.mars ? ` Mars in ${sn(s.mars, locale)} is the engine, the pace at which you're willing to push (${sk(s.mars, locale)}).` : ""} Ambition and patience aren't opposites in this chart, they're sequential.`;
  }
  return `La carrière, ici, tient moins à un titre de poste qu'à ce que votre Soleil en ${sn(s.sun, locale)} essaie de prouver au monde.${houseBit}${
    s.saturn ? ` Saturne en ${sn(s.saturn, locale)} désigne l'endroit où il faut mettre les heures avant que qui que ce soit ne vous en attribue le mérite (${sk(s.saturn, locale)}).` : ""
  }${s.mars ? ` Mars en ${sn(s.mars, locale)} est le moteur, le rythme auquel vous êtes prêt·e à pousser (${sk(s.mars, locale)}).` : ""} L'ambition et la patience ne s'opposent pas dans ce thème, elles se succèdent.`;
}

function spiritualNatal(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house12
      ? locale === "en"
        ? ` The 12th house, what happens once you stop performing for anyone, falls in ${sn(s.house12, locale)} (${sk(s.house12, locale)}).`
        : ` La maison XII, ce qui se passe une fois que vous cessez de jouer un rôle pour qui que ce soit, tombe en ${sn(s.house12, locale)} (${sk(s.house12, locale)}).`
      : "";
  if (locale === "en") {
    return `${s.neptune ? `Neptune in ${sn(s.neptune, locale)} marks an entire generation's relationship to the invisible, but its house and aspects, read further down, are what make it personally yours.` : ""}${houseBit} Your Moon in ${sn(s.moon, locale)} is the more immediate compass, what actually soothes you when nothing external can.${
      s.northNode ? ` The North Node in ${sn(s.northNode, locale)} points to the direction this life keeps nudging you toward, unfamiliar at first, worth trusting anyway (${sk(s.northNode, locale)}).` : ""
    }`;
  }
  return `${s.neptune ? `Neptune en ${sn(s.neptune, locale)} marque le rapport de toute une génération à l'invisible, mais sa maison et ses aspects, à lire plus loin, sont ce qui la rend personnellement vôtre.` : ""}${houseBit} Votre Lune en ${sn(s.moon, locale)} reste la boussole la plus immédiate, ce qui vous apaise réellement quand rien d'extérieur n'y parvient.${
    s.northNode ? ` Le Nœud Nord en ${sn(s.northNode, locale)} pointe la direction vers laquelle cette vie vous pousse sans cesse, peu familière au départ, mais qui mérite votre confiance (${sk(s.northNode, locale)}).` : ""
  }`;
}

export function composeChartDomains(chart: NatalChart, locale: Locale = "fr"): ChartDomains {
  const s = gatherSignals(chart.points, chart.houses, chart.hasReliableHouses);
  return {
    general: generalNatal(s, locale),
    love: loveNatal(s, locale),
    money: moneyNatal(s, locale),
    career: careerNatal(s, locale),
    spiritual: spiritualNatal(s, locale),
  };
}

// ---------------------------------------------------------------------------
// COMPOSITE (voix "cette relation")
// ---------------------------------------------------------------------------

function generalComposite(s: Signals, locale: Locale): string {
  if (locale === "en") {
    return `This bond's own composite Sun sits in ${sn(s.sun, locale)} (${sk(s.sun, locale)}), its composite Moon in ${sn(s.moon, locale)} (${sk(s.moon, locale)})${
      s.asc ? `, wrapped in a composite Ascendant in ${sn(s.asc, locale)} (${sk(s.asc, locale)}), the face this relationship shows before anyone's looked closer` : ""
    }, not what either of you is alone, but what the two of you generate together. ${dominanceClause(s, locale)} That's a relationship with its own identity, its own comfort zone, and its own instincts, distinct from what either person would build solo.`;
  }
  return `Le Soleil composite de ce lien se trouve en ${sn(s.sun, locale)} (${sk(s.sun, locale)}), sa Lune composite en ${sn(s.moon, locale)} (${sk(s.moon, locale)})${
    s.asc ? `, enveloppée d'un Ascendant composite en ${sn(s.asc, locale)} (${sk(s.asc, locale)}), le visage que cette relation montre avant que quiconque ne regarde de plus près` : ""
  }, pas ce que chacun de vous est séparément, mais ce que vous deux générez ensemble. ${dominanceClause(s, locale)} C'est une relation qui a sa propre identité, sa propre zone de confort et ses propres réflexes, distincts de ce que chacun bâtirait seul.`;
}

function loveComposite(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house7
      ? locale === "en"
        ? ` The composite 7th house, where this bond faces itself as a couple, falls in ${sn(s.house7, locale)} (${sk(s.house7, locale)}).`
        : ` La maison VII composite, là où ce lien se regarde en couple, tombe en ${sn(s.house7, locale)} (${sk(s.house7, locale)}).`
      : "";
  if (locale === "en") {
    return `${s.venus ? `The composite Venus in ${sn(s.venus, locale)} is what this bond values and how affection actually gets shown between you (${sk(s.venus, locale)}).` : ""} ${s.mars ? `The composite Mars in ${sn(s.mars, locale)} is how the two of you push for what the relationship wants (${sk(s.mars, locale)}).` : ""} The composite Moon in ${sn(s.moon, locale)} decides what makes this bond feel emotionally safe.${houseBit} None of this describes either of you individually, only what happens in the space between you.`;
  }
  return `${s.venus ? `La Vénus composite en ${sn(s.venus, locale)} est ce que ce lien valorise et la façon dont l'affection se montre réellement entre vous (${sk(s.venus, locale)}).` : ""} ${s.mars ? `Le Mars composite en ${sn(s.mars, locale)} est la façon dont vous deux poussez pour obtenir ce que la relation veut (${sk(s.mars, locale)}).` : ""} La Lune composite en ${sn(s.moon, locale)} décide de ce qui rend ce lien sûr émotionnellement.${houseBit} Rien de tout cela ne décrit l'un de vous individuellement, seulement ce qui se passe dans l'espace entre vous deux.`;
}

function moneyComposite(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house2
      ? locale === "en"
        ? ` The composite 2nd house, what this bond builds and protects together, sits in ${sn(s.house2, locale)} (${sk(s.house2, locale)}).${
            s.house8 ? ` The composite 8th house, everything shared, merged or owed between you, falls in ${sn(s.house8, locale)} (${sk(s.house8, locale)}).` : ""
          }`
        : ` La maison II composite, ce que ce lien construit et protège ensemble, se trouve en ${sn(s.house2, locale)} (${sk(s.house2, locale)}).${
            s.house8 ? ` La maison VIII composite, tout ce qui est partagé, fusionné ou dû entre vous, tombe en ${sn(s.house8, locale)} (${sk(s.house8, locale)}).` : ""
          }`
      : "";
  if (locale === "en") {
    return `${s.jupiter ? `The composite Jupiter in ${sn(s.jupiter, locale)} shows where this relationship naturally expects to grow (${sk(s.jupiter, locale)}).` : ""}${
      s.saturn ? ` The composite Saturn in ${sn(s.saturn, locale)} shows where the two of you have to put in real, unglamorous work before anything solid holds (${sk(s.saturn, locale)}).` : ""
    }${houseBit} What this bond wants to build and what it has to earn the hard way rarely line up on their own, that gap is normal, not a warning sign.`;
  }
  return `${s.jupiter ? `Le Jupiter composite en ${sn(s.jupiter, locale)} montre où cette relation s'attend naturellement à grandir (${sk(s.jupiter, locale)}).` : ""}${
    s.saturn ? ` Le Saturne composite en ${sn(s.saturn, locale)} montre où vous deux devez fournir un travail réel, peu glorieux, avant que quoi que ce soit de solide ne tienne (${sk(s.saturn, locale)}).` : ""
  }${houseBit} Ce que ce lien veut construire et ce qu'il doit gagner à la dure ne s'alignent que rarement tout seuls, cet écart est normal, pas un signal d'alarme.`;
}

function careerComposite(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house10
      ? locale === "en"
        ? ` The composite Midheaven in ${sn(s.mc!, locale)} sets what this relationship stands for once other people can see it.`
        : ` Le Milieu du Ciel composite en ${sn(s.mc!, locale)} fixe ce que cette relation représente une fois que d'autres personnes peuvent la voir.`
      : "";
  if (locale === "en") {
    return `What this bond ultimately builds together, the shared project it points toward, starts with the composite Sun in ${sn(s.sun, locale)}.${houseBit}${
      s.saturn ? ` Composite Saturn in ${sn(s.saturn, locale)} names the discipline the relationship needs to actually deliver on that ambition (${sk(s.saturn, locale)}).` : ""
    } A relationship's "career" is really its shared purpose, what it's trying to leave behind once the two of you have moved past just enjoying each other's company.`;
  }
  return `Ce que ce lien finit par construire ensemble, le projet commun vers lequel il tend, commence avec le Soleil composite en ${sn(s.sun, locale)}.${houseBit}${
    s.saturn ? ` Le Saturne composite en ${sn(s.saturn, locale)} nomme la discipline dont la relation a besoin pour vraiment tenir cette ambition (${sk(s.saturn, locale)}).` : ""
  } La "carrière" d'une relation, c'est en réalité son projet commun, ce qu'elle cherche à laisser derrière elle une fois passé le simple plaisir d'être ensemble.`;
}

function spiritualComposite(s: Signals, locale: Locale): string {
  const houseBit =
    s.hasReliableHouses && s.house12
      ? locale === "en"
        ? ` The composite 12th house, what this bond shares below the surface, unspoken, falls in ${sn(s.house12, locale)} (${sk(s.house12, locale)}).`
        : ` La maison XII composite, ce que ce lien partage sous la surface, sans le dire, tombe en ${sn(s.house12, locale)} (${sk(s.house12, locale)}).`
      : "";
  if (locale === "en") {
    return `${s.neptune ? `Composite Neptune in ${sn(s.neptune, locale)} colors the intangible, almost wordless part of this bond, the feeling neither of you can fully explain to outsiders.` : ""}${houseBit} The composite Moon in ${sn(s.moon, locale)} is what this relationship instinctively reaches for when things get hard, the thing it trusts without needing proof.`;
  }
  return `${s.neptune ? `Le Neptune composite en ${sn(s.neptune, locale)} colore la part intangible, presque indicible, de ce lien, ce ressenti qu'aucun de vous deux ne parvient tout à fait à expliquer à l'extérieur.` : ""}${houseBit} La Lune composite en ${sn(s.moon, locale)} est ce vers quoi cette relation se tourne instinctivement quand les choses se compliquent, ce en quoi elle a confiance sans avoir besoin de preuve.`;
}

export function composeCompositeChartDomains(composite: CompositeChart, locale: Locale = "fr"): ChartDomains {
  const s = gatherSignals(composite.points, composite.houses, composite.hasReliableHouses);
  return {
    general: generalComposite(s, locale),
    love: loveComposite(s, locale),
    money: moneyComposite(s, locale),
    career: careerComposite(s, locale),
    spiritual: spiritualComposite(s, locale),
  };
}
