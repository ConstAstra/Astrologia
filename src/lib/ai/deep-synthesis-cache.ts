import { prisma } from "@/lib/db";
import {
  narrateDeepSynthesis,
  narrateSynastryDeepSynthesis,
  type DeepSynthesisContext,
  type DeepSynthesisResult,
  type SynastryDeepSynthesisContext,
} from "./deep-synthesis";
import type { ChartFacts } from "@/lib/astro/interpretations/chart-facts";
import type { SynastryFacts } from "@/lib/astro/interpretations/synastry-facts";
import type { Locale } from "@/lib/astro/interpretations/compose";

export type DeepSynthesisType = "natal" | "synastry" | "composite" | "solarReturn";

export interface DeepSynthesisCacheKey {
  type: DeepSynthesisType;
  profileId: string;
  secondaryProfileId?: string | null;
  year?: number | null;
  /** Synastrie/composite uniquement : le ton du texte en dépend, doit faire partie de la clé de cache. */
  relationshipType?: string | null;
  locale: Locale;
}

export async function getCachedDeepSynthesis(key: DeepSynthesisCacheKey): Promise<DeepSynthesisResult | null> {
  const row = await prisma.deepSynthesis.findFirst({
    where: {
      type: key.type,
      profileId: key.profileId,
      secondaryProfileId: key.secondaryProfileId ?? null,
      year: key.year ?? null,
      relationshipType: key.relationshipType ?? null,
      locale: key.locale,
    },
    orderBy: { generatedAt: "desc" },
  });
  if (!row) return null;
  try {
    return JSON.parse(row.contentJson) as DeepSynthesisResult;
  } catch {
    return null;
  }
}

async function saveDeepSynthesis(key: DeepSynthesisCacheKey, result: DeepSynthesisResult): Promise<void> {
  await prisma.deepSynthesis.create({
    data: {
      type: key.type,
      profileId: key.profileId,
      secondaryProfileId: key.secondaryProfileId ?? null,
      year: key.year ?? null,
      relationshipType: key.relationshipType ?? null,
      locale: key.locale,
      contentJson: JSON.stringify(result),
    },
  });
}

function substituteLabels(result: DeepSynthesisResult, replacements: [string, string][]): DeepSynthesisResult {
  const apply = (text: string) => replacements.reduce((acc, [from, to]) => acc.split(from).join(to), text);
  return {
    general: apply(result.general),
    love: apply(result.love),
    money: apply(result.money),
    career: apply(result.career),
    spiritual: apply(result.spiritual),
  };
}

/**
 * Renvoie la synthèse profonde en cache si elle existe déjà (jamais
 * régénérée à chaque visite), sinon appelle l'API Claude et met en cache le
 * résultat obtenu. Renvoie null si rien n'est en cache ET que la génération
 * échoue (clé absente, appel en échec) : l'appelant doit alors utiliser son
 * propre repli gabarit déterministe (composeChartDomains et consorts).
 */
export async function getOrGenerateDeepSynthesis(
  key: DeepSynthesisCacheKey,
  facts: ChartFacts,
  context: DeepSynthesisContext
): Promise<DeepSynthesisResult | null> {
  const cached = await getCachedDeepSynthesis(key);
  if (cached) return cached;

  const generated = await narrateDeepSynthesis(facts, context, key.locale);
  if (!generated) return null;

  await saveDeepSynthesis(key, generated);
  return generated;
}

/**
 * Variante synastrie : `facts` doit avoir été construit avec des placeholders
 * anonymisés (voir buildSynastryFacts) — jamais un nom réel envoyé à l'API.
 * Une fois la synthèse reçue, remplace ces placeholders par les vrais
 * libellés de profil (`realLabelA`/`realLabelB`) avant mise en cache : le
 * texte stocké et affiché porte les vrais libellés, l'API n'en a jamais vu.
 */
export async function getOrGenerateSynastryDeepSynthesis(
  key: DeepSynthesisCacheKey,
  facts: SynastryFacts,
  context: SynastryDeepSynthesisContext,
  realLabelA: string,
  realLabelB: string
): Promise<DeepSynthesisResult | null> {
  const cached = await getCachedDeepSynthesis(key);
  if (cached) return cached;

  const generated = await narrateSynastryDeepSynthesis(facts, context, key.locale);
  if (!generated) return null;

  const substituted = substituteLabels(generated, [
    [facts.personA.label, realLabelA],
    [facts.personB.label, realLabelB],
  ]);
  await saveDeepSynthesis(key, substituted);
  return substituted;
}
