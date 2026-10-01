import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Événements de tunnel de conversion (voir ProductEvent dans le schéma) —
 * la liste canonique vit ici pour que le tableau de bord admin et les
 * points d'instrumentation restent synchronisés sans se copier une chaîne
 * de caractères à la main.
 */
export const PRODUCT_EVENTS = [
  "signup",
  "profile_created",
  "paywall_hit",
  "checkout_started",
  "purchase_completed",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

/**
 * Enregistre un événement du tunnel. Ne doit jamais faire échouer le flux
 * qui l'appelle : une écriture analytics ratée (base momentanément
 * indisponible, etc.) ne doit pas empêcher une inscription ou un achat de
 * réussir, donc l'erreur est journalisée puis avalée plutôt que propagée.
 */
export async function trackEvent(
  name: ProductEventName,
  userId: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.productEvent.create({
      data: { name, userId, metadata: metadata as Prisma.InputJsonValue | undefined },
    });
  } catch (err) {
    console.error("[analytics] échec de l'enregistrement de l'événement", name, err);
  }
}
