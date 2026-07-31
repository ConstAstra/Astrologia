import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const MESSAGES = {
  fr: {
    notAuthenticated: "Non authentifié.",
    invalidRequest: "Requête invalide.",
    passwordMin: "8 caractères minimum",
    wrongPassword: "Mot de passe actuel incorrect.",
  },
  en: {
    notAuthenticated: "Not authenticated.",
    invalidRequest: "Invalid request.",
    passwordMin: "8 characters minimum",
    wrongPassword: "Current password is incorrect.",
  },
} as const;

type Locale = keyof typeof MESSAGES;

function buildSchema(locale: Locale) {
  const m = MESSAGES[locale];
  return z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, m.passwordMin),
    locale: z.enum(["fr", "en"]).optional(),
  });
}

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
  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: m.wrongPassword }, { status: 401 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
