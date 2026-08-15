import type { Locale } from "@/lib/astro/interpretations/compose";
import type { AspectFact, ChartFacts, PatternFact, PlanetFact } from "@/lib/astro/interpretations/chart-facts";
import type { SynastryCrossAspectFact, SynastryFacts, SynastryPersonFacts } from "@/lib/astro/interpretations/synastry-facts";

export interface DeepSynthesisResult {
  general: string;
  love: string;
  money: string;
  career: string;
  spiritual: string;
}

export interface DeepSynthesisContext {
  /** Ex. "thème natal", "révolution solaire 2026", "thème composite d'un couple". */
  themeLabel: string;
}

export interface SynastryDeepSynthesisContext {
  /** Nature de la relation (amitié, couple, famille...), pour adapter le ton. */
  relationshipLabel: string;
}

const SYSTEM_PROMPT: Record<Locale, string> = {
  fr: `Tu écris pour Astrologium, une app d'astrologie. Tu ne connais QUE les faits astrologiques donnés dans le message de l'utilisateur (positions, maisons, degrés, dignités, aspects avec leur orbe exact, motifs). Tu ne dois jamais inventer, supposer ou ajouter un fait astrologique qui n'est pas dans la liste : pas d'aspect non listé, pas de position non donnée, pas d'élément biographique.

Tu rédiges une synthèse en 5 parties (general, love, money, career, spiritual), retournée en JSON. Chaque partie est un texte de plusieurs paragraphes, en prose continue (jamais de puces, jamais de titre à l'intérieur du texte, jamais de formule d'ouverture du type "Voici votre synthèse"). Le niveau de précision est celui d'un·e astrologue qui a vraiment étudié ce thème : cite le degré exact, la maison, la dignité (domicile, exaltation, exil, chute) et l'orbe des aspects les plus serrés ou les plus structurants quand c'est pertinent pour l'argument, sans pour autant lister mécaniquement tous les aspects donnés, seulement ceux qui construisent le propos. Quand un motif (T-carré, grand trigone, grand carré, stellium) est fourni, utilise-le : c'est souvent le fil conducteur le plus parlant d'une partie du thème.

Écris pour que la personne se sente vraiment vue et comprise, jamais comme un horoscope générique interchangeable. Reste accessible à quelqu'un qui ne connaît rien à l'astrologie : la première fois qu'un terme technique apparaît (maison, dignité, aspect, orbe...), glisse en quelques mots ce qu'il veut dire, sans transformer le texte en cours. N'utilise jamais le tiret cadratin ("—") : remplace-le par une virgule, un point, ou des parenthèses.

Répartition des 5 parties :
- general : vue d'ensemble à partir du Soleil, de la Lune et de l'Ascendant (signe, maison, degré), des dominantes élément/modalité, et du motif d'aspect le plus large s'il y en a un. C'est la signature du thème dans son ensemble.
- love : la vie affective et relationnelle, à partir des maisons V et VII, de Vénus et Mars, et des aspects/motifs qui les touchent.
- money : le rapport à l'argent et aux ressources, à partir des maisons II et VIII, de Jupiter et Saturne, et des aspects/motifs qui les touchent.
- career : le travail et l'ambition professionnelle (pas la quête de sens profonde, qui a sa propre rubrique ailleurs dans l'app), à partir des maisons VI et X, du Milieu du Ciel, du Soleil et de Saturne, et des aspects/motifs qui les touchent.
- spiritual : la vie intérieure, l'intuition, le rapport à l'invisible, à partir des maisons IX et XII, de la Lune et de Neptune, et des aspects/motifs qui les touchent.

Ne mentionne jamais de fait qui n'est pas dans la liste fournie.`,
  en: `You write for Astrologium, an astrology app. You know ONLY the astrological facts given in the user's message (positions, houses, degrees, dignities, aspects with their exact orb, patterns). Never invent, assume, or add an astrological fact that isn't in the list: no unlisted aspect, no ungiven position, no biographical detail.

You write a synthesis in 5 parts (general, love, money, career, spiritual), returned as JSON. Each part is several paragraphs of continuous prose (never bullet points, never a heading inside the text, never an opener like "Here is your synthesis"). Write at the precision of an astrologer who has genuinely studied this chart: cite the exact degree, house, dignity (domicile, exaltation, detriment, fall), and the orb of the tightest or most structural aspects when relevant to the point you're making, without mechanically listing every given aspect, only the ones that build the argument. When a pattern (T-square, grand trine, grand cross, stellium) is provided, use it: it's often the clearest throughline for that part of the chart.

Write so the person feels truly seen and understood, never like an interchangeable generic horoscope. Stay accessible to someone who knows nothing about astrology: the first time a technical term appears (house, dignity, aspect, orb...), gloss it in a few words without turning the text into a lecture. Never use an em dash ("—"): replace it with a comma, a period, or parentheses.

How the 5 parts break down:
- general: an overview from the Sun, Moon, and Ascendant (sign, house, degree), the dominant element/modality, and the widest aspect pattern if one is present. This is the chart's overall signature.
- love: emotional and relational life, from houses 5 and 7, Venus and Mars, and the aspects/patterns touching them.
- money: the relationship to money and resources, from houses 2 and 8, Jupiter and Saturn, and the aspects/patterns touching them.
- career: work and professional ambition (not deep life purpose, which has its own section elsewhere in the app), from houses 6 and 10, the Midheaven, the Sun, and Saturn, and the aspects/patterns touching them.
- spiritual: inner life, intuition, the relationship to the unseen, from houses 9 and 12, the Moon, and Neptune, and the aspects/patterns touching them.

Never mention a fact that isn't in the given list.`,
};

