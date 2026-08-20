import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { isPremiumActive } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import {
  computeActiveSolarReturnWindow,
  computeSolarReturnWindowForYear,
  computeSolarReturnChart,
} from "@/lib/astro/solar-return";
import { computeAspects } from "@/lib/astro/aspects";
import { PLANET_KEYS } from "@/lib/astro/types";
import type { PointKey } from "@/lib/astro/types";
import { signOf, formatLongitude } from "@/lib/astro/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import {
  describeAspect,
  describeDegree,
  describePlanetInHouse,
  describePlanetInSign,
} from "@/lib/astro/interpretations/compose";
import { composeChartHighlights } from "@/lib/astro/interpretations/chart-highlights";
import { composeSolarReturnDomains } from "@/lib/astro/interpretations/solar-return-domains";
import { buildChartFacts } from "@/lib/astro/interpretations/chart-facts";
import { getOrGenerateDeepSynthesis } from "@/lib/ai/deep-synthesis-cache";
import type { Locale } from "@/lib/astro/interpretations/compose";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { OverviewCard } from "@/components/chart/OverviewCard";
import { GrimoireOpeningReveal } from "@/components/dashboard/GrimoireOpeningReveal";
import { SolarReturnYearPicker } from "@/components/dashboard/SolarReturnYearPicker";
import { SectionNav } from "@/components/dashboard/SectionNav";
import { CollapsibleAspects } from "@/components/dashboard/CollapsibleAspects";
import type { Aspect } from "@/lib/astro/types";

const DISPLAY_POINTS: PointKey[] = [...PLANET_KEYS, "asc", "mc", "fortune"];

const TEXT: Record<
  Locale,
  {
    eyebrow: string;
    heading: (year: number) => string;
    exactMoment: string;
    validUntil: string;
    locationNote: string;
    inBrief: string;
    grimoireTitle: string;
    grimoireSubtitle: string;
    grimoireAspectsNote: string;
    positions: string;
    house: string;
    degree: string;
    aspects: string;
    noAspects: string;
    lockedTitle: string;
    lockedBody: string;
    unlock: string;
    navOverview: string;
    navGrimoire: string;
    navPositions: string;
    navAspects: string;
    showMoreMinorAspects: (n: number) => string;
    showLessAspects: string;
  }
> = {
  fr: {
    eyebrow: "Révolution solaire",
    heading: (year) => `Votre année ${year}`,
    exactMoment: "Retour exact du Soleil",
    validUntil: "Valable jusqu'au",
    locationNote:
      "Calculée sur votre lieu de naissance : la tradition veut qu'on utilise le lieu où vous vivez au moment du retour, mais nous ne le connaissons pas encore.",
    inBrief: "En bref",
    grimoireTitle: "Le grimoire de votre année",
    grimoireSubtitle: "Le thème de cette révolution solaire résumé bout à bout, chapitre par chapitre, sans entrer dans le détail des aspects.",
    grimoireAspectsNote: "Les aspects détaillés de cette année sont à lire plus bas dans cette page.",
    positions: "Positions de l'année",
    house: "Maison",
    degree: "Degré :",
    aspects: "Aspects de l'année",
    noAspects: "Aucun aspect détecté dans les orbes retenues.",
    lockedTitle: "Votre thème de l'année",
    lockedBody:
      "La révolution solaire — un thème recalculé chaque année à l'anniversaire exact de votre Soleil — est réservée à Premium.",
    unlock: "Débloquer avec Premium",
    navOverview: "Vue d'ensemble",
    navGrimoire: "Grimoire",
    navPositions: "Positions",
    navAspects: "Aspects",
    showMoreMinorAspects: (n) => `Voir ${n} aspect${n > 1 ? "s" : ""} mineur${n > 1 ? "s" : ""} de plus`,
    showLessAspects: "Replier les aspects mineurs",
  },
  en: {
    eyebrow: "Solar return",
    heading: (year) => `Your ${year} year`,
    exactMoment: "Exact solar return",
    validUntil: "Valid until",
    locationNote:
      "Calculated for your birthplace: tradition uses the place you live at the moment of the return, but we don't know it yet.",
    inBrief: "In brief",
    grimoireTitle: "The grimoire of your year",
    grimoireSubtitle: "This solar return chart summarized end to end, chapter by chapter, without going into aspect-by-aspect detail.",
    grimoireAspectsNote: "This year's detailed aspects are further down this page.",
    positions: "This year's positions",
    house: "House",
    degree: "Degree:",
    aspects: "This year's aspects",
    noAspects: "No aspect detected within the orbs used.",
    lockedTitle: "Your chart for the year",
    lockedBody: "The solar return — a chart recalculated every year on your Sun's exact anniversary — is a Premium feature.",
    unlock: "Unlock with Premium",
    navOverview: "Overview",
    navGrimoire: "Grimoire",
    navPositions: "Positions",
    navAspects: "Aspects",
    showMoreMinorAspects: (n) => `Show ${n} more minor aspect${n > 1 ? "s" : ""}`,
    showLessAspects: "Collapse minor aspects",
  },
};

