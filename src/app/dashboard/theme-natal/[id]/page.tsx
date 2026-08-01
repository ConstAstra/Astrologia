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
  describeLifeMission,
  describePlanetInHouse,
  describePlanetInSign,
} from "@/lib/astro/interpretations/compose";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { composeChartSynthesis } from "@/lib/astro/interpretations/synthesis";
import { composeChartHighlights } from "@/lib/astro/interpretations/chart-highlights";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { OverviewCard } from "@/components/chart/OverviewCard";
import { WidgetUrlCard } from "@/components/account/WidgetUrlCard";
import { UnlockGate } from "@/components/billing/UnlockGate";

type Locale = "fr" | "en";

const HOUSE_SYSTEMS: { id: HouseSystem; labelFr: string; labelEn: string }[] = [
  { id: "placidus", labelFr: "Placidus", labelEn: "Placidus" },
  { id: "whole-sign", labelFr: "Signes entiers", labelEn: "Whole sign" },
  { id: "equal", labelFr: "Maisons égales", labelEn: "Equal houses" },
  { id: "porphyry", labelFr: "Porphyre", labelEn: "Porphyry" },
];

const DISPLAY_POINTS: PointKey[] = [...PLANET_KEYS, "asc", "mc"];

const TEXT: Record<
  Locale,
  {
    eyebrow: string;
    unknownTime: string;
    at: string;
    transits: string;
    share: string;
    inBrief: string;
    unreliableHouses: string;
    positions: string;
    house: string;
    degree: string;
    lifeMission: string;
    lifeMissionIntro: string;
    northNode: string;
    southNode: string;
    aspects: string;
    noAspects: string;
    widgetUrlBase: string;
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
    noneDetected: string;
  }
> = {
  fr: {
    eyebrow: "Thème natal",
    unknownTime: "· heure inconnue",
    at: "à",
    transits: "☾ Voir les transits du jour",
    share: "⤓ Carte à partager",
    inBrief: "En bref",
    unreliableHouses:
      "Heure de naissance inconnue : l'Ascendant, le Milieu du Ciel et les maisons ne sont pas affichés, plutôt que d'afficher une estimation trompeuse.",
    positions: "Positions",
    house: "Maison",
    degree: "Degré —",
    lifeMission: "Mission de vie",
    lifeMissionIntro:
      "Lecture de l'axe des Nœuds lunaires : le Nœud Nord comme direction d'évolution à apprivoiser, le Nœud Sud comme terrain déjà acquis à ne pas surinvestir.",
    northNode: "☊ Nœud Nord",
    southNode: "☋ Nœud Sud",
    aspects: "Aspects",
    noAspects: "Aucun aspect détecté dans les orbes retenues.",
    widgetUrlBase: "http://localhost:3000",
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
    noneDetected: "Aucun élément notable détecté ici.",
  },
  en: {
    eyebrow: "Natal chart",
    unknownTime: "· unknown time",
    at: "at",
    transits: "☾ See today's transits",
    share: "⤓ Shareable card",
    inBrief: "In brief",
    unreliableHouses:
      "Unknown birth time: the Ascendant, Midheaven and houses aren't shown, rather than displaying a misleading estimate.",
    positions: "Positions",
    house: "House",
    degree: "Degree —",
    lifeMission: "Life mission",
    lifeMissionIntro:
      "A reading of the lunar Nodes axis: the North Node as a direction of growth to embrace, the South Node as already-familiar ground not to over-invest in.",
    northNode: "☊ North Node",
    southNode: "☋ South Node",
    aspects: "Aspects",
    noAspects: "No aspect detected within the orbs used.",
    widgetUrlBase: "http://localhost:3000",
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
    noneDetected: "No notable element detected here.",
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
    prisma.profile.findFirst({ where: { id, userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

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
  const chartHighlights = composeChartHighlights(chart, aspectKeys, locale);

  const northNode = chart.points.northNode;
  const mission = describeLifeMission(
    signOf(northNode.longitude),
    chart.hasReliableHouses ? northNode.house : undefined,
    locale
  );

  const wheelPoints = DISPLAY_POINTS.filter((k) => chart.points[k] && (chart.hasReliableHouses || PLANET_KEYS.includes(k as (typeof PLANET_KEYS)[number]))).map(
    (k) => ({ key: k, longitude: chart.points[k].longitude })
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
          <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
          <p className="mt-1 text-sm text-muted">
            {profile.birthDate} {profile.timeUnknown ? t.unknownTime : `${t.at} ${profile.birthTime}`} ·{" "}
            {profile.locationName}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/transits/${profile.id}`}
              className="inline-block rounded-full border border-sage/40 px-3 py-1 text-xs text-sage hover:bg-sage/10"
            >
              {t.transits}
            </Link>
            <a
              href={`/api/share/theme-natal/${profile.id}`}
              download={`${profile.label}-theme-astral.png`}
              className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-strong hover:bg-gold/10"
            >
              {t.share}
            </a>
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

      <div className="mt-6">
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
          </Card>
        ) : (
          <UnlockGate feature="synthesis" profileIdA={profile.id} credits={user.credits} locale={locale} />
        )}
      </div>

      <Card className="mt-6 p-5">
        <WidgetUrlCard
          widgetUrl={`${process.env.NEXT_PUBLIC_SITE_URL || t.widgetUrlBase}/api/widget/theme-natal/${profile.id}?token=${profile.widgetToken}`}
          locale={locale}
        />
      </Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[420px_1fr]">
        <Card className="p-4">
          <ChartWheel
            points={wheelPoints}
            ascendant={chart.hasReliableHouses ? chart.houses.ascendant : 0}
            houseCusps={chart.hasReliableHouses ? chart.houses.cusps : Array.from({ length: 12 }, (_, i) => i * 30)}
            aspects={aspects}
            locale={locale}
          />
          {chart.hasReliableHouses && (
            <p className="mt-3 text-center text-xs text-muted">{describeHouseSystem(chart.houses, locale)}</p>
          )}
        </Card>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl">{t.positions}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DISPLAY_POINTS.map((key) => {
                const point = chart.points[key];
                if (!point) return null;
                if (!chart.hasReliableHouses && (key === "asc" || key === "mc")) return null;
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
                      {describeDegree(point.longitude, locale)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">{t.lifeMission}</h2>
            <p className="mt-1 text-xs text-muted">{t.lifeMissionIntro}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{t.northNode}</p>
                  <Badge tone="gold">
                    {signMap[mission.northSign].name}
                    {mission.northHouse ? ` · ${t.house} ${mission.northHouse}` : ""}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{mission.missionSignText}</p>
                {mission.missionHouseText && (
                  <p className="mt-2 text-xs leading-relaxed text-muted">{mission.missionHouseText}</p>
                )}
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
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">{t.aspects}</h2>
            <div className="mt-4 space-y-3">
              {aspects.length === 0 && <p className="text-sm text-muted">{t.noAspects}</p>}
              {aspects.map((aspect, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">
                      {planetMap[aspect.a].symbol} {planetMap[aspect.a].name} {aspectMap[aspect.aspect].symbol}{" "}
                      {planetMap[aspect.b].symbol} {planetMap[aspect.b].name}
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
    </div>
  );
}
