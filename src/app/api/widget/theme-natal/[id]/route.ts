import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeBigThree } from "@/lib/astro/dominance";
import { computeMoonPhase } from "@/lib/astro/moonphase";
import { computeTransitAspects } from "@/lib/astro/transits";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { MOON_PHASE_LABEL_EN } from "@/lib/astro/interpretations/moonphase-content.en";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Endpoint non authentifié, protégé par un jeton opaque dans l'URL : sans
// limite de débit, une IP pourrait tenter d'énumérer des jetons valides
// (brute force) pour lire les données astrologiques d'un profil qui n'est
// pas le sien.
const widgetLimiter = createRateLimiter({ max: 30, windowMs: 5 * 60_000 });

/**
 * Résumé du jour au format JSON, pensé pour un widget iOS (WidgetKit) — voir
 * ios/App/AstrologiumWidget/. WidgetKit ne partage pas les cookies de
 * session du navigateur ; l'accès passe donc par `Profile.widgetToken`
 * (jeton opaque dédié) plutôt que par l'authentification classique.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (widgetLimiter.isLimited(clientIp(request))) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Jeton manquant." }, { status: 400 });
  }

  const profile = await prisma.profile.findFirst({ where: { id, widgetToken: token, archivedAt: null }, include: { user: true } });
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable ou jeton invalide." }, { status: 404 });
  }

  const locale: "fr" | "en" = profile.user.locale === "en" ? "en" : "fr";
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;

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
    sunSign: signMap[big3.sun].name,
    sunSymbol: signMap[big3.sun].symbol,
    moonSign: signMap[big3.moon].name,
    ascendantSign: big3.ascendant ? signMap[big3.ascendant].name : null,
    moonPhase: locale === "en" ? MOON_PHASE_LABEL_EN[moon.name] : moon.name,
    moonIlluminatedPercent: Math.round(moon.illuminatedFraction * 100),
    transitHeadline: featured
      ? `${planetMap[featured.transitingPlanet].name} ${aspectMap[featured.aspect].symbol} ${planetMap[featured.natalPoint].name}`
      : null,
  });
}
