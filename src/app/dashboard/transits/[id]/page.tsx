import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { isPremiumActive } from "@/lib/billing/entitlements";
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
import { canViewProfile } from "@/lib/friends";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

const FORECAST_DAYS = 7;

const TEXT: Record<Locale, {
  eyebrow: string;
  illuminated: (pct: number) => string;
  planetsToday: string;
  majorAspects: string;
  orbNote: string;
  noMajor: string;
  minorAspects: string;
  today: string;
  tomorrow: string;
  lockedTitle: string;
  lockedBody: string;
  unlock: string;
  unlocksIn: (days: number) => string;
  viewingAsFriend: (name: string) => string;
}> = {
  fr: {
    eyebrow: "Transits",
    illuminated: (pct) => `${pct}% illuminée`,
    planetsToday: "Planètes en transit",
    majorAspects: "Aspects actifs majeurs",
    orbNote: "Orbes resserrées (un transit se joue sur quelques jours). Les aspects mineurs sont listés plus bas.",
    noMajor: "Aucun aspect majeur en transit dans les orbes retenues.",
    minorAspects: "Aspects actifs mineurs",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    lockedTitle: "Voyez venir vos prochains jours",
    lockedBody:
      "Les transits à venir sont réservés à Premium — le thème du jour reste gratuit. Chaque jour se débloque automatiquement à sa date (revenez le voir), ou tout de suite avec Premium pour voir toute la semaine d'un coup.",
    unlock: "Débloquer avec Premium",
    unlocksIn: (days) => (days === 1 ? "débloque demain" : `débloque dans ${days} j`),
    viewingAsFriend: (name) => `Vous voyez les transits de ${name} en tant qu'ami — lecture seule.`,
  },
  en: {
    eyebrow: "Transits",
    illuminated: (pct) => `${pct}% illuminated`,
    planetsToday: "Planets in transit",
    majorAspects: "Active major aspects",
    orbNote: "Tight orbs (a transit plays out over a few days). Minor aspects are listed further below.",
    noMajor: "No major aspect in transit within the orbs used.",
    minorAspects: "Active minor aspects",
    today: "Today",
    tomorrow: "Tomorrow",
    lockedTitle: "See your upcoming days coming",
    lockedBody:
      "Upcoming transits are a Premium feature — today's chart stays free. Each day unlocks on its own automatically (come back to see it), or unlock the whole week at once right now with Premium.",
    unlock: "Unlock with Premium",
    unlocksIn: (days) => (days === 1 ? "unlocks tomorrow" : `unlocks in ${days}d`),
    viewingAsFriend: (name) => `You're viewing ${name}'s transits as a friend — read-only.`,
  },
};

export default async function TransitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const { day } = await searchParams;

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
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const moonTextMap = locale === "en" ? MOON_PHASE_TEXT_EN : MOON_PHASE_TEXT;

  const offset = Math.min(FORECAST_DAYS, Math.max(0, Number.parseInt(day ?? "0", 10) || 0));
  const isPremium = isPremiumActive(user);
  const locked = offset > 0 && !isPremium;

  const today = new Date();
  const target = new Date(today);
  target.setDate(today.getDate() + offset);

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

  const transitAspects = computeTransitAspects(chart, target);
  const majorAspects = transitAspects.filter((a) => a.major);
  const minorAspects = transitAspects.filter((a) => !a.major);
  const transiting = computeTransitingPositions(target);
  const moon = computeMoonPhase(target);

  const dateLabel = target.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const moonLabel = locale === "en" ? MOON_PHASE_LABEL_EN[moon.name] : moon.name;

  const dayTabs = Array.from({ length: FORECAST_DAYS + 1 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label =
      i === 0
        ? t.today
        : i === 1
          ? t.tomorrow
          : d.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { weekday: "short", day: "numeric" });
    return { offset: i, label };
  });

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{displayLabel}</h1>
      <p className="mt-1 text-sm capitalize text-muted">{dateLabel}</p>
      {!isOwner && (
        <p className="mt-2 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-strong">
          {t.viewingAsFriend(displayLabel)}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {dayTabs.map((tab) => (
          <Link
            key={tab.offset}
            href={`?day=${tab.offset}`}
            title={tab.offset > 0 && !isPremium ? t.unlocksIn(tab.offset) : undefined}
            className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${
              tab.offset === offset
                ? "border-gold-strong bg-gold/10 text-gold-strong"
                : "border-border-soft text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.offset > 0 && !isPremium && (
              <span className="ml-1 whitespace-nowrap text-[10px] normal-case opacity-70">
                🔒{locale === "en" ? `${tab.offset}d` : `${tab.offset}j`}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className={`relative mt-6 ${locked ? "max-h-[640px] overflow-hidden" : ""}`}>
        <div className={locked ? "pointer-events-none select-none blur-sm" : undefined} aria-hidden={locked}>
          <Card className="p-6">
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

        {locked && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="mx-4 max-w-sm p-6 text-center shadow-[0_20px_60px_-15px_#00000090]">
                <p className="font-display text-xl">{t.lockedTitle}</p>
                <div className="mt-2">
                  <Badge tone="gold">🔒 {t.unlocksIn(offset)}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted">{t.lockedBody}</p>
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
