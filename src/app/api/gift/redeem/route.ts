import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { createRateLimiter } from "@/lib/rate-limit";

const MESSAGES = {
  fr: {
    notAuthenticated: "Non authentifié.",
    invalidRequest: "Requête invalide.",
    tooManyAttempts: "Trop de tentatives, réessayez dans quelques minutes.",
    notFound: "Ce code n'existe pas.",
    inactive: "Ce code n'est plus valide.",
    expired: "Ce code a expiré.",
    exhausted: "Ce code a déjà été utilisé le nombre de fois autorisé.",
    alreadyRedeemed: "Vous avez déjà utilisé ce code.",
    successSubscription: "Accès Premium débloqué, profitez-en !",
    successCredits: (n: number) => `${n} crédit${n > 1 ? "s" : ""} ajouté${n > 1 ? "s" : ""} à votre compte !`,
  },
  en: {
    notAuthenticated: "Not authenticated.",
    invalidRequest: "Invalid request.",
    tooManyAttempts: "Too many attempts, please try again in a few minutes.",
    notFound: "This code doesn't exist.",
    inactive: "This code is no longer valid.",
    expired: "This code has expired.",
    exhausted: "This code has already been used the maximum number of times.",
    alreadyRedeemed: "You've already used this code.",
    successSubscription: "Premium access unlocked, enjoy!",
    successCredits: (n: number) => `${n} credit${n > 1 ? "s" : ""} added to your account!`,
  },
} as const;

type Locale = keyof typeof MESSAGES;

// Empêche de tenter de deviner un code par force brute — clé par compte
// (userId) plutôt que par IP, la route est authentifiée.
const redeemLimiter = createRateLimiter({ max: 10, windowMs: 10 * 60_000 });

const schema = z.object({
  code: z.string().trim().min(1),
  locale: z.enum(["fr", "en"]).optional(),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: MESSAGES.fr.notAuthenticated }, { status: 401 });

  const body = await request.json().catch(() => null);
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const m = MESSAGES[locale];

  if (redeemLimiter.isLimited(userId)) {
    return NextResponse.json({ error: m.tooManyAttempts }, { status: 429 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: m.invalidRequest }, { status: 400 });

  const normalizedCode = parsed.data.code.toUpperCase();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const giftCode = await tx.giftCode.findUnique({ where: { code: normalizedCode } });
      if (!giftCode) return { error: m.notFound as string };
      if (!giftCode.active) return { error: m.inactive as string };
      if (giftCode.expiresAt && giftCode.expiresAt.getTime() < Date.now()) return { error: m.expired as string };
      if (giftCode.redemptionCount >= giftCode.maxRedemptions) return { error: m.exhausted as string };

      const alreadyRedeemed = await tx.giftCodeRedemption.findUnique({
        where: { giftCodeId_userId: { giftCodeId: giftCode.id, userId } },
      });
      if (alreadyRedeemed) return { error: m.alreadyRedeemed as string };

      if (giftCode.grantType === "subscription") {
        const currentPeriodEnd = giftCode.durationDays
          ? new Date(Date.now() + giftCode.durationDays * 24 * 60 * 60 * 1000)
          : null;
        // Écrase le suivi Stripe/Apple existant s'il y en avait un — cas rare
        // (offrir Premium à quelqu'un qui paie déjà), acceptable puisque le
        // prochain webhook Stripe/Apple re-synchronisera l'état réel.
        await tx.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "active",
            subscriptionPlan: giftCode.subscriptionPlan,
            entitlementSource: "gift",
            currentPeriodEnd,
          },
        });
      } else {
        const creditsAmount = giftCode.creditsAmount ?? 0;
        await tx.user.update({ where: { id: userId }, data: { credits: { increment: creditsAmount } } });
        await tx.creditGrant.create({
          data: {
            userId,
            source: "gift",
            externalId: `gift:${giftCode.id}:${userId}`,
            creditsAdded: creditsAmount,
          },
        });
      }

      await tx.giftCodeRedemption.create({ data: { giftCodeId: giftCode.id, userId } });
      await tx.giftCode.update({ where: { id: giftCode.id }, data: { redemptionCount: { increment: 1 } } });

      return {
        success: giftCode.grantType === "subscription" ? m.successSubscription : m.successCredits(giftCode.creditsAmount ?? 0),
      };
    });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ message: result.success });
  } catch (err) {
    console.error("[gift:redeem]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: m.invalidRequest }, { status: 500 });
  }
}
