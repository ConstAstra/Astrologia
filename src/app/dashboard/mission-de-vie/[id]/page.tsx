import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAspects } from "@/lib/astro/aspects";
import { PLANET_KEYS } from "@/lib/astro/types";
import type { PointKey } from "@/lib/astro/types";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { describeLifeMission } from "@/lib/astro/interpretations/life-mission";
import { buildLunarNodeFacts } from "@/lib/astro/interpretations/lunar-node-facts";
import { getOrGenerateLifeMissionSynthesis } from "@/lib/ai/deep-synthesis-cache";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { canViewProfile } from "@/lib/friends";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { UnlockGate } from "@/components/billing/UnlockGate";

type Locale = "fr" | "en";

// Mêmes points que la roue du thème natal (northNode inclus via PLANET_KEYS) :
// nécessaire pour que les aspects vers le Nœud Nord soient bien détectés.
const DISPLAY_POINTS: PointKey[] = [
  "sun",
  "asc",
  ...PLANET_KEYS.filter((k) => k !== "sun"),
  "mc",
  "fortune",
];

const TEXT: Record<
  Locale,
  {
    eyebrow: string;
    at: string;
    unknownTime: string;
    backToChart: string;
    viewingAsFriend: (name: string) => string;
    house: string;
    lifeMissionIntro: string;
    lifeMissionPremium: string;
    northNode: string;
    southNode: string;
    lifeMissionRulerHeading: string;
    lifeMissionAspectsHeading: string;
    lifeMissionAspectsIntro: string;
    lifeMissionSynthesisHeading: string;
    aspects: string;
    noAspects: string;
  }
> = {
  fr: {
    eyebrow: "Mission de vie",
    at: "à",
    unknownTime: "· heure inconnue",
    backToChart: "← Voir le thème natal complet",
    viewingAsFriend: (name) => `Vous voyez la mission de vie de ${name} en tant qu'ami : lecture seule.`,
    house: "Maison",
    lifeMissionIntro:
      "Lecture de l'axe des Nœuds lunaires : le Nœud Nord comme direction d'évolution à apprivoiser, le Nœud Sud comme terrain déjà acquis à ne pas surinvestir.",
    lifeMissionPremium: "Premium",
    northNode: "☊ Nœud Nord",
    southNode: "☋ Nœud Sud",
    lifeMissionRulerHeading: "Le maître de ton Nœud Nord",
    lifeMissionAspectsHeading: "Ce qui soutient ou complique cette trajectoire",
    lifeMissionAspectsIntro: "Les planètes qui font un aspect à ton Nœud Nord : un appui direct, ou une friction à travailler.",
    lifeMissionSynthesisHeading: "En pratique",
    aspects: "Aspects",
    noAspects: "Aucun aspect détecté dans les orbes retenues.",
  },
  en: {
    eyebrow: "Life mission",
    at: "at",
    unknownTime: "· unknown time",
    backToChart: "← See the full natal chart",
    viewingAsFriend: (name) => `You're viewing ${name}'s life mission as a friend: read-only.`,
    house: "House",
    lifeMissionIntro:
      "A reading of the lunar Nodes axis: the North Node as a direction of growth to embrace, the South Node as already-familiar ground not to over-invest in.",
    lifeMissionPremium: "Premium",
    northNode: "☊ North Node",
    southNode: "☋ South Node",
    lifeMissionRulerHeading: "Your North Node's ruler",
    lifeMissionAspectsHeading: "What supports or complicates this path",
    lifeMissionAspectsIntro: "The planets that form an aspect to your North Node: a direct boost, or a friction to work with.",
    lifeMissionSynthesisHeading: "In practice",
    aspects: "Aspects",
    noAspects: "No aspect detected within the orbs used.",
  },
};

