import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { isPremiumActive } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeActiveSolarReturnWindow, computeSolarReturnChart } from "@/lib/astro/solar-return";
import { computeAspects } from "@/lib/astro/aspects";
import { PLANET_KEYS } from "@/lib/astro/types";
import { composeChartHighlights } from "@/lib/astro/interpretations/chart-highlights";
import type { Locale } from "@/lib/astro/interpretations/compose";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { OverviewCard } from "@/components/chart/OverviewCard";

const TEXT: Record<
  Locale,
  {
    eyebrow: string;
    heading: (year: number) => string;
    exactMoment: string;
    validUntil: string;
    locationNote: string;
    inBrief: string;
    lockedTitle: string;
    lockedBody: string;
    unlock: string;
  }
> = {
  fr: {
    eyebrow: "Révolution solaire",
    heading: (year) => `Votre année ${year}`,
    exactMoment: "Retour exact du Soleil",
    validUntil: "Valable jusqu'au",
    locationNote:
      "Calculée sur votre lieu de naissance — la tradition veut qu'on utilise le lieu où vous vivez au moment du retour, mais nous ne le connaissons pas encore.",
    inBrief: "En bref",
    lockedTitle: "Votre thème de l'année",
    lockedBody:
      "La révolution solaire — un thème recalculé chaque année à l'anniversaire exact de votre Soleil — est réservée à Premium.",
    unlock: "Débloquer avec Premium",
  },
  en: {
    eyebrow: "Solar return",
    heading: (year) => `Your ${year} year`,
    exactMoment: "Exact solar return",
    validUntil: "Valid until",
    locationNote:
      "Calculated for your birthplace — tradition uses the place you live at the moment of the return, but we don't know it yet.",
    inBrief: "In brief",
    lockedTitle: "Your chart for the year",
    lockedBody: "The solar return — a chart recalculated every year on your Sun's exact anniversary — is a Premium feature.",
    unlock: "Unlock with Premium",
  },
};

export default async function SolarReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
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
  const [, birthMonth, birthDay] = profile.birthDate.split("-").map(Number);

  const window = computeActiveSolarReturnWindow(natalChart.points.sun.longitude, birthMonth, birthDay);
  const returnChart = computeSolarReturnChart(birthInput, window.start);

  const aspectKeys = [...PLANET_KEYS, "asc" as const, "mc" as const];
  const highlights = composeChartHighlights(returnChart, locale);
  const aspects = computeAspects(returnChart.points, aspectKeys);

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

  return (
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

      <div className={`relative mt-6 ${locked ? "max-h-[640px] overflow-hidden" : ""}`}>
        <div className={locked ? "pointer-events-none select-none blur-sm" : undefined} aria-hidden={locked}>
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