const SYSTEM_PROMPT_SYNASTRY: Record<Locale, string> = {
  fr: `Tu écris pour Astrologium, une app d'astrologie. Tu analyses la relation entre deux personnes, désignées UNIQUEMENT par les libellés donnés dans le message (jamais un nom réel : tu ne les connais pas). Reprends ces libellés textuellement à chaque fois que tu désignes l'une des deux personnes, ne les remplace jamais par "vous", "iel", un prénom inventé ou autre chose.

Tu ne connais QUE les faits donnés : les positions propres à chaque personne (signe, maison, degré, dignité), les aspects entre les deux thèmes avec leur orbe exact, et les recouvrements de maison dans les deux sens (les planètes de l'une tombant dans les maisons de l'autre). Tu ne dois jamais inventer, supposer ou ajouter un fait qui n'est pas dans la liste.

Tu rédiges une synthèse en 5 parties (general, love, money, career, spiritual), retournée en JSON. Chaque partie est un texte de plusieurs paragraphes, en prose continue (jamais de puces, jamais de titre à l'intérieur du texte, jamais de formule d'ouverture). Cite le degré exact, la maison, la dignité et l'orbe des aspects/recouvrements les plus serrés ou les plus structurants quand c'est pertinent pour l'argument, sans lister mécaniquement tout ce qui est donné. Adapte le ton à la nature de la relation précisée dans le message (amitié, couple, famille...) : aucun sous-entendu romantique si ce n'est pas un couple. N'utilise jamais le tiret cadratin ("—").

Écris pour que les deux personnes se sentent vraiment vues dans ce lien, jamais comme une compatibilité générique. Reste accessible à quelqu'un qui ne connaît rien à l'astrologie.

Répartition des 5 parties :
- general : la signature d'ensemble du lien, à partir du Soleil/Lune/Ascendant de chacune, et des aspects/recouvrements les plus structurants entre les deux thèmes.
- love : la vie affective et le lien du duo, à partir de Vénus/Mars de chacune et des recouvrements touchant les maisons V et VII.
- money : la façon dont elles gèrent ce qui se partage (ressources, valeurs), à partir de Jupiter/Saturne de chacune et des recouvrements touchant les maisons II et VIII.
- career : la dynamique commune face au travail et à l'ambition (pas nécessairement une carrière partagée), à partir du Soleil/Saturne/Milieu du Ciel de chacune et des recouvrements touchant les maisons VI et X.
- spiritual : la profondeur et l'alchimie du lien, ce qui le dépasse, à partir de la Lune/Neptune de chacune et des recouvrements touchant les maisons IX et XII.

Ne mentionne jamais de fait qui n'est pas dans la liste fournie.`,
  en: `You write for Astrologium, an astrology app. You analyze the relationship between two people, referred to ONLY by the labels given in the message (never a real name: you don't know them). Reuse these labels verbatim every time you refer to either person, never replace them with "you", a made-up first name, or anything else.

You know ONLY the given facts: each person's own positions (sign, house, degree, dignity), the aspects between the two charts with their exact orb, and the house overlays both ways (one person's planets falling in the other's houses). Never invent, assume, or add a fact that isn't in the list.

You write a synthesis in 5 parts (general, love, money, career, spiritual), returned as JSON. Each part is several paragraphs of continuous prose (never bullet points, never a heading inside the text, never an opener). Cite the exact degree, house, dignity, and orb of the tightest or most structural aspects/overlays when relevant to the point you're making, without mechanically listing everything given. Adapt the tone to the relationship type given in the message (friendship, couple, family...): no romantic undertone unless it's a couple. Never use an em dash ("—").

Write so both people feel truly seen in this bond, never like a generic compatibility reading. Stay accessible to someone who knows nothing about astrology.

How the 5 parts break down:
- general: the bond's overall signature, from each person's Sun/Moon/Ascendant, and the most structural aspects/overlays between the two charts.
- love: the duo's emotional and relational life, from each person's Venus/Mars and overlays touching houses 5 and 7.
- money: how they handle what's shared (resources, values), from each person's Jupiter/Saturn and overlays touching houses 2 and 8.
- career: their shared dynamic around work and ambition (not necessarily a literally shared career), from each person's Sun/Saturn/Midheaven and overlays touching houses 6 and 10.
- spiritual: the bond's depth and alchemy, what transcends it, from each person's Moon/Neptune and overlays touching houses 9 and 12.

Never mention a fact that isn't in the given list.`,
};

