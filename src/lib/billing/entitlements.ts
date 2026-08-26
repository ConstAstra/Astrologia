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
  const count = await prisma.profile.count({ where: { userId, archivedAt: null } });
  return count < FREE_PROFILE_LIMIT;
}

/**
 * Vrai quand un compte non-Premium a plus de profils actifs que la limite
 * gratuite — typiquement juste après la fin d'un abonnement Premium
 * pendant lequel plusieurs profils ont été créés. Sert de verrou global du
 * dashboard (voir layout.tsx) tant que l'utilisateur n'a pas choisi
 * lesquels garder sur /dashboard/profils/choisir.
 */
export async function needsProfileSelection(userId: string): Promise<boolean> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (isPremiumActive(user)) return false;
  const count = await prisma.profile.count({ where: { userId, archivedAt: null } });
  return count > FREE_PROFILE_LIMIT;
}

/**
 * Archive tous les profils actifs du compte SAUF ceux listés dans
 * `keepProfileIds` — jamais une suppression : un profil archivé garde tout
 * son historique et redevient accessible dès qu'un abonnement Premium
 * reprend (voir restoreArchivedProfiles) ou qu'il est réarchivé manuellement.
 * Valide côté serveur que le nombre à garder correspond bien à la limite
 * gratuite et que chaque id appartient réellement à l'utilisateur, pour ne
 * jamais faire confiance à une sélection façonnée côté client.
 */
export async function archiveExcessProfiles(userId: string, keepProfileIds: string[]): Promise<void> {
  if (keepProfileIds.length !== FREE_PROFILE_LIMIT) {
    throw new Error(`Il faut choisir exactement ${FREE_PROFILE_LIMIT} profils à garder.`);
  }
  const owned = await prisma.profile.findMany({
    where: { userId, archivedAt: null },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((p) => p.id));
  if (!keepProfileIds.every((id) => ownedIds.has(id))) {
    throw new Error("Sélection de profils invalide.");
  }

  await prisma.profile.updateMany({
    where: { userId, archivedAt: null, id: { notIn: keepProfileIds } },
    data: { archivedAt: new Date() },
  });
}

/** Désarchive tous les profils du compte — appelé quand un abonnement Premium redevient actif. */
export async function restoreArchivedProfiles(userId: string): Promise<void> {
  await prisma.profile.updateMany({
    where: { userId, archivedAt: { not: null } },
    data: { archivedAt: null },
  });
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

  // La lecture de user.credits ci-dessus n'offre aucune garantie contre deux
  // requêtes concurrentes (même dernier crédit, deux features différentes
  // débloquées en même temps) : le solde n'est vérifié qu'ici, avant la
  // transaction, donc les deux passeraient le test avant que l'une ou
  // l'autre ne décrémente. Le garde-fou réel doit vivre dans la clause WHERE
  // du décrément lui-même (credits >= 1), pas dans un test fait à part :
  // updateMany() ne touchera la ligne que si la condition est encore vraie
  // au moment de l'écriture, et Postgres sérialise les écritures concurrentes
  // sur la même ligne (la seconde requête revoit un solde à jour une fois la
  // première validée).
  const unlocked = await prisma.$transaction(async (tx) => {
    const decremented = await tx.user.updateMany({
      where: { id: userId, credits: { gte: 1 } },
      data: { credits: { decrement: 1 } },
    });
    if (decremented.count === 0) return false;

    await tx.unlock.create({
      data: {
        userId,
        feature: target.feature,
        primaryProfileId: target.primaryProfileId,
        secondaryProfileId: target.secondaryProfileId ?? null,
        method: "credit",
      },
    });
    return true;
  });

  if (!unlocked) {
    throw new PaywallError(target.feature);
  }

  return { method: "credit" };
}
