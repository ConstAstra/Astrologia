import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

const MESSAGES = {
  fr: {
    invalidCredentials: "Identifiants invalides.",
    wrongLogin: "E-mail ou mot de passe incorrect.",
    tooManyAttempts: "Trop de tentatives, réessayez dans quelques minutes.",
  },
  en: {
    invalidCredentials: "Invalid credentials.",
    wrongLogin: "Incorrect email or password.",
    tooManyAttempts: "Too many attempts, please try again in a few minutes.",
  },
} as const;

type Locale = keyof typeof MESSAGES;

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

// Protection contre le bourrage d'identifiants (credential stuffing) : une
// IP qui échoue trop de connexions est bloquée temporairement plutôt que de
// pouvoir tester des mots de passe en boucle.
const loginLimiter = createRateLimiter({ max: 10, windowMs: 5 * 60_000 });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const m = MESSAGES[locale];

  if (loginLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: m.tooManyAttempts }, { status: 429 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: m.invalidCredentials }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: m.wrongLogin }, { status: 401 });
  }

  await createSessionCookie(user.id);

  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
