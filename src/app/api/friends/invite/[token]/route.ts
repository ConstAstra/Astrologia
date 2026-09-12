import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeBigThree } from "@/lib/astro/dominance";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { areFriends } from "@/lib/friends";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

// Endpoint public (la page d'invitation n'exige pas d'être connecté pour
// voir qui invite), donc protégé par IP plutôt que par compte.
const inviteTeaserLimiter = createRateLimiter({ max: 30, windowMs: 5 * 60_000 });

/** Aperçu de l'inviteur pour la page /amis/[token] — jamais sa date/heure/lieu de naissance exacts, seulement son prénom et son signe solaire. */
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (inviteTeaserLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const { token } = await params;
  const invite = await prisma.friendInvite.findUnique({
    where: { token },
    include: { user: { include: { profiles: { where: { isSelf: true }, take: 1 } } } },
  });
  if (!invite || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invitation invalide ou expirée." }, { status: 404 });
  }

  const viewerId = await getCurrentUserId();
  const isOwnInvite = viewerId === invite.userId;
  const alreadyFriends = viewerId && !isOwnInvite ? await areFriends(viewerId, invite.userId) : false;

  const selfProfile = invite.user.profiles[0];
  let sunSign: string | null = null;
  let sunSymbol: string | null = null;
  if (selfProfile) {
    const chart = computeNatalChart(
      {
        date: selfProfile.birthDate,
        time: selfProfile.birthTime,
        tzName: selfProfile.tzName,
        latitude: selfProfile.latitude,
        longitude: selfProfile.longitude,
        timeUnknown: selfProfile.timeUnknown,
      },
      "placidus"
    );
    const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
    const locale = invite.user.locale === "en" ? "en" : "fr";
    const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
    sunSign = signMap[big3.sun].name;
    sunSymbol = signMap[big3.sun].symbol;
  }

  return NextResponse.json({
    inviterName: invite.user.name,
    locale: invite.user.locale === "en" ? "en" : "fr",
    sunSign,
    sunSymbol,
    isOwnInvite,
    alreadyFriends,
    isAuthenticated: viewerId !== null,
  });
}
