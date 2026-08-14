import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAspects } from "@/lib/astro/aspects";
import { computeDominance } from "@/lib/astro/dominance";
import { PLANET_KEYS } from "@/lib/astro/types";
import type { HouseSystem, PointKey } from "@/lib/astro/types";
import { signOf } from "@/lib/astro/signs";
import { formatLongitude } from "@/lib/astro/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import {
  describeAspect,
  describeDegree,
  describeHouseSystem,
  describePlanetInHouse,
  describePlanetInSign,
} from "@/lib/astro/interpretations/compose";
import { describeLifeMission } from "@/lib/astro/interpretations/life-mission";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { composeChartSynthesis } from "@/lib/astro/interpretations/synthesis";
import { composeChartHighlights } from "@/lib/astro/interpretations/chart-highlights";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { canViewProfile } from "@/lib/friends";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { OverviewCard } from "@/components/chart/OverviewCard";
import { ShareChartToggle } from "@/components/account/ShareChartToggle";
import { UnlockGate } from "@/components/billing/UnlockGate";
import { ShareCardButton } from "@/components/dashboard/ShareCardButton";

type Locale = "fr" | "en";

const HOUSE_SYSTEMS: { id: HouseSystem; labelFr: string; labelEn: string }[] = [
  { id: "placidus", labelFr: "Placidus", labelEn: "Placidus" },
  { id: "whole-sign", labelFr: "Signes entiers", labelEn: "Whole sign" },
  { id: "equal", labelFr: "Maisons égales", labelEn: "Equal houses" },
  { id: "porphyry", labelFr: "Porphyre", labelEn: "Porphyry" },
];

// L'Ascendant est placé juste après le Soleil (avant la Lune) plutôt qu'en
// toute fin de liste : c'est l'un des "Big 3", pas un point secondaire.
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
    unknownTime: string;
    at: string;
    transits: string;
    solarReturn: string;
    inBrief: string;
    unreliableHouses: string;
    positions: string;
    house: string;
    degree: string;
    lifeMission: string;
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
    ascendantRulerTitle: string;
    signHeading: string;
    houseHeading: string;
    synthesisTitle: string;
    synthesisPremium: string;
    synthesisOverviewHeading: string;
    synthesisAscendantRulerHeading: string;
    synthesisContradictionsHeading: string;
    synthesisContradictionsIntro: string;
    synthesisStrengthsHeading: string;
    synthesisStrengthsIntro: string;
    synthesisLifeDomainsHeading: string;
    synthesisLifeDomainsIntro: string;
    noneDetected: string;
    viewingAsFriend: (name: string) => string;
  }
> = {
  fr: {
    eyebrow: "Thème natal",
    unknownTime: "· heure inconnue",
    at: "à",
    transits: "☾ Voir les transits du jour",
    solarReturn: "✷ Révolution solaire",
    inBrief: "En bref",
    unreliableHouses:
      "Heure de naissance inconnue : l'Ascendant, le Milieu du Ciel et les maisons ne sont pas affichés, plutôt que d'afficher une estimation trompeuse.",
    positions: "Positions",
    house: "Maison",
    degree: "Degré :",
    lifeMission: "Mission de vie",
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
    ascendantRulerTitle: "Maître de l'Ascendant",
    signHeading: "En signe",
    houseHeading: "En maison",
    synthesisTitle: "Lecture de synthèse",
    synthesisPremium: "Premium",
    synthesisOverviewHeading: "Vue d'ensemble",
    synthesisAscendantRulerHeading: "Le maître de l'Ascendant",
    synthesisContradictionsHeading: "Vos contradictions internes",
    synthesisContradictionsIntro: "Là où deux logiques de votre thème tirent dans des directions différentes.",
    synthesisStrengthsHeading: "Vos points d'appui",
    synthesisStrengthsIntro: "Là où plusieurs parties de votre thème travaillent naturellement dans le même sens.",
    synthesisLifeDomainsHeading: "Tous les domaines de votre vie",
    synthesisLifeDomainsIntro: "Maison par maison, ce que votre thème dit de chaque grand domaine, occupé ou non.",
    noneDetected: "Aucun élément notable détecté ici.",
    viewingAsFriend: (name) => `Vous voyez le thème de ${name} en tant qu'ami : lecture seule.`,
  },
  en: {
    eyebrow: "Natal chart",
    unknownTime: "· unknown time",
    at: "at",
    transits: "☾ See today's transits",
    solarReturn: "✷ Solar return",
    inBrief: "In brief",
    unreliableHouses:
      "Unknown birth time: the Ascendant, Midheaven and houses aren't shown, rather than displaying a misleading estimate.",
    positions: "Positions",
    house: "House",
    degree: "Degree:",
    lifeMission: "Life mission",
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
    ascendantRulerTitle: "Ascendant ruler",
    signHeading: "In sign",
    houseHeading: "In house",
    synthesisTitle: "Synthesis reading",
    synthesisPremium: "Premium",
    synthesisOverviewHeading: "Overview",
    synthesisAscendantRulerHeading: "Your Ascendant ruler",
    synthesisContradictionsHeading: "Your internal contradictions",
    synthesisContradictionsIntro: "Where two logics in your chart pull in different directions.",
    synthesisStrengthsHeading: "Your points of strength",
    synthesisStrengthsIntro: "Where several parts of your chart naturally work in the same direction.",
    synthesisLifeDomainsHeading: "Every area of your life",
    synthesisLifeDomainsIntro: "House by house, what your chart says about each major life domain, occupied or not.",
    noneDetected: "No notable element detected here.",
    viewingAsFriend: (name) => `You're viewing ${name}'s chart as a friend: read-only.`,
  },
};

