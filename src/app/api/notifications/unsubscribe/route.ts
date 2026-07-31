import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Lien cliqué depuis l'e-mail, sans session : le jeton opaque (imprévisible,
// unique par utilisateur) fait office d'autorisation.
export async function GET(request: Request) {
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
