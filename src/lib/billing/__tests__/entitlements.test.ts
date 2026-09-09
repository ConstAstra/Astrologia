import { describe, it, expect, afterEach, vi } from "vitest";
import { isPremiumActive, isAvatarGlowing, grantReferralRewardOnce, REFERRAL_REWARD_CREDITS } from "../entitlements";
import { prisma } from "@/lib/db";

const baseUser = { email: "someone@example.com", subscriptionStatus: "free", currentPeriodEnd: null as Date | null };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isPremiumActive", () => {
  it("is true for an active subscription", () => {
    expect(isPremiumActive({ ...baseUser, subscriptionStatus: "active" })).toBe(true);
  });

  it("is true for a trialing subscription", () => {
    expect(isPremiumActive({ ...baseUser, subscriptionStatus: "trialing" })).toBe(true);
  });

  it("is false for a free account", () => {
    expect(isPremiumActive(baseUser)).toBe(false);
  });

  it("is false once currentPeriodEnd is in the past", () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    expect(isPremiumActive({ ...baseUser, subscriptionStatus: "active", currentPeriodEnd: yesterday })).toBe(false);
  });

  it("grants Premium to an admin email even without any subscription", () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    expect(isPremiumActive({ ...baseUser, email: "admin@example.com" })).toBe(true);
  });

  it("matches admin emails case-insensitively", () => {
    vi.stubEnv("ADMIN_EMAILS", "Admin@Example.com");
    expect(isPremiumActive({ ...baseUser, email: "admin@example.com" })).toBe(true);
  });

  it("does not grant Premium to an email absent from ADMIN_EMAILS", () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    expect(isPremiumActive(baseUser)).toBe(false);
  });
});

describe("isAvatarGlowing", () => {
  it("glows for an admin even with a low streak and no subscription", () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    expect(isAvatarGlowing({ ...baseUser, email: "admin@example.com", currentStreak: 0 })).toBe(true);
  });

  it("does not glow for a non-admin free account with a low streak", () => {
    expect(isAvatarGlowing({ ...baseUser, currentStreak: 0 })).toBe(false);
  });
});

// Régression pour la course sur referralRewardGranted : Stripe et Apple
// peuvent tous deux déclencher grantReferralRewardOnce plusieurs fois en
// quasi-simultané pour le même achat (voir le commentaire dans la fonction).
// Ce test appelle directement la fonction (pas de session/cookie en jeu)
// avec un vrai Promise.all, donc une vraie concurrence, contrairement aux
// tests d'API qui doivent passer par un jar de cookies partagé.
describe("grantReferralRewardOnce race condition", () => {
  async function createUser(email: string) {
    return prisma.user.create({
      data: { email, passwordHash: "x", referralCode: `${email}-code` },
    });
  }

  it("credits the referrer and the referred user exactly once even when called concurrently", async () => {
    const referrer = await createUser(`vitest-referrer-${Date.now()}@example.com`);
    const referred = await createUser(`vitest-referred-${Date.now()}@example.com`);
    await prisma.user.update({ where: { id: referred.id }, data: { referredByUserId: referrer.id } });

    await Promise.all([grantReferralRewardOnce(referred.id), grantReferralRewardOnce(referred.id)]);

    const [referrerAfter, referredAfter] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: referrer.id } }),
      prisma.user.findUniqueOrThrow({ where: { id: referred.id } }),
    ]);
    expect(referredAfter.credits).toBe(REFERRAL_REWARD_CREDITS);
    expect(referredAfter.referralRewardGranted).toBe(true);
    expect(referrerAfter.credits).toBe(REFERRAL_REWARD_CREDITS);
  });

  it("does nothing once already granted", async () => {
    const referrer = await createUser(`vitest-referrer2-${Date.now()}@example.com`);
    const referred = await createUser(`vitest-referred2-${Date.now()}@example.com`);
    await prisma.user.update({
      where: { id: referred.id },
      data: { referredByUserId: referrer.id, referralRewardGranted: true },
    });

    await grantReferralRewardOnce(referred.id);

    const referrerAfter = await prisma.user.findUniqueOrThrow({ where: { id: referrer.id } });
    expect(referrerAfter.credits).toBe(0);
  });
});