export default async function ThemeNatalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ maisons?: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const { maisons } = await searchParams;

  const [profile, user] = await Promise.all([
    prisma.profile.findUnique({ where: { id } }),
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

  const houseSystem: HouseSystem = (HOUSE_SYSTEMS.find((h) => h.id === maisons)?.id ?? "placidus");

  const chart = computeNatalChart(
    {
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    },
    houseSystem
  );

  const aspectKeys: PointKey[] = chart.hasReliableHouses ? DISPLAY_POINTS : [...PLANET_KEYS];
  const aspects = computeAspects(chart.points, aspectKeys);
  const chartHighlights = composeChartHighlights(chart, locale);

  const mission = describeLifeMission(chart, aspects, locale);
  const lifeMissionAccess = await hasFeatureAccess(userId, { feature: "lifeMission", primaryProfileId: profile.id });

  const wheelPoints = DISPLAY_POINTS.filter((k) => chart.points[k] && (chart.hasReliableHouses || PLANET_KEYS.includes(k as (typeof PLANET_KEYS)[number]))).map(
    (k) => ({ key: k, longitude: chart.points[k].longitude, house: chart.points[k].house })
  );

  const dominance = computeDominance(chart.points, chart.hasReliableHouses);
  const ascendantRuler = dominance.ascendantRuler;
  const ascendantRulerPoint = ascendantRuler ? chart.points[ascendantRuler] : undefined;

  const synthesisAccess = await hasFeatureAccess(userId, { feature: "synthesis", primaryProfileId: profile.id });
  const synthesis = synthesisAccess ? composeChartSynthesis(chart, locale) : null;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="font-display mt-2 text-3xl">{displayLabel}</h1>
          <p className="mt-1 text-sm text-muted">
            {profile.birthDate} {profile.timeUnknown ? t.unknownTime : `${t.at} ${profile.birthTime}`} ·{" "}
            {profile.locationName}
          </p>
          {!isOwner && (
            <p className="mt-2 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-strong">
              {t.viewingAsFriend(displayLabel)}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/transits/${profile.id}`}
              className="inline-block rounded-full border border-sage/40 px-3 py-1 text-xs text-sage hover:bg-sage/10"
            >
              {t.transits}
            </Link>
            <Link
              href={`/dashboard/revolution-solaire/${profile.id}`}
              className="inline-block rounded-full border border-violet/40 px-3 py-1 text-xs text-violet hover:bg-violet/10"
            >
              {t.solarReturn}
            </Link>
            {isOwner && (
              <ShareCardButton
                profileId={profile.id}
                fileName={`${profile.label}-carte-astrale.png`}
                locale={locale}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {HOUSE_SYSTEMS.map((h) => (
            <Link
              key={h.id}
              href={`/dashboard/theme-natal/${profile.id}?maisons=${h.id}`}
              className={`rounded-full border px-3 py-1 ${
                houseSystem === h.id
                  ? "border-gold/50 bg-gold/10 text-gold-strong"
                  : "border-border-soft text-muted hover:text-foreground"
              }`}
            >
              {locale === "en" ? h.labelEn : h.labelFr}
            </Link>
          ))}
        </div>
      </div>

      <Card className="mt-6 p-6">
        <Eyebrow>{t.inBrief}</Eyebrow>
        <ul className="mt-3 space-y-2">
          {chartHighlights.map((line, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed sm:text-base">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-strong" aria-hidden="true" />
              <span className="font-medium text-foreground">{line}</span>
            </li>
          ))}
        </ul>
      </Card>

      {!chart.hasReliableHouses && (
        <Card className="mt-6 border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
          {t.unreliableHouses}
        </Card>
      )}
      {chart.houses.fellBackToWholeSign && (
        <Card className="mt-6 border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
          {describeHouseSystem(chart.houses, locale)}
        </Card>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="p-4">
          <ChartWheel
            points={wheelPoints}
            ascendant={chart.hasReliableHouses ? chart.houses.ascendant : 0}
            houseCusps={chart.hasReliableHouses ? chart.houses.cusps : Array.from({ length: 12 }, (_, i) => i * 30)}
            aspects={aspects}
            locale={locale}
            interactive
          />
          {chart.hasReliableHouses && (
            <p className="mt-3 text-center text-xs text-muted">{describeHouseSystem(chart.houses, locale)}</p>
          )}
        </Card>
        <OverviewCard points={chart.points} hasReliableHouses={chart.hasReliableHouses} locale={locale} />
      </div>

      {ascendantRuler && ascendantRulerPoint && (
        <Card className="mt-6 p-6">
          <Eyebrow>{t.ascendantRulerTitle}</Eyebrow>
          <p className="mt-3 flex items-center gap-2 font-display text-xl">
            <span>{planetMap[ascendantRuler].symbol}</span>
            <span>{planetMap[ascendantRuler].name}</span>
            <span className="text-sm font-normal text-muted">
              {formatLongitude(ascendantRulerPoint.longitude)} {signMap[signOf(ascendantRulerPoint.longitude)].name}
              {ascendantRulerPoint.house ? ` · ${t.house} ${ascendantRulerPoint.house}` : ""}
            </span>
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <p>
              <span className="text-xs uppercase tracking-wide text-muted/70">{t.signHeading} </span>
              {describePlanetInSign(ascendantRuler, signOf(ascendantRulerPoint.longitude), undefined, locale)}
            </p>
            {ascendantRulerPoint.house && (
              <p>
                <span className="text-xs uppercase tracking-wide text-muted/70">{t.houseHeading} </span>
                {describePlanetInHouse(ascendantRuler, ascendantRulerPoint.house, locale)}
              </p>
            )}
          </div>
        </Card>
      )}

      <div className="mt-6">
        {synthesis ? (
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Eyebrow>{t.synthesisTitle}</Eyebrow>
              <Badge tone="gold">{t.synthesisPremium}</Badge>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisOverviewHeading}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{synthesis.overview}</p>
            </div>

            {synthesis.ascendantRulerIntro && (
              <div className="mt-6 border-t border-border-soft pt-6">
                <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisAscendantRulerHeading}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{synthesis.ascendantRulerIntro}</p>
                {synthesis.ascendantRulerSign && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{synthesis.ascendantRulerSign}</p>
                )}
                {synthesis.ascendantRulerHouse && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{synthesis.ascendantRulerHouse}</p>
                )}
              </div>
            )}

            <div className="mt-6 border-t border-border-soft pt-6">
              <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisContradictionsHeading}</p>
              <p className="mt-1 text-xs text-muted/70">{t.synthesisContradictionsIntro}</p>
              <div className="mt-3 space-y-3">
                {synthesis.contradictions.length === 0 ? (
                  <p className="text-sm text-muted">{t.noneDetected}</p>
                ) : (
                  synthesis.contradictions.map((c, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted">
                      {c}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-border-soft pt-6">
              <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisStrengthsHeading}</p>
              <p className="mt-1 text-xs text-muted/70">{t.synthesisStrengthsIntro}</p>
              <div className="mt-3 space-y-3">
                {synthesis.strengths.length === 0 ? (
                  <p className="text-sm text-muted">{t.noneDetected}</p>
                ) : (
                  synthesis.strengths.map((s, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted">
                      {s}
                    </p>
                  ))
                )}
              </div>
            </div>

            {synthesis.lifeDomains.length > 0 && (
              <div className="mt-6 border-t border-border-soft pt-6">
                <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisLifeDomainsHeading}</p>
                <p className="mt-1 text-xs text-muted/70">{t.synthesisLifeDomainsIntro}</p>
                <div className="mt-3 space-y-4">
                  {synthesis.lifeDomains.map((domain) => (
                    <div key={domain.house}>
                      <p className="text-sm font-medium">{domain.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{domain.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <UnlockGate feature="synthesis" profileIdA={profile.id} credits={user.credits} locale={locale} compact />
        )}
      </div>


      {isOwner && profile.isSelf && (
        <Card className="mt-6 p-5">
          <ShareChartToggle profileId={profile.id} initialShared={profile.shareWithFriends} locale={locale} />
        </Card>
      )}

      <div className="mt-8 space-y-8">
          <section>
            <h2 className="font-display text-2xl">{t.positions}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DISPLAY_POINTS.map((key) => {
                const point = chart.points[key];
                if (!point) return null;
                if (!chart.hasReliableHouses && (key === "asc" || key === "mc" || key === "fortune")) return null;
                const meta = planetMap[key];
                const sign = signOf(point.longitude);
                return (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {meta.symbol} {meta.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {point.retrograde && <Badge tone="terracotta">Rx</Badge>}
                        {point.house && <Badge>{t.house} {point.house}</Badge>}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gold-strong">
                      {formatLongitude(point.longitude)} {signMap[sign].name}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{describePlanetInSign(key, sign, undefined, locale)}</p>
                    {point.house && (
                      <p className="mt-2 text-xs leading-relaxed text-muted">{describePlanetInHouse(key, point.house, locale)}</p>
                    )}
                    <p className="mt-2 border-t border-border-soft pt-2 text-xs leading-relaxed text-muted/80">
                      <span className="text-gold-strong/90">{t.degree} </span>
                      {describeDegree(point.longitude, locale, chart.points)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section id="mission-de-vie" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl">{t.lifeMission}</h2>
              {!lifeMissionAccess && <Badge tone="gold">{t.lifeMissionPremium}</Badge>}
            </div>
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
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.comfortSignText}</p>
                  {mission.comfortHouseText && (
                    <p className="mt-2 text-xs leading-relaxed text-muted">{mission.comfortHouseText}</p>
                  )}
                </Card>

                <Card className="p-4">
                  <p className="font-medium">
                    {t.lifeMissionRulerHeading}, {planetMap[mission.rulerPlanet].symbol} {planetMap[mission.rulerPlanet].name}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.rulerIntro}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.rulerSignText}</p>
                  {mission.rulerHouseText && (
                    <p className="mt-2 text-xs leading-relaxed text-muted">{mission.rulerHouseText}</p>
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
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.synthesis}</p>
                </Card>
              </div>
            ) : (
              <div className="mt-4">
                <UnlockGate feature="lifeMission" profileIdA={profile.id} credits={user.credits} locale={locale} compact />
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-2xl">{t.aspects}</h2>
            <div className="mt-4 space-y-3">
              {aspects.length === 0 && <p className="text-sm text-muted">{t.noAspects}</p>}
              {aspects.map((aspect, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">
                      {planetMap[aspect.a].symbol} {planetMap[aspect.a].name}{" "}
                      <span className="font-normal text-muted">↔</span> {planetMap[aspect.b].symbol}{" "}
                      {planetMap[aspect.b].name}
                    </p>
                    <Badge tone={aspectMap[aspect.aspect].tone === "harmonieux" ? "sage" : aspectMap[aspect.aspect].tone === "tendu" ? "terracotta" : "neutral"}>
                      {aspectMap[aspect.aspect].name}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{describeAspect(aspect, "natal", undefined, locale)}</p>
                </Card>
              ))}
            </div>
          </section>
      </div>
    </div>
  );
}