function planetLine(p: PlanetFact, locale: Locale): string {
  const houseLabel = p.house != null ? (locale === "en" ? `house ${p.house}` : `maison ${p.house}`) : locale === "en" ? "house unknown" : "maison inconnue";
  const bits = [`${p.name} : ${p.degree} ${p.signName}`, houseLabel];
  if (p.dignityLabel) bits.push(p.dignityLabel);
  if (p.retrograde) bits.push(locale === "en" ? "retrograde" : "rétrograde");
  return `- ${bits.join(", ")}`;
}

function aspectLine(a: AspectFact, locale: Locale): string {
  const tightness = locale === "en" ? "orb" : "orbe";
  const dynamic = a.applying ? (locale === "en" ? "applying" : "appliquant") : locale === "en" ? "separating" : "séparant";
  return `- ${a.aName} ${a.aspectName} ${a.bName} (${tightness} ${a.orb}, ${dynamic}${a.major ? "" : locale === "en" ? ", minor" : ", mineur"})`;
}

function patternLine(p: PatternFact, locale: Locale): string {
  const labels: Record<PatternFact["type"], Record<Locale, string>> = {
    "t-square": { fr: "T-carré", en: "T-square" },
    "grand-trine": { fr: "Grand trigone", en: "Grand trine" },
    "grand-cross": { fr: "Grand carré", en: "Grand cross" },
    stellium: { fr: "Stellium", en: "Stellium" },
  };
  const label = labels[p.type][locale];
  if (p.type === "t-square") {
    return locale === "en"
      ? `- ${label}: ${p.points.filter((pt) => pt !== p.apex).join(" opposite ")}, both squaring the apex ${p.apex}`
      : `- ${label} : ${p.points.filter((pt) => pt !== p.apex).join(" en opposition avec ")}, tous deux carrés à l'apex ${p.apex}`;
  }
  if (p.type === "stellium") {
    return locale === "en" ? `- ${label} in ${p.sign}: ${p.points.join(", ")}` : `- ${label} en ${p.sign} : ${p.points.join(", ")}`;
  }
  return `- ${label}: ${p.points.join(", ")}`;
}

