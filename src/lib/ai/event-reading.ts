import type { Locale } from "@/lib/astro/interpretations/compose";
import type { EventBriefing } from "@/lib/astro/interpretations/event-transits";

const SYSTEM_PROMPT = {
  fr: "Tu écris pour Astrologium, une app d'astrologie. Tu ne connais QUE les faits astrologiques donnés dans le message de l'utilisateur (positions, maisons, aspects) : tu ne dois inventer, ajouter ou supposer aucun autre fait astrologique. Ton rôle est de relier ces faits en un texte chaleureux, concret et personnalisé, en 2 paragraphes maximum. Jamais de ton de prédiction garantie — reste dans le registre \"éclairage\", pas \"annonce\". Écris directement le texte final, sans titre ni formule d'introduction du type \"Voici\".",
  en: "You write for Astrologium, an astrology app. You know ONLY the astrological facts given in the user's message (positions, houses, aspects): never invent, add, or assume any other astrological fact. Your role is to connect these facts into a warm, concrete, personalized text, 2 paragraphs maximum. Never a tone of guaranteed prediction — stay in \"insight\", not \"announcement\". Write the final text directly, no title or \"Here is\"-style opener.",
} as const;

function buildUserPrompt(briefing: EventBriefing, locale: Locale): string {
  const lines: string[] = [];
  if (locale === "en") {
    lines.push(`Event type: ${briefing.eventLabel}`);
    lines.push(`Moon phase: ${briefing.moonPhaseLabel} — ${briefing.moonPhaseText}`);
    lines.push(`Relevant context: ${briefing.intro}`);
    lines.push("House placements of personal planets that day:");
    for (const p of briefing.housePlacements) {
      lines.push(`- ${p.planet} in ${p.houseName} (${p.houseKeyword})${p.isFocus ? " [relevant to this event]" : ""}`);
    }
    lines.push("Active aspects that day:");
    for (const a of briefing.aspects) {
      lines.push(`- (${a.tone}${a.isFocus ? ", relevant to this event" : ""}) ${a.text}`);
    }
    lines.push("\nWrite the personalized reading now, in English.");
  } else {
    lines.push(`Type d'événement : ${briefing.eventLabel}`);
    lines.push(`Phase lunaire : ${briefing.moonPhaseLabel} — ${briefing.moonPhaseText}`);
    lines.push(`Contexte pertinent : ${briefing.intro}`);
    lines.push("Maisons traversées par les planètes personnelles ce jour-là :");
    for (const p of briefing.housePlacements) {
      lines.push(`- ${p.planet} en ${p.houseName} (${p.houseKeyword})${p.isFocus ? " [pertinent pour cet événement]" : ""}`);
    }
    lines.push("Aspects actifs ce jour-là :");
    for (const a of briefing.aspects) {
      lines.push(`- (${a.tone}${a.isFocus ? ", pertinent pour cet événement" : ""}) ${a.text}`);
    }
    lines.push("\nÉcris la lecture personnalisée maintenant, en français.");
  }
  return lines.join("\n");
}

/**
 * Narre le briefing factuel (déjà entièrement calculé par
 * composeEventBriefing) en un texte chaleureux via l'API Claude. Ne reçoit
 * QUE des faits déjà établis — jamais laissé inventer une position, un
 * aspect ou une maison de son cru. Se rabat silencieusement sur la
 * synthèse gabarit (déterministe, toujours correcte) si `ANTHROPIC_API_KEY`
 * n'est pas configurée ou si l'appel échoue — même logique que
 * `sendEmail()`/`sendPushNotification()` : jamais bloquant, jamais une
 * condition de fonctionnement de la fonctionnalité.
 */
export async function narrateEventBriefing(briefing: EventBriefing, locale: Locale = "fr"): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log(`[ai:dev] Pas de ANTHROPIC_API_KEY — repli sur la synthèse gabarit pour "${briefing.eventLabel}".`);
    return briefing.templateSynthesis;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: SYSTEM_PROMPT[locale],
        messages: [{ role: "user", content: buildUserPrompt(briefing, locale) }],
      }),
    });

    if (!res.ok) return briefing.templateSynthesis;

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((block) => block.type === "text")?.text?.trim();
    return text || briefing.templateSynthesis;
  } catch {
    return briefing.templateSynthesis;
  }
}
