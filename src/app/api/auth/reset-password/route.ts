import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { consumePasswordResetToken } from "@/lib/auth/passwordReset";
import { createSessionCookie } from "@/lib/auth/session";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import { hasSiteAccess } from "@/lib/site-access";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

// Le jeton a déjà assez d'entropie pour être infaisable à deviner, mais on
// limite quand même le débit de tentatives par IP par défense en profondeur.
const resetPasswordLimiter = createRateLimiter({ max: 10, windowMs: 60 * 60_000 });

export async function POST(request: Request) {
  // Voir la même garde dans /api/auth/register : le Proxy laisse passer
  // tout /api sans vérifier le verrou du site.
  if (!(await hasSiteAccess())) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  if (resetPasswordLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez dans quelques minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mot de passe invalide (8 caractères minimum)." }, { status: 400 });
  }

  const userId = await consumePasswordResetToken(parsed.data.token);
  if (!userId) {
    return NextResponse.json({ error: "Ce lien est invalide ou a expiré." }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await createSessionCookie(userId);

  return NextResponse.json({ ok: true });
}
