import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Lien court de parrainage à afficher sur les cartes de partage exportées
 * (image/vidéo) — un lien complet avec "?ref=" long n'est de toute façon pas
 * cliquable une fois republié en pixels sur Instagram/TikTok, mais un lien
 * court reste au moins tapable à la main depuis une story. Redirige vers la
 * page d'inscription dans la langue du parrain plutôt qu'un défaut fixe.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const referrer = await prisma.user.findUnique({ where: { referralCode: code }, select: { locale: true } });
  const target = referrer?.locale === "en" ? `/en/signup?ref=${code}` : `/inscription?ref=${code}`;
  return NextResponse.redirect(new URL(target, request.url));
}
