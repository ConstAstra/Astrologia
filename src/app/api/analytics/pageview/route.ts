import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

// Compteur agrégé, volontairement sans identifiant de visiteur (pas de
// cookie, pas d'IP stockée) : "combien de fois ce chemin a été chargé
// aujourd'hui", jamais "qui l'a chargé" — pas de donnée personnelle, donc
// pas de bandeau de consentement nécessaire pour ce compteur.
const schema = z.object({ path: z.string().trim().min(1).max(300) });

// Route publique non authentifiée : limite par IP pour éviter qu'un abus
// ne gonfle artificiellement les compteurs ou ne remplisse la table.
const pageviewLimiter = createRateLimiter({ max: 60, windowMs: 60_000 });

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  if (pageviewLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // Chemin seul, sans query string (?ref=..., ?utm_...) pour agréger par
  // page réelle plutôt que d'exploser en une ligne par variante d'URL.
  const path = parsed.data.path.split("?")[0].slice(0, 300);
  const date = todayIso();

  await prisma.pageView
    .upsert({
      where: { path_date: { path, date } },
      create: { path, date, count: 1 },
      update: { count: { increment: 1 } },
    })
    .catch((err: unknown) => console.error("[analytics:pageview]", err instanceof Error ? err.message : err));

  return NextResponse.json({ ok: true });
}
