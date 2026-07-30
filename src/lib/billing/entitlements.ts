import { prisma } from "@/lib/db";

export const FREE_PROFILE_LIMIT = 6;

export type UnlockFeature = "synastry" | "composite" | "astrocartography";

export class PaywallError extends Error {
  constructor(public feature: UnlockFeature) {
    super(`Fonctionnalité verrouillée : ${feature}`);
  }
}

function isSubscriptionActive(user: { subscriptionStatus: string; currentPeriodEnd: Date | null }) {
  if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") return false;
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

/** Ordre canonique pour qu'une paire (A,B) et (B,A) désignent le même déblocage. */
export function canonicalPair(a: string, b?: string | null): [string, string | undefined] {
  if (!b) return [a, undefined];
  return (a < b ? [a, b] : [b, a]) as [string, string];
}

export async function canCreateProfile(userId: string): Promise<boolean> {
  const count = await prisma.profile.count({ where: { userId } });
  return count < FREE_PROFILE_LIMIT;
}

interface FeatureTarget {
  feature: UnlockFeature;
  primaryProfileId: string;
  secondaryProfileId?: string | null;
}

/** Le thème natal seul est toujours gratuit et illimité — c'est la porte d'entrée du produit. */
export async function hasFeatureAccess(userId: string, target: FeatureTarget): Promise<boolean> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (isSubscriptionActive(user)) return true;

  const existing = await prisma.unlock.findFirst({
    where: {
      userId,
      feature: target.feature,
      primaryProfileId: target.primaryProfileId,
      secondaryProfileId: target.secondaryProfileId ?? null,
    },
  });
  return Boolean(existing);
}

/**
 * Débloque une fonctionnalité payante : gratuit si abonnement actif (on
 * journalise quand même l'accès), sinon consomme 1 crédit et enregistre le
 * déblocage définitivement (relire la même synastrie/composite/carto ne
 * recoûte jamais rien).
 */
export async function unlockFeature(userId: string, target: FeatureTarget): Promise<{ method: "subscription" | "credit" | "already-unlocked" }> {
  const alreadyUnlocked = await prisma.unlock.findFirst({
    where: {
      userId,
      feature: target.feature,
      primaryProfileId: target.primaryProfileId,
      secondaryProfileId: target.secondaryProfileId ?? null,
    },
  });
  if (alreadyUnlocked) return { method: "already-unlocked" };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (isSubscriptionActive(user)) {
    await prisma.unlock.create({
      data: {
        userId,
        feature: target.feature,
        primaryProfileId: target.primaryProfileId,
        secondaryProfileId: target.secondaryProfileId ?? null,
        method: "subscription",
      },
    });
    return { method: "subscription" };
  }

  if (user.credits < 1) {
    throw new PaywallError(target.feature);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { credits: { decrement: 1 } } }),
    prisma.unlock.create({
      data: {
        userId,
        feature: target.feature,
        primaryProfileId: target.primaryProfileId,
        secondaryProfileId: target.secondaryProfileId ?? null,
        method: "credit",
      },
    }),
  ]);

  return { method: "credit" };
}
