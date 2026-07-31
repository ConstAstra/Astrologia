import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";

const MESSAGES = {
  fr: { invalidCredentials: "Identifiants invalides.", wrongLogin: "E-mail ou mot de passe incorrect." },
  en: { invalidCredentials: "Invalid credentials.", wrongLogin: "Incorrect email or password." },
} as const;

type Locale = keyof typeof MESSAGES;

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const m = MESSAGES[locale];

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