export default async function SolarReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ annee?: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const { annee } = await searchParams;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId, archivedAt: null } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const isPremium = isPremiumActive(user);

  const birthInput = {
    date: profile.birthDate,
    time: profile.birthTime,
    tzName: profile.tzName,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timeUnknown: profile.timeUnknown,
  };

  const natalChart = computeNatalChart(birthInput, "placidus");
  const [birthYear, birthMonth, birthDay] = profile.birthDate.split("-").map(Number);

  const activeWindow = computeActiveSolarReturnWindow(natalChart.points.sun.longitude, birthMonth, birthDay);
  const minYear = birthYear + 1;
  const maxYear = activeWindow.year + 10;
  const requestedYear = Number(annee);
  const selectedYear =
    Number.isInteger(requestedYear) && requestedYear >= minYear && requestedYear <= maxYear
      ? requestedYear
      : activeWindow.year;

  const window =
    selectedYear === activeWindow.year
      ? activeWindow
      : computeSolarReturnWindowForYear(natalChart.points.sun.longitude, birthMonth, birthDay, selectedYear);
  const returnChart = computeSolarReturnChart(birthInput, window.start);

  const aspectKeys = [...PLANET_KEYS, "asc" as const, "mc" as const];
  const highlights = composeChartHighlights(returnChart, locale);
  const aspects = computeAspects(returnChart.points, aspectKeys);
  const solarReturnThemeLabel = locale === "en" ? `solar return for ${window.year}` : `révolution solaire ${window.year}`;
  const solarReturnFacts = buildChartFacts(returnChart, locale);
  const grimoireDomains =
    (isPremium &&
      (await getOrGenerateDeepSynthesis(
        { type: "solarReturn", profileId: profile.id, year: window.year, locale },
        solarReturnFacts,
        { themeLabel: solarReturnThemeLabel }
      ))) ||
    composeSolarReturnDomains(returnChart, window.year, locale);

  const dateFormatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: profile.tzName,
  });
  const shortDateFormatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const wheelPoints = [...PLANET_KEYS, "asc" as const, "mc" as const]
    .filter((k) => returnChart.points[k])
    .map((k) => ({ key: k, longitude: returnChart.points[k].longitude }));

  const locked = !isPremium;

  function renderAspectCard(aspect: Aspect, key: number) {
    return (
      <Card key={key} className="p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium">
            {planetMap[aspect.a].symbol} {planetMap[aspect.a].name}{" "}
            <span className="font-normal text-muted">↔</span> {planetMap[aspect.b].symbol} {planetMap[aspect.b].name}
          </p>
          <Badge tone={aspectMap[aspect.aspect].tone === "harmonieux" ? "sage" : aspectMap[aspect.aspect].tone === "tendu" ? "terracotta" : "neutral"}>
            {aspectMap[aspect.aspect].name}
          </Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{describeAspect(aspect, "natal", undefined, locale)}</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="font-display mt-2 text-3xl">{t.heading(window.year)}</h1>
          <p className="mt-1 text-sm text-muted">
            {t.exactMoment} : {dateFormatter.format(window.start)}
          </p>
          <p className="text-sm text-muted">
            {t.validUntil} {shortDateFormatter.format(window.end)}
          </p>
          <p className="mt-2 max-w-xl text-xs text-muted/70">{t.locationNote}</p>
        </div>
        <SolarReturnYearPicker profileId={profile.id} selectedYear={window.year} minYear={minYear} maxYear={maxYear} locale={locale} />
      </div>

      {!locked && (
        <div className="mt-6">
          <SectionNav
            sections={[
              { id: "vue-ensemble", label: t.navOverview },
              { id: "grimoire", label: t.navGrimoire },
              { id: "positions", label: t.navPositions },
              { id: "aspects", label: t.navAspects },
            ]}
          />
        </div>
      )}

      <div className={`relative mt-6 ${locked ? "max-h-[640px] overflow-hidden" : ""}`}>
        <div id="vue-ensemble" className={`scroll-mt-24 ${locked ? "pointer-events-none select-none blur-sm" : ""}`} aria-hidden={locked}>
          <Card className="p-6">
            <Eyebrow>{t.inBrief}</Eyebrow>
            <ul className="mt-3 space-y-2">
              {highlights.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-strong" aria-hidden="true" />
                  <span className="font-medium text-foreground">{line}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-6">
            <OverviewCard points={returnChart.points} hasReliableHouses={returnChart.hasReliableHouses} locale={locale} />
          </div>

          <Card className="mt-6 flex justify-center p-6">
            <ChartWheel
              points={wheelPoints}
              ascendant={returnChart.houses.ascendant}
              houseCusps={returnChart.houses.cusps}
              aspects={aspects}
              locale={locale}
            />
          </Card>

          <div id="grimoire" className="mt-6 scroll-mt-24">
            <GrimoireOpeningReveal
              storageKey={`grimoire-opened:solarReturn:${profile.id}:${window.year}`}
              domains={grimoireDomains}
              title={t.grimoireTitle}
              subtitle={t.grimoireSubtitle}
              aspectsNote={t.grimoireAspectsNote}
              locale={locale}
            />
          </div>

          <section id="positions" className="mt-8 scroll-mt-24">
            <h2 className="font-display text-2xl">{t.positions}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DISPLAY_POINTS.map((key) => {
                const point = returnChart.points[key];
                if (!point) return null;
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
                    <p className="mt-2 whitespace-pre-line border-t border-border-soft pt-2 text-xs leading-relaxed text-muted/80">
                      <span className="text-gold-strong/90">{t.degree} </span>
                      {describeDegree(point.longitude, locale, returnChart.points)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section id="aspects" className="mt-8 scroll-mt-24">
            <h2 className="font-display text-2xl">{t.aspects}</h2>
            <div className="mt-4">
              {aspects.length === 0 && <p className="text-sm text-muted">{t.noAspects}</p>}
              {aspects.length > 0 && (
                <CollapsibleAspects
                  major={aspects.filter((a) => a.major).map(renderAspectCard)}
                  minor={aspects.filter((a) => !a.major).map(renderAspectCard)}
                  minorCount={aspects.filter((a) => !a.major).length}
                  showMoreLabel={t.showMoreMinorAspects(aspects.filter((a) => !a.major).length)}
                  showLessLabel={t.showLessAspects}
                />
              )}
            </div>
          </section>
        </div>

        {locked && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="mx-4 max-w-sm p-6 text-center shadow-[0_20px_60px_-15px_#00000090]">
                <p className="font-display text-xl">{t.lockedTitle}</p>
                <p className="mt-2 text-sm text-muted">{t.lockedBody}</p>
                <div className="mt-4">
                  <ButtonLink href="/dashboard/abonnement">{t.unlock}</ButtonLink>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
