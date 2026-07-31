import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

const MESSAGES = {
  fr: {
    notAuthenticated: "Non authentifié.",
    invalidRequest: "Requête invalide.",
    invalidEmail: "Adresse e-mail invalide",
    wrongPassword: "Mot de passe incorrect.",
    alreadyUsed: "Cette adresse e-mail est déjà utilisée par un autre compte.",
  },
  en: {
    notAuthenticated: "Not authenticated.",
    invalidRequest: "Invalid request.",
    invalidEmail: "Invalid email address",
    wrongPassword: "Incorrect password.",
    alreadyUsed: "This email address is already used by another account.",
  },
} as const;

type Locale = keyof typeof MESSAGES;

function buildSchema(locale: Locale) {
  const m = MESSAGES[locale];
  return z.object({
    newEmail: z.string().trim().toLowerCase().email(m.invalidEmail),
    password: z.string().min(1),
    locale: z.enum(["fr", "en"]).optional(),
  });
}

// Simplification volontaire : le changement d'e-mail est immédiat après
// confirmation du mot de passe, sans e-mail de vérification de la nouvelle
// adresse — à ajouter si un cas d'usage de prise de contrôle de compte
// (adresse mal saisie, etc.) devient un problème réel en pratique.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: MESSAGES.fr.notAuthenticated }, { status: 401 });

  const body = await request.json().catch(() => null);
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const m = MESSAGES[locale];

  const parsed = buildSchema(locale).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? m.invalidRequest }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: m.wrongPassword }, { status: 401 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.newEmail } });
  if (existing && existing.id !== userId) {
    return NextResponse.json({ error: m.alreadyUsed }, { status: 409 });
  }

  await prisma.user.update({ where: { id: userId }, data: { email: parsed.data.newEmail } });

  return NextResponse.json({ ok: true, email: parsed.data.newEmail });
}
