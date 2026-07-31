import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeBigThree } from "@/lib/astro/dominance";
import { computeMoonPhase } from "@/lib/astro/moonphase";
import { computeTransitAspects } from "@/lib/astro/transits";
import { SIGN_META } from "@/lib/astro/interpretations/signs";

export const runtime = "nodejs";

/**
 * Résumé du jour au format JSON, pensé pour un widget iOS (WidgetKit) — voir
 * ios/App/AstrologiaWidget/. WidgetKit ne partage pas les cookies de
 * session du navigateur ; l'accès passe donc par `Profile.widgetToken`
 * (jeton opaque dédié) plutôt que par l'authentification classique.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Jeton manquant." }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({ where: { id, widgetToken: token } });
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable ou jeton invalide." }, { status: 404 });
  }

  const now = new Date();
  const chart = computeNatalChart(
    {
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    },
    "placidus"
  );

  const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
  const moon = computeMoonPhase(now);
  const transitAspects = computeTransitAspects(chart, now);
  const featured = transitAspects.find((a) => a.major) ?? transitAspects[0];

  return NextResponse.json({
    label: profile.label,
    date: now.toISOString().slice(0, 10),
    sunSign: SIGN_META[big3.sun].name,
    sunSymbol: SIGN_META[big3.sun].symbol,
    moonSign: SIGN_META[big3.moon].name,
    ascendantSign: big3.ascendant ? SIGN_META[big3.ascendant].name : null,
    moonPhase: moon.name,
    moonIlluminatedPercent: Math.round(moon.illuminatedFraction * 100),
    transitHeadline: featured
      ? `${featured.transitingPlanet} ${featured.aspect} ${featured.natalPoint}`
      : null,
  });
}
