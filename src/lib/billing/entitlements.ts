import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

// Volontairement bas : assez pour tester la synastrie (vous + 1 autre)
// sans lever toute pression à passer Premium, qui vend justement les
// profils illimités comme argument.
export const FREE_PROFILE_LIMIT = 3;
export const REFERRAL_REWARD_CREDITS = 2;

/**
 * Crédite le parrain ET le filleul dès le premier achat réel de ce dernier
 * (abonnement ou pack de crédits, Stripe ou Apple) — jamais à l'inscription
 * seule, pour limiter la fraude aux faux comptes. Idempotent via
 * `referralRewardGranted` : ne récompense jamais deux fois le même filleul.
 */
export async function grantReferralRewardOnce(referredUserId: string): Promise<void> {
  const referred = await prisma.user.findUnique({ where: { id: referredUserId } });
  if (!referred || !referred.referredByUserId || referred.referralRewardGranted) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: referred.id },
      data: { credits: { increment: REFERRAL_REWARD_CREDITS }, referralRewardGranted: true },
    }),
    prisma.user.update({
      where: { id: referred.referredByUserId },
      data: { credits: { increment: REFERRAL_REWARD_CREDITS } },
    }),
  ]);
}

export type UnlockFeature = "synastry" | "composite" | "astrocartography" | "synthesis" | "lifeMission";

export class PaywallError extends Error {
  constructor(public feature: UnlockFeature) {
    super(`Fonctionnalité verrouillée : ${feature}`);
  }
}

// Un compte admin (ADMIN_EMAILS) a toujours accès à Premium, sans jamais
// passer par Stripe : utile pour tester l'app en conditions réelles, et
// cohérent avec le principe déjà appliqué à l'accès admin lui-même (une
// variable d'environnement, jamais un champ modifiable en base).
export function isPremiumActive(user: { email: string; subscriptionStatus: string; currentPeriodEnd: Date | null }) {
  if (isAdminEmail(user.email)) return true;
  if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") return false;
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

// Halo doré sur l'avatar : abonnement Premium actif OU série de connexions
// d'au moins ce nombre de jours consécutifs — jamais un choix, toujours
// gagné (voir /lib/streak.ts pour les paliers de série).
export const STREAK_GLOW_THRESHOLD = 7;

export function isAvatarGlowing(user: { email: string; subscriptionStatus: string; currentPeriodEnd: Date | null; currentStreak: number }) {
  return isPremiumActive(user) || user.currentStreak >= STREAK_GLOW_THRESHOLD;
}

/** Ordre canonique pour qu'une paire (A,B) et (B,A) désignent le même déblocage. */
export function canonicalPair(a: string, b?: string | null): [string, string | undefined] {
  if (!b) return [a, undefined];
  return (a < b ? [a, b] : [b, a]) as [string, string];
}

export async function canCreateProfile(userId: string): Promise<boolean> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (isPremiumActive(user)) return true;
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
  if (isPremiumActive(user)) return true;

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

  if (isPremiumActive(user)) {
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
