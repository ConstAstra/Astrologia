import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeTransitAspects, computeTransitingPositions } from "@/lib/astro/transits";
import { computeMoonPhase } from "@/lib/astro/moonphase";
import { PLANET_KEYS } from "@/lib/astro/types";
import { signOf, formatLongitude } from "@/lib/astro/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { describeTransitAspect } from "@/lib/astro/interpretations/compose";
import { MOON_PHASE_TEXT } from "@/lib/astro/interpretations/moonphase-content";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";

export default async function TransitsPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId } });
  if (!profile) notFound();

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

  const dateLabel = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <Eyebrow>Transits du jour</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
      <p className="mt-1 text-sm capitalize text-muted">{dateLabel}</p>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl">☾ {moon.name}</p>
          <Badge tone="gold">{Math.round(moon.illuminatedFraction * 100)}% illuminée</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{MOON_PHASE_TEXT[moon.name]}</p>
      </Card>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Planètes en transit aujourd&apos;hui</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLANET_KEYS.map((key) => {
            const point = transiting[key];
            const sign = signOf(point.longitude);
            return (
              <Card key={key} className="p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {PLANET_META[key].symbol} {PLANET_META[key].name}
                  </span>
                  {point.retrograde && <Badge tone="terracotta">Rx</Badge>}
                </div>
                <p className="mt-1 text-gold-strong">
                  {formatLongitude(point.longitude)} {sign}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Aspects actifs majeurs</h2>
        <p className="mt-1 text-xs text-muted">
          Orbes resserrées (un transit se joue sur quelques jours). Les aspects mineurs sont listés plus bas.
        </p>
        <div className="mt-4 space-y-3">
          {majorAspects.length === 0 && (
            <p className="text-sm text-muted">Aucun aspect majeur en transit dans les orbes retenues aujourd&apos;hui.</p>
          )}
          {majorAspects.map((aspect, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">
                  {PLANET_META[aspect.transitingPlanet].symbol} {PLANET_META[aspect.transitingPlanet].name} (transit){" "}
                  {ASPECT_META[aspect.aspect].symbol} {PLANET_META[aspect.natalPoint]?.symbol} {PLANET_META[aspect.natalPoint]?.name} (natal)
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
                  {ASPECT_META[aspect.aspect].name}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{describeTransitAspect(aspect)}</p>
            </Card>
          ))}
        </div>
      </section>

      {minorAspects.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Aspects actifs mineurs</h2>
          <div className="mt-4 space-y-3">
            {minorAspects.map((aspect, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">
                    {PLANET_META[aspect.transitingPlanet].symbol} {PLANET_META[aspect.transitingPlanet].name} (transit){" "}
                    {ASPECT_META[aspect.aspect].symbol} {PLANET_META[aspect.natalPoint]?.symbol} {PLANET_META[aspect.natalPoint]?.name} (natal)
                  </p>
                  <Badge>{ASPECT_META[aspect.aspect].name}</Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{describeTransitAspect(aspect)}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
