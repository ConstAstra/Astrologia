import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId, clearSessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getStripe } from "@/lib/billing/stripe";
import { createRateLimiter } from "@/lib/rate-limit";

const MESSAGES = {
  fr: {
    notAuthenticated: "Non authentifié.",
    invalidRequest: "Requête invalide.",
    wrongPassword: "Mot de passe incorrect.",
    tooManyAttempts: "Trop de tentatives, réessayez dans quelques minutes.",
    stripeCancelFailed:
      "Impossible de résilier votre abonnement en cours pour l'instant : votre compte n'a pas été supprimé pour éviter tout prélèvement après coup. Réessayez dans quelques minutes ou contactez-nous.",
  },
  en: {
    notAuthenticated: "Not authenticated.",
    invalidRequest: "Invalid request.",
    wrongPassword: "Incorrect password.",
    tooManyAttempts: "Too many attempts, please try again in a few minutes.",
    stripeCancelFailed:
      "We couldn't cancel your active subscription right now, so your account was not deleted, to avoid any charge afterward. Please try again in a few minutes or contact us.",
  },
} as const;

type Locale = keyof typeof MESSAGES;

// Même raisonnement que change-password/change-email : la vérification du
// mot de passe actuel ne doit pas pouvoir être devinée par essais répétés.
const deleteAccountLimiter = createRateLimiter({ max: 10, windowMs: 5 * 60_000 });

const schema = z.object({
  password: z.string().min(1),
  locale: z.enum(["fr", "en"]).optional(),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: MESSAGES.fr.notAuthenticated }, { status: 401 });

  const body = await request.json().catch(() => null);
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const m = MESSAGES[locale];

  if (deleteAccountLimiter.isLimited(userId)) {
    return NextResponse.json({ error: m.tooManyAttempts }, { status: 429 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: m.invalidRequest }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: m.wrongPassword }, { status: 401 });
  }

  // Résilie l'abonnement Stripe avant de supprimer le compte : une fois la
  // ligne User effacée, l'utilisateur n'a plus aucun moyen d'accéder au
  // portail de facturation pour le faire lui-même. Si la résiliation échoue,
  // on N'EFFACE PAS le compte (le comportement précédent supprimait quand
  // même, laissant l'abonnement actif orphelin — l'utilisateur continuerait
  // à être prélevé sans plus aucun moyen de s'en occuper).
  if (user.entitlementSource === "stripe" && user.stripeSubscriptionId) {
    try {
      await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      console.error(`Échec de la résiliation Stripe lors de la suppression du compte ${user.id}:`, err);
      return NextResponse.json({ error: m.stripeCancelFailed }, { status: 502 });
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
