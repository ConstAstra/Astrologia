import { NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import { SITE_ACCESS_COOKIE, checkSitePassword, expectedSiteAccessCookieValue, isSiteAccessGateEnabled } from "@/lib/site-access";

const MESSAGES = {
  fr: { invalidRequest: "Requête invalide.", wrongPassword: "Mot de passe incorrect.", tooManyAttempts: "Trop de tentatives, réessayez dans quelques minutes." },
  en: { invalidRequest: "Invalid request.", wrongPassword: "Incorrect password.", tooManyAttempts: "Too many attempts, please try again in a few minutes." },
} as const;

type Locale = keyof typeof MESSAGES;

// Route publique non authentifiée (c'est justement son rôle : déverrouiller
// l'accès) — limite stricte par IP contre le brute-force du mot de passe.
const siteAccessLimiter = createRateLimiter({ max: 8, windowMs: 5 * 60_000 });

const schema = z.object({ password: z.string().min(1), locale: z.enum(["fr", "en"]).optional() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const locale: Locale = body?.locale === "en" ? "en" : "fr";
  const m = MESSAGES[locale];

  if (!isSiteAccessGateEnabled()) return NextResponse.json({ ok: true });

  if (siteAccessLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: m.tooManyAttempts }, { status: 429 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: m.invalidRequest }, { status: 400 });

  if (!checkSitePassword(parsed.data.password)) {
    return NextResponse.json({ error: m.wrongPassword }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SITE_ACCESS_COOKIE, expectedSiteAccessCookieValue()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 90 * 24 * 60 * 60,
  });
  return res;
}