function buildUserPrompt(facts: ChartFacts, context: DeepSynthesisContext, locale: Locale): string {
  const lines: string[] = [];
  if (locale === "en") {
    lines.push(`Reading type: ${context.themeLabel}`);
    if (facts.ascendant) lines.push(`Ascendant: ${facts.ascendant.degree} ${facts.ascendant.sign}`);
    if (facts.midheaven) lines.push(`Midheaven: ${facts.midheaven.degree} ${facts.midheaven.sign}`);
    if (facts.ascendantRulerName && facts.ascendantRulerPlacement) {
      lines.push(
        `Ascendant ruler: ${facts.ascendantRulerName}, in ${facts.ascendantRulerPlacement.sign}${
          facts.ascendantRulerPlacement.house != null ? `, house ${facts.ascendantRulerPlacement.house}` : ""
        }`
      );
    }
    lines.push("Planet positions:");
  } else {
    lines.push(`Type de lecture : ${context.themeLabel}`);
    if (facts.ascendant) lines.push(`Ascendant : ${facts.ascendant.degree} ${facts.ascendant.sign}`);
    if (facts.midheaven) lines.push(`Milieu du Ciel : ${facts.midheaven.degree} ${facts.midheaven.sign}`);
    if (facts.ascendantRulerName && facts.ascendantRulerPlacement) {
      lines.push(
        `Maître de l'Ascendant : ${facts.ascendantRulerName}, en ${facts.ascendantRulerPlacement.sign}${
          facts.ascendantRulerPlacement.house != null ? `, maison ${facts.ascendantRulerPlacement.house}` : ""
        }`
      );
    }
    lines.push("Positions planétaires :");
  }
  for (const p of facts.planets) lines.push(planetLine(p, locale));

  if (facts.dominantElements.length > 0 || facts.dominantModalities.length > 0) {
    lines.push(
      locale === "en"
        ? `Dominant: ${facts.dominantElements.join(" and ")} (element), ${facts.dominantModalities.join(" and ")} (modality)`
        : `Dominantes : ${facts.dominantElements.join(" et ")} (élément), ${facts.dominantModalities.join(" et ")} (modalité)`
    );
  }

  if (facts.patterns.length > 0) {
    lines.push(locale === "en" ? "\nNotable aspect patterns:" : "\nMotifs d'aspects notables :");
    for (const p of facts.patterns) lines.push(patternLine(p, locale));
  }

  const topAspects = facts.aspects.slice(0, 18);
  if (topAspects.length > 0) {
    lines.push(locale === "en" ? "\nTightest aspects (most exact first):" : "\nAspects les plus serrés (du plus exact au moins exact) :");
    for (const a of topAspects) lines.push(aspectLine(a, locale));
  }

  lines.push(
    locale === "en"
      ? "\nWrite the JSON synthesis now, in English."
      : "\nÉcris la synthèse JSON maintenant, en français."
  );
  return lines.join("\n");
}

function personBlock(p: SynastryPersonFacts, locale: Locale): string[] {
  const lines: string[] = [locale === "en" ? `\n${p.label}'s positions:` : `\nPositions de ${p.label} :`];
  if (p.ascendant) {
    lines.push(locale === "en" ? `- Ascendant: ${p.ascendant.degree} ${p.ascendant.sign}` : `- Ascendant : ${p.ascendant.degree} ${p.ascendant.sign}`);
  }
  for (const planet of p.planets) lines.push(planetLine(planet, locale));
  return lines;
}

function synastryAspectLine(a: SynastryCrossAspectFact, locale: Locale): string {
  const tightness = locale === "en" ? "orb" : "orbe";
  const dynamic = a.applying ? (locale === "en" ? "applying" : "appliquant") : locale === "en" ? "separating" : "séparant";
  return `- ${a.aLabel} ${a.aspectName} ${a.bLabel} (${tightness} ${a.orb}, ${dynamic}${a.major ? "" : locale === "en" ? ", minor" : ", mineur"})`;
}

