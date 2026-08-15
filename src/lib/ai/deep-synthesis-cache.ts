import { prisma } from "@/lib/db";
import { narrateDeepSynthesis, type DeepSynthesisContext, type DeepSynthesisResult } from "./deep-synthesis";
import type { ChartFacts } from "@/lib/astro/interpretations/chart-facts";
import type { Locale } from "@/lib/astro/interpretations/compose";

export type DeepSynthesisType = "natal" | "synastry" | "composite" | "solarReturn";

export interface DeepSynthesisCacheKey {
  type: DeepSynthesisType;
  profileId: string;
  secondaryProfileId?: string | null;
  year?: number | null;
  locale: Locale;
}

export async function getCachedDeepSynthesis(key: DeepSynthesisCacheKey): Promise<DeepSynthesisResult | null> {
  const row = await prisma.deepSynthesis.findFirst({
    where: {
      type: key.type,
      profileId: key.profileId,
      secondaryProfileId: key.secondaryProfileId ?? null,
      year: key.year ?? null,
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

async function saveDeepSynthesis(
  key: DeepSynthesisCacheKey,
  relationshipType: string | null,
  result: DeepSynthesisResult
): Promise<void> {
  await prisma.deepSynthesis.create({
    data: {
      type: key.type,
      profileId: key.profileId,
      secondaryProfileId: key.secondaryProfileId ?? null,
      year: key.year ?? null,
      relationshipType,
      locale: key.locale,
      contentJson: JSON.stringify(result),
    },
  });
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
  context: DeepSynthesisContext,
  relationshipType: string | null = null
): Promise<DeepSynthesisResult | null> {
  const cached = await getCachedDeepSynthesis(key);
  if (cached) return cached;

  const generated = await narrateDeepSynthesis(facts, context, key.locale);
  if (!generated) return null;

  await saveDeepSynthesis(key, relationshipType, generated);
  return generated;
}
