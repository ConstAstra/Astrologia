import { randomBytes } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

const MESSAGES = {
  fr: {
    invalidEmail: "Adresse e-mail invalide",
    passwordMin: "8 caractères minimum",
    invalidRequest: "Requête invalide",
    alreadyExists: "Un compte existe déjà avec cet e-mail.",
    genericError: "Une erreur est survenue, réessayez.",
    tooManyAttempts: "Trop de tentatives, réessayez dans quelques minutes.",
  },
  en: {
    invalidEmail: "Invalid email address",
    passwordMin: "8 characters minimum",
    invalidRequest: "Invalid request",
    alreadyExists: "An account already exists with this email.",
    genericError: "Something went wrong, please try again.",
    tooManyAttempts: "Too many attempts, please try again in a few minutes.",
  },
} as const;

type Locale = keyof typeof MESSAGES;

// Anti-spam de création de compte — assez large pour ne jamais gêner un
// usage légitime (plusieurs comptes de test, un foyer derrière la même IP).
const registerLimiter = createRateLimiter({ max: 20, windowMs: 60 * 60_000 });

function buildSchema(locale: Locale) {
  const m = MESSAGES[locale];
  return z.object({
    email: z.string().trim().toLowerCase().email(m.invalidEmail),
    password: z.string().min(8, m.passwordMin),
    name: z.string().trim().min(1).max(100).optional(),
    ref: z.string().trim().min(1).max(20).optional(),
  });
}

function generateReferralCode(): string {
  return randomBytes(5).toString("hex");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const m = MESSAGES[locale];

  if (registerLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: m.tooManyAttempts }, { status: 429 });
  }

  const parsed = buildSchema(locale).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? m.invalidRequest }, { status: 400 });
  }
  const { email, password, name, ref } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: m.alreadyExists }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const referrer = ref ? await prisma.user.findUnique({ where: { referralCode: ref } }) : null;

    // Collision de referralCode astronomiquement improbable (5 octets
    // aléatoires) mais on retente une fois proprement plutôt que de planter
    // l'inscription si ça arrivait.
    let user;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            name,
            referralCode: generateReferralCode(),
            referredByUserId: referrer?.id,
          },
        });
        break;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002" && attempt === 0) continue;
        throw err;
      }
    }
    if (!user) {
      return NextResponse.json({ error: m.genericError }, { status: 500 });
    }

    await createSessionCookie(user.id);

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    // Une base injoignable ou un secret manquant en prod plantait ici sans
    // filet : Next.js renvoyait alors une page d'erreur HTML au lieu de
    // JSON, que le client ne pouvait pas parser (voir safe-json.ts).
    console.error("[auth:register]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: m.genericError }, { status: 500 });
  }
}