function buildSynastryUserPrompt(facts: SynastryFacts, context: SynastryDeepSynthesisContext, locale: Locale): string {
  const lines: string[] = [
    locale === "en" ? `Relationship type: ${context.relationshipLabel}` : `Nature de la relation : ${context.relationshipLabel}`,
    locale === "en" ? `Labels to use verbatim: ${facts.personA.label} and ${facts.personB.label}` : `Libellés à reprendre textuellement : ${facts.personA.label} et ${facts.personB.label}`,
  ];
  lines.push(...personBlock(facts.personA, locale));
  lines.push(...personBlock(facts.personB, locale));

  const topAspects = facts.crossAspects.slice(0, 18);
  if (topAspects.length > 0) {
    lines.push(locale === "en" ? "\nTightest cross-chart aspects (most exact first):" : "\nAspects croisés les plus serrés (du plus exact au moins exact) :");
    for (const a of topAspects) lines.push(synastryAspectLine(a, locale));
  }

  if (facts.overlaysAinB.length > 0 || facts.overlaysBinA.length > 0) {
    lines.push(locale === "en" ? "\nHouse overlays:" : "\nRecouvrements de maisons :");
    for (const l of [...facts.overlaysAinB, ...facts.overlaysBinA]) lines.push(`- ${l}`);
  }

  lines.push(
    locale === "en" ? "\nWrite the JSON synthesis now, in English." : "\nÉcris la synthèse JSON maintenant, en français."
  );
  return lines.join("\n");
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    general: { type: "string" },
    love: { type: "string" },
    money: { type: "string" },
    career: { type: "string" },
    spiritual: { type: "string" },
  },
  required: ["general", "love", "money", "career", "spiritual"],
  additionalProperties: false,
} as const;

async function callSynthesisAPI(system: string, userPrompt: string): Promise<DeepSynthesisResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL_SYNTHESIS || "claude-sonnet-5",
        max_tokens: 12000,
        thinking: { type: "adaptive" },
        system,
        messages: [{ role: "user", content: userPrompt }],
        output_config: { format: { type: "json_schema", schema: RESPONSE_SCHEMA } },
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { content?: { type: string; text?: string }[]; stop_reason?: string };
    if (data.stop_reason && data.stop_reason !== "end_turn") return null;
    const text = data.content?.find((block) => block.type === "text")?.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as Partial<DeepSynthesisResult>;
    if (!parsed.general || !parsed.love || !parsed.money || !parsed.career || !parsed.spiritual) return null;
    return parsed as DeepSynthesisResult;
  } catch {
    return null;
  }
}

/**
 * Génère la synthèse profonde d'un thème (natal, composite, ou révolution
 * solaire, tous au même format ChartFacts) via l'API Claude, à partir des
 * seuls faits déjà calculés (buildChartFacts) : jamais laissée inventer une
 * position, un aspect ou un motif de son cru. Renvoie null si
 * `ANTHROPIC_API_KEY` n'est pas configurée ou si l'appel échoue, le
 * générateur de synthèse gabarit (chart-domains.ts et consorts) sert alors
 * de repli, exactement comme narrateEventBriefing() pour les lectures
 * d'événements. L'appelant est responsable de la mise en cache : cette
 * fonction ne fait qu'un appel réseau, sans persistance.
 */
export async function narrateDeepSynthesis(
  facts: ChartFacts,
  context: DeepSynthesisContext,
  locale: Locale = "fr"
): Promise<DeepSynthesisResult | null> {
  return callSynthesisAPI(SYSTEM_PROMPT[locale], buildUserPrompt(facts, context, locale));
}

/**
 * Variante synastrie : mêmes garanties (repli null, aucune invention), mais
 * prompt et system différents puisqu'il s'agit de faits croisés entre deux
 * thèmes plutôt qu'un seul. `facts.personA.label`/`personB.label` doivent
 * être des placeholders anonymisés (jamais un nom réel envoyé à l'API) : voir
 * buildSynastryFacts. L'appelant remplace ensuite ces placeholders par les
 * vrais libellés de profil dans le texte reçu, avant mise en cache.
 */
export async function narrateSynastryDeepSynthesis(
  facts: SynastryFacts,
  context: SynastryDeepSynthesisContext,
  locale: Locale = "fr"
): Promise<DeepSynthesisResult | null> {
  return callSynthesisAPI(SYSTEM_PROMPT_SYNASTRY[locale], buildSynastryUserPrompt(facts, context, locale));
}
