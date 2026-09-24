import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// Route publique non authentifiée, protégée seulement par le jeton — voir
// le même raisonnement que le widget iOS (widget/theme-natal/[id]/route.ts),
// qui suit le même schéma "jeton opaque public" et est lui aussi limité.
const unsubscribeLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

// Lien cliqué depuis l'e-mail, sans session : le jeton opaque (imprévisible,
// unique par utilisateur) fait office d'autorisation.
export async function GET(request: Request) {
  if (unsubscribeLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 });
  }

  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { unsubscribeToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { dailyHoroscopeOptIn: false } });

  return NextResponse.redirect(new URL("/desabonnement-confirme", request.url));
}
