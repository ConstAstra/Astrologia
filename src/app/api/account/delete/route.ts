import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId, clearSessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getStripe } from "@/lib/billing/stripe";

const MESSAGES = {
  fr: {
    notAuthenticated: "Non authentifié.",
    invalidRequest: "Requête invalide.",
    wrongPassword: "Mot de passe incorrect.",
  },
  en: {
    notAuthenticated: "Not authenticated.",
    invalidRequest: "Invalid request.",
    wrongPassword: "Incorrect password.",
  },
} as const;

type Locale = keyof typeof MESSAGES;

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
  // portail de facturation pour le faire lui-même, et continuerait sinon à
  // être prélevé indéfiniment.
  if (user.entitlementSource === "stripe" && user.stripeSubscriptionId) {
    try {
      await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      console.error(`Échec de la résiliation Stripe lors de la suppression du compte ${user.id}:`, err);
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
