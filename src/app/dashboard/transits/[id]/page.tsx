import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeTransitAspects, computeTransitingPositions } from "@/lib/astro/transits";
import { computeMoonPhase } from "@/lib/astro/moonphase";
import { PLANET_KEYS } from "@/lib/astro/types";
import { signOf, formatLongitude } from "@/lib/astro/signs";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { describeTransitAspect, type Locale } from "@/lib/astro/interpretations/compose";
import { MOON_PHASE_TEXT } from "@/lib/astro/interpretations/moonphase-content";
import { MOON_PHASE_TEXT_EN, MOON_PHASE_LABEL_EN } from "@/lib/astro/interpretations/moonphase-content.en";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";

const TEXT: Record<Locale, {
  eyebrow: string;
  illuminated: (pct: number) => string;
  planetsToday: string;
  majorAspects: string;
  orbNote: string;
  noMajor: string;
  minorAspects: string;
}> = {
  fr: {
    eyebrow: "Transits du jour",
    illuminated: (pct) => `${pct}% illuminée`,
    planetsToday: "Planètes en transit aujourd'hui",
    majorAspects: "Aspects actifs majeurs",
    orbNote: "Orbes resserrées (un transit se joue sur quelques jours). Les aspects mineurs sont listés plus bas.",
    noMajor: "Aucun aspect majeur en transit dans les orbes retenues aujourd'hui.",
    minorAspects: "Aspects actifs mineurs",
  },
  en: {
    eyebrow: "Today's Transits",
    illuminated: (pct) => `${pct}% illuminated`,
    planetsToday: "Planets in transit today",
    majorAspects: "Active major aspects",
    orbNote: "Tight orbs (a transit plays out over a few days). Minor aspects are listed further below.",
    noMajor: "No major aspect in transit within today's orbs.",
    minorAspects: "Active minor aspects",
  },
};

export default async function TransitsPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const moonTextMap = locale === "en" ? MOON_PHASE_TEXT_EN : MOON_PHASE_TEXT;

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

  const transitAspects = computeTransitAspects(chart, now);
  const majorAspects = transitAspects.filter((a) => a.major);
  const minorAspects = transitAspects.filter((a) => !a.major);
  const transiting = computeTransitingPositions(now);
  const moon = computeMoonPhase(now);

  const dateLabel = now.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const moonLabel = locale === "en" ? MOON_PHASE_LABEL_EN[moon.name] : moon.name;

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
      <p className="mt-1 text-sm capitalize text-muted">{dateLabel}</p>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl">☾ {moonLabel}</p>
          <Badge tone="gold">{t.illuminated(Math.round(moon.illuminatedFraction * 100))}</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{moonTextMap[moon.name]}</p>
      </Card>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t.planetsToday}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLANET_KEYS.map((key) => {
            const point = transiting[key];
            const sign = signOf(point.longitude);
            return (
              <Card key={key} className="p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {planetMap[key].symbol} {planetMap[key].name}
                  </span>
                  {point.retrograde && <Badge tone="terracotta">Rx</Badge>}
                </div>
                <p className="mt-1 text-gold-strong">
                  {formatLongitude(point.longitude)} {signMap[sign].name}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t.majorAspects}</h2>
        <p className="mt-1 text-xs text-muted">{t.orbNote}</p>
        <div className="mt-4 space-y-3">
          {majorAspects.length === 0 && <p className="text-sm text-muted">{t.noMajor}</p>}
          {majorAspects.map((aspect, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">
                  {planetMap[aspect.transitingPlanet].symbol} {planetMap[aspect.transitingPlanet].name} (transit){" "}
                  {aspectMap[aspect.aspect].symbol} {planetMap[aspect.natalPoint]?.symbol} {planetMap[aspect.natalPoint]?.name} (natal)
                </p>
                <Badge
                  tone={
                    ASPECT_META[aspect.aspect].tone === "harmonieux"
                      ? "sage"
                      : ASPECT_META[aspect.aspect].tone === "tendu"
                        ? "terracotta"
                        : "neutral"
                  }
                >
                  {aspectMap[aspect.aspect].name}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{describeTransitAspect(aspect, locale)}</p>
            </Card>
          ))}
        </div>
      </section>

      {minorAspects.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">{t.minorAspects}</h2>
          <div className="mt-4 space-y-3">
            {minorAspects.map((aspect, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">
                    {planetMap[aspect.transitingPlanet].symbol} {planetMap[aspect.transitingPlanet].name} (transit){" "}
                    {aspectMap[aspect.aspect].symbol} {planetMap[aspect.natalPoint]?.symbol} {planetMap[aspect.natalPoint]?.name} (natal)
                  </p>
                  <Badge>{aspectMap[aspect.aspect].name}</Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{describeTransitAspect(aspect, locale)}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