export default async function MissionDeViePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, archivedAt: null } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

  const isOwner = profile.userId === userId;
  if (!isOwner && !(await canViewProfile(userId, profile))) notFound();

  const ownerUser = isOwner ? user : await prisma.user.findUniqueOrThrow({ where: { id: profile.userId } });
  const displayLabel = isOwner ? profile.label : ownerUser.name?.trim() || profile.label;

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;

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

  const aspectKeys: PointKey[] = chart.hasReliableHouses ? DISPLAY_POINTS : [...PLANET_KEYS];
  const aspects = computeAspects(chart.points, aspectKeys);
  const mission = describeLifeMission(chart, aspects, locale);

  const lifeMissionAccess = await hasFeatureAccess(userId, { feature: "lifeMission", primaryProfileId: profile.id });
  let lifeMissionNarration = null;
  if (lifeMissionAccess) {
    const lunarNodeFacts = buildLunarNodeFacts(chart, aspects, locale);
    lifeMissionNarration = await getOrGenerateLifeMissionSynthesis(
      { type: "lifeMission", profileId: profile.id, locale },
      lunarNodeFacts
    );
  }

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{displayLabel}</h1>
      <p className="mt-1 text-sm text-muted">
        {profile.birthDate} {profile.timeUnknown ? t.unknownTime : `${t.at} ${profile.birthTime}`} · {profile.locationName}
      </p>
      {!isOwner && (
        <p className="mt-2 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-strong">
          {t.viewingAsFriend(displayLabel)}
        </p>
      )}
      <Link href={`/dashboard/theme-natal/${profile.id}`} className="mt-3 inline-block text-sm text-muted hover:text-gold-strong">
        {t.backToChart}
      </Link>

      <div className="mt-6">
        <p className="mt-1 text-xs text-muted">{t.lifeMissionIntro}</p>
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold/50 bg-gold/10 text-lg text-gold-strong">
              ☊
            </span>
            <div className="flex flex-1 items-center justify-between gap-2">
              <p className="font-medium">{t.northNode}</p>
              <Badge tone="gold">
                {signMap[mission.northSign].name}
                {mission.northHouse ? ` · ${t.house} ${mission.northHouse}` : ""}
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{mission.missionSignText}</p>
        </Card>

        {lifeMissionAccess ? (
          <div className="mt-4 space-y-4">
            <Card className="overflow-hidden p-6">
              <div className="flex items-center justify-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/50 bg-gold/10 text-2xl text-gold-strong">
                    ☊
                  </span>
                  <p className="text-sm font-medium">{signMap[mission.northSign].name}</p>
                  <p className="text-[11px] text-muted">{t.northNode}</p>
                </div>
                <div className="h-px max-w-16 flex-1 bg-gradient-to-r from-gold/50 via-border-soft to-border-soft sm:max-w-24" />
                <div className="flex flex-col items-center gap-2 text-center opacity-75">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border-soft text-2xl text-muted">
                    ☋
                  </span>
                  <p className="text-sm font-medium">{signMap[mission.southSign].name}</p>
                  <p className="text-[11px] text-muted">{t.southNode}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{t.southNode}</p>
                <Badge>
                  {signMap[mission.southSign].name}
                  {mission.southHouse ? ` · ${t.house} ${mission.southHouse}` : ""}
                </Badge>
              </div>
              {lifeMissionNarration ? (
                <p className="mt-2 text-xs leading-relaxed text-muted">{lifeMissionNarration.comfort}</p>
              ) : (
                <>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.comfortSignText}</p>
                  {mission.comfortHouseText && (
                    <p className="mt-2 text-xs leading-relaxed text-muted">{mission.comfortHouseText}</p>
                  )}
                </>
              )}
            </Card>

            <Card className="p-4">
              <p className="font-medium">
                {t.lifeMissionRulerHeading}, {planetMap[mission.rulerPlanet].symbol} {planetMap[mission.rulerPlanet].name}
              </p>
              {lifeMissionNarration ? (
                <p className="mt-2 text-xs leading-relaxed text-muted">{lifeMissionNarration.ruler}</p>
              ) : (
                <>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.rulerIntro}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.rulerSignText}</p>
                  {mission.rulerHouseText && (
                    <p className="mt-2 text-xs leading-relaxed text-muted">{mission.rulerHouseText}</p>
                  )}
                </>
              )}
            </Card>

            <Card className="p-4">
              <p className="font-medium">{t.lifeMissionAspectsHeading}</p>
              <p className="mt-1 text-xs text-muted/70">{t.lifeMissionAspectsIntro}</p>
              {mission.nodeAspects.length === 0 ? (
                <p className="mt-2 text-xs text-muted">{t.noAspects}</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {mission.nodeAspects.map((na, i) => (
                    <div key={i} className="border-t border-border-soft pt-3 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-medium">
                          {planetMap[na.otherPoint].symbol} {planetMap[na.otherPoint].name} {aspectMap[na.aspect.aspect].symbol}
                        </p>
                        <Badge
                          tone={
                            aspectMap[na.aspect.aspect].tone === "harmonieux"
                              ? "sage"
                              : aspectMap[na.aspect.aspect].tone === "tendu"
                                ? "terracotta"
                                : "neutral"
                          }
                        >
                          {aspectMap[na.aspect.aspect].name}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{na.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <p className="font-medium">{t.lifeMissionSynthesisHeading}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{lifeMissionNarration?.synthesis ?? mission.synthesis}</p>
            </Card>
          </div>
        ) : (
          <div className="mt-4">
            <UnlockGate feature="lifeMission" profileIdA={profile.id} credits={user.credits} locale={locale} compact />
          </div>
        )}
      </div>
    </div>
  );
}
