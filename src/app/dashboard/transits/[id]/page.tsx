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
import { composeTransitDaySummary } from "@/lib/astro/interpretations/day-summary";
import { MOON_PHASE_TEXT } from "@/lib/astro/interpretations/moonphase-content";
import { MOON_PHASE_TEXT_EN, MOON_PHASE_LABEL_EN } from "@/lib/astro/interpretations/moonphase-content.en";
import { composeSocialWeather } from "@/lib/astro/interpretations/social-weather";
import { EVENT_TYPES, composeEventBriefing, type EventType } from "@/lib/astro/interpretations/event-transits";
import { narrateEventBriefing } from "@/lib/ai/event-reading";
import { createRateLimiter } from "@/lib/rate-limit";
import { canViewProfile } from "@/lib/friends";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { TransitCheckIn } from "@/components/dashboard/TransitCheckIn";
import { TransitWheel } from "@/components/chart/TransitWheel";

const EVENT_TYPE_SET = new Set<string>(EVENT_TYPES);
function isEventType(value: string | undefined): value is EventType {
  return !!value && EVENT_TYPE_SET.has(value);
}

// Limite les appels IA (payants) par utilisateur, indépendamment du reste de
// la page — jamais bloquant : au-delà du seuil, on retombe silencieusement
// sur la synthèse gabarit plutôt que d'afficher une erreur.
const eventAiLimiter = createRateLimiter({ max: 20, windowMs: 60 * 60_000 });

const FORECAST_DAYS = 7;

const TEXT: Record<Locale, {
  eyebrow: string;
  transitIntro: string;
  illuminated: (pct: number) => string;
  planetsToday: string;
  majorAspects: string;
  orbNote: string;
  noMajor: string;
  minorAspects: string;
  todayVsNatal: string;
  natalSuffix: string;
  retrogradeLabel: string;
  retrogradeNote: string;
  daySummaryTitle: string;
  daySummaryPremiumBadge: string;
  daySummaryLockedBody: string;
  daySummaryUnlock: string;
  today: string;
  tomorrow: string;
  lockedTitle: string;
  lockedBody: string;
  unlock: string;
  unlocksIn: (days: number) => string;
  viewingAsFriend: (name: string) => string;
  datePickerLabel: string;
  datePickerSubmit: string;
  socialHeading: string;
  socialIntro: string;
  socialHighlights: string;
  socialCautions: string;
  socialNoHouses: string;
  eventSelectLabel: string;
  eventSelectNone: string;
  eventHeading: (label: string) => string;
  eventPertinent: string;
  eventTypeLabels: Record<EventType, string>;
  checkInStatsLine: (confirmed: number, total: number, pct: number) => string;
  checkInStatsGoodBadge: string;
}> = {
  fr: {
    eyebrow: "Transits",
    transitIntro:
      "Le ciel bouge chaque jour, et ça vous touche directement : quand une planète en mouvement touche un point sensible de votre thème de naissance, quelque chose s'active, parfois une ambiance, parfois un événement concret. C'est ce qu'on appelle un « transit » : la position des planètes aujourd'hui, comparée à celle qu'elles occupaient le jour de votre naissance.",
    illuminated: (pct) => `${pct}% illuminée`,
    planetsToday: "Planètes en transit",
    majorAspects: "Aspects actifs majeurs",
    orbNote:
      "Seuls les contacts les plus serrés sont retenus ici (leur écart à l'exact, qu'on appelle l'« orbe », est faible) — un transit se joue sur quelques jours. Les aspects mineurs, plus discrets, sont listés plus bas.",
    noMajor: "Aucun aspect majeur en transit dans les orbes retenues.",
    minorAspects: "Aspects actifs mineurs",
    todayVsNatal: "aujourd'hui, vers votre",
    natalSuffix: " natal",
    retrogradeLabel: "Rétrograde",
    retrogradeNote:
      "« Rétrograde » : vue depuis la Terre, la planète semble reculer dans le ciel — un effet d'optique dû aux vitesses orbitales, mais que la tradition lit comme un temps de relecture plutôt que d'action pour ce qu'elle représente.",
    daySummaryTitle: "Résumé du jour",
    daySummaryPremiumBadge: "Premium",
    daySummaryLockedBody:
      "Une lecture d'ensemble de la journée en un paragraphe, plutôt qu'une liste d'aspects à recomposer soi-même — réservée à Premium.",
    daySummaryUnlock: "Débloquer avec Premium",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    lockedTitle: "Voyez venir vos prochains jours",
    lockedBody:
      "Les transits à venir sont réservés à Premium — le thème du jour reste gratuit. Chaque jour se débloque automatiquement à sa date (revenez le voir), ou tout de suite avec Premium pour voir toute la semaine d'un coup.",
    unlock: "Débloquer avec Premium",
    unlocksIn: (days) => (days === 1 ? "débloque demain" : `débloque dans ${days} j`),
    viewingAsFriend: (name) => `Vous voyez les transits de ${name} en tant qu'ami — lecture seule.`,
    datePickerLabel: "Vérifier une autre date (pour préparer un événement)",
    datePickerSubmit: "Voir",
    socialHeading: "Angle social",
    socialIntro:
      "Dans quelles maisons tombent vos planètes personnelles ce jour-là — utile pour juger si c'est plutôt le bon moment pour recevoir du monde ou pour un cercle plus restreint.",
    socialHighlights: "Ce qui joue pour vous",
    socialCautions: "À surveiller",
    socialNoHouses: "Heure de naissance inconnue : cet angle a besoin de vos maisons, donc de l'heure exacte.",
    eventSelectLabel: "Pour quel événement ?",
    eventSelectNone: "— optionnel —",
    eventHeading: (label) => `Lecture pour : ${label}`,
    eventPertinent: "pertinent",
    eventTypeLabels: { voyage: "Voyage", anniversaire: "Anniversaire", mariage: "Mariage", soutenance: "Soutenance / examen" },
    checkInStatsLine: (confirmed, total, pct) => `Sur ${total} avis donnés, ${confirmed} lecture${confirmed > 1 ? "s" : ""} jugée${confirmed > 1 ? "s" : ""} confirmée${confirmed > 1 ? "s" : ""} (${pct}%).`,
    checkInStatsGoodBadge: "Bien vu",
  },
  en: {
    eyebrow: "Transits",
    transitIntro:
      "The sky moves every day, and it touches you directly: when a moving planet hits a sensitive point in your birth chart, something activates, sometimes a mood, sometimes a concrete event. That's what a \"transit\" is: where the planets sit today, compared to where they sat on the day you were born.",
    illuminated: (pct) => `${pct}% illuminated`,
    planetsToday: "Planets in transit",
    majorAspects: "Active major aspects",
    orbNote:
      "Only the tightest contacts are kept here (their gap to exact, called the \"orb\", is small) — a transit plays out over a few days. The subtler minor aspects are listed further below.",
    noMajor: "No major aspect in transit within the orbs used.",
    minorAspects: "Active minor aspects",
    todayVsNatal: "today, reaching your",
    natalSuffix: " (natal)",
    retrogradeLabel: "Retrograde",
    retrogradeNote:
      "\"Retrograde\": seen from Earth, the planet appears to move backward across the sky — an optical effect of orbital speeds, but one tradition reads as a time for revisiting rather than acting on whatever that planet represents.",
    daySummaryTitle: "Day summary",
    daySummaryPremiumBadge: "Premium",
    daySummaryLockedBody: "A one-paragraph overview of the day, instead of a list of aspects to piece together yourself — a Premium feature.",
    daySummaryUnlock: "Unlock with Premium",
    today: "Today",
    tomorrow: "Tomorrow",
    lockedTitle: "See your upcoming days coming",
    lockedBody:
      "Upcoming transits are a Premium feature — today's chart stays free. Each day unlocks on its own automatically (come back to see it), or unlock the whole week at once right now with Premium.",
    unlock: "Unlock with Premium",
    unlocksIn: (days) => (days === 1 ? "unlocks tomorrow" : `unlocks in ${days}d`),
    viewingAsFriend: (name) => `You're viewing ${name}'s transits as a friend — read-only.`,
    datePickerLabel: "Check another date (to plan an event)",
    datePickerSubmit: "View",
    socialHeading: "Social angle",
    socialIntro:
      "Which houses your personal planets fall into that day — useful for judging whether it's more a good moment to host people, or better suited to a smaller circle.",
    socialHighlights: "What's working for you",
    socialCautions: "Worth watching",
    socialNoHouses: "Unknown birth time: this angle needs your houses, so the exact time.",
    eventSelectLabel: "For which event?",
    eventSelectNone: "— optional —",
    eventHeading: (label) => `Reading for: ${label}`,
    eventPertinent: "relevant",
    eventTypeLabels: { voyage: "Trip", anniversaire: "Birthday", mariage: "Wedding", soutenance: "Thesis defense / exam" },
    checkInStatsLine: (confirmed, total, pct) => `Out of ${total} reading${total > 1 ? "s" : ""} rated, ${confirmed} felt accurate (${pct}%).`,
    checkInStatsGoodBadge: "Spot on",
  },
};

// Un jour tapé au format "YYYY-MM-DD" au-delà de la fenêtre des 7 onglets,
// pour préparer un événement à une date arbitraire (ex : un anniversaire
// dans plusieurs semaines) — plutôt qu'un simple raccourci vers l'un des
// 7 onglets. Bornée à ±5 ans pour rester dans la plage fiable du moteur
// éphéméride ; au-delà, on retombe silencieusement sur le paramètre `day`.
function parseDateParam(value: string | undefined, today: Date): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const parsed = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffDays = Math.abs(parsed.getTime() - today.getTime()) / 86_400_000;
  return diffDays > 5 * 365 ? null : parsed;
}

function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ASPECT_TONE_LABEL: Record<Locale, Record<"harmonieux" | "tendu" | "neutre", string>> = {
  fr: { harmonieux: "porteur", tendu: "tendu", neutre: "neutre" },
  en: { harmonieux: "supportive", tendu: "tense", neutre: "neutral" },
};
function aspectToneLabel(tone: "harmonieux" | "tendu" | "neutre", locale: Locale): string {
  return ASPECT_TONE_LABEL[locale][tone];
}

export default async function TransitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string; date?: string; event?: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const { day, date: dateParam, event: eventParam } = await searchParams;
  const eventType = isEventType(eventParam) ? eventParam : null;

  const [profile, user] = await Promise.all([
    prisma.profile.findUnique({ where: { id, archivedAt: null } }),
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

  const today = new Date();
  const customDate = parseDateParam(dateParam, today);

  let offset: number;
  let target: Date;
  if (customDate) {
    target = customDate;
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTarget = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate());
    offset = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
  } else {
    offset = Math.min(FORECAST_DAYS, Math.max(0, Number.parseInt(day ?? "0", 10) || 0));
    target = new Date(today);
    target.setDate(today.getDate() + offset);
  }

  const isPremium = isPremiumActive(user);
  const locked = offset > 0 && !isPremium;

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
  const daySummary = isPremium ? composeTransitDaySummary(majorAspects, moon.waxing, locale) : null;
  const wheelAscendant = chart.hasReliableHouses ? chart.houses.ascendant : 0;
  const wheelNatalPoints = PLANET_KEYS.filter((k) => chart.points[k]).map((k) => ({
    key: k,
    longitude: chart.points[k].longitude,
  }));
  const wheelTransitingPoints = PLANET_KEYS.map((k) => ({ key: k, longitude: transiting[k].longitude }));
  const socialWeather = composeSocialWeather(chart, target, transitAspects, locale);

  const eventBriefing = eventType ? composeEventBriefing(chart, target, transitAspects, moon, eventType, locale) : null;
  // L'appel IA coûte réellement de l'argent : jamais déclenché pour du
  // contenu verrouillé (de toute façon masqué par le flou visuel) ni
  // au-delà du débit autorisé — dans les deux cas, la synthèse gabarit
  // déterministe suffit et ne coûte rien.
  const eventNarration = eventBriefing
    ? locked || eventAiLimiter.isLimited(userId)
      ? eventBriefing.templateSynthesis
      : await narrateEventBriefing(eventBriefing, locale)
    : null;

  const dateLabel = target.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const moonLabel = locale === "en" ? MOON_PHASE_LABEL_EN[moon.name] : moon.name;

  // Une lecture ne peut être jugée qu'une fois vécue : le widget de retour
  // n'apparaît que pour aujourd'hui ou un jour passé, jamais pour un jour
  // encore à venir (offset > 0), et seulement pour le propriétaire du
  // profil (l'avis reflète son vécu, pas celui d'un ami en lecture seule).
  const targetDateStr = toDateInputValue(target);
  const [existingCheckIn, checkInStats] = isOwner
    ? await Promise.all([
        offset <= 0
          ? prisma.transitCheckIn.findUnique({ where: { profileId_date: { profileId: profile.id, date: targetDateStr } } })
          : Promise.resolve(null),
        prisma.transitCheckIn.groupBy({ by: ["reaction"], where: { profileId: profile.id }, _count: true }),
      ])
    : [null, []];
  const checkInTotal = checkInStats.reduce((sum, s) => sum + s._count, 0);
  const checkInConfirmed = checkInStats.find((s) => s.reaction === "vrai")?._count ?? 0;

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
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t.transitIntro}</p>
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

      <form className="mt-3 flex flex-wrap items-center gap-2" action="">
        <label htmlFor="transit-date" className="text-xs text-muted">
          {t.datePickerLabel}
        </label>
        <input
          id="transit-date"
          type="date"
          name="date"
          defaultValue={toDateInputValue(target)}
          className="rounded-full border border-border-soft bg-background-elevated px-3 py-1.5 text-xs outline-none focus:border-gold/60"
        />
        <label htmlFor="transit-event" className="text-xs text-muted">
          {t.eventSelectLabel}
        </label>
        <select
          id="transit-event"
          name="event"
          defaultValue={eventType ?? ""}
          className="rounded-full border border-border-soft bg-background-elevated px-3 py-1.5 text-xs outline-none focus:border-gold/60"
        >
          <option value="">{t.eventSelectNone}</option>
          {EVENT_TYPES.map((et) => (
            <option key={et} value={et}>
              {t.eventTypeLabels[et]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-strong hover:bg-gold/10"
        >
          {t.datePickerSubmit}
        </button>
      </form>

      {!locked && (
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between">
            <Eyebrow>{t.daySummaryTitle}</Eyebrow>
            <Badge tone="gold">{t.daySummaryPremiumBadge}</Badge>
          </div>
          {daySummary ? (
            <p className="mt-2 text-sm leading-relaxed">{daySummary}</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">{t.daySummaryLockedBody}</p>
              <ButtonLink href="/dashboard/abonnement" size="sm" className="mt-3">
                {t.daySummaryUnlock}
              </ButtonLink>
            </>
          )}
        </Card>
      )}

      <div className={`relative mt-6 ${locked ? "max-h-[640px] overflow-hidden" : ""}`}>
        <div className={locked ? "pointer-events-none select-none blur-sm" : undefined} aria-hidden={locked}>
          <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="flex flex-col items-center p-6">
              <TransitWheel
                natalPoints={wheelNatalPoints}
                transitingPoints={wheelTransitingPoints}
                ascendant={wheelAscendant}
                crossAspects={majorAspects}
                locale={locale}
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl">☾ {moonLabel}</p>
                <Badge tone="gold">{t.illuminated(Math.round(moon.illuminatedFraction * 100))}</Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{moonTextMap[moon.name]}</p>
              {isOwner && offset <= 0 && (
                <TransitCheckIn
                  profileId={profile.id}
                  date={targetDateStr}
                  initialReaction={existingCheckIn?.reaction as "vrai" | "partiellement" | "pas_du_tout" | null ?? null}
                  locale={locale}
                />
              )}
              {checkInTotal >= 3 && (
                <p className="mt-3 flex items-center gap-2 text-xs text-muted">
                  {Math.round((checkInConfirmed / checkInTotal) * 100) >= 70 && <Badge tone="pop">{t.checkInStatsGoodBadge}</Badge>}
                  {t.checkInStatsLine(checkInConfirmed, checkInTotal, Math.round((checkInConfirmed / checkInTotal) * 100))}
                </p>
              )}
            </Card>
          </div>

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
                      {point.retrograde && <Badge tone="terracotta">{t.retrogradeLabel}</Badge>}
                    </div>
                    <p className="mt-1 text-gold-strong">
                      {formatLongitude(point.longitude)} {signMap[sign].name}
                    </p>
                  </Card>
                );
              })}
            </div>
            {PLANET_KEYS.some((key) => transiting[key].retrograde) && (
              <p className="mt-3 text-xs leading-relaxed text-muted">{t.retrogradeNote}</p>
            )}
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl">{t.socialHeading}</h2>
            {socialWeather ? (
              <>
                <p className="mt-1 max-w-2xl text-sm text-muted">{t.socialIntro}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {socialWeather.placements.map((p) => (
                    <Card key={p.planet} className="p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {planetMap[p.planet].symbol} {planetMap[p.planet].name}
                        </span>
                        <Badge tone={p.flavor === "social" ? "sage" : p.flavor === "intime" ? "terracotta" : "neutral"}>
                          {p.houseName.split("—")[0].trim()}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">{p.houseKeyword}</p>
                    </Card>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">{socialWeather.synthesis}</p>
                {socialWeather.highlights.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-sage">{t.socialHighlights}</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted">
                      {socialWeather.highlights.map((h, i) => (
                        <li key={i} className="leading-relaxed">
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {socialWeather.cautions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-terracotta">{t.socialCautions}</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted">
                      {socialWeather.cautions.map((c, i) => (
                        <li key={i} className="leading-relaxed">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">{t.socialNoHouses}</p>
            )}
          </section>

          {eventBriefing && (
            <section className="mt-10">
              <h2 className="font-display text-2xl">{t.eventHeading(eventBriefing.eventLabel)}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{eventNarration}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {eventBriefing.housePlacements.map((p) => (
                  <Card key={p.planet} className="p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {planetMap[p.planet].symbol} {planetMap[p.planet].name}
                      </span>
                      {p.isFocus && <Badge tone="gold">{t.eventPertinent}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {p.houseName} — {p.houseKeyword}
                    </p>
                  </Card>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {eventBriefing.aspects.map((a, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-start justify-between gap-3 text-xs leading-relaxed text-muted">
                      <span>{a.text}</span>
                      <div className="flex shrink-0 gap-1">
                        {a.isFocus && <Badge tone="gold">{t.eventPertinent}</Badge>}
                        <Badge tone={a.tone === "harmonieux" ? "sage" : a.tone === "tendu" ? "terracotta" : "neutral"}>
                          {aspectToneLabel(a.tone, locale)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <h2 className="font-display text-2xl">{t.majorAspects}</h2>
            <p className="mt-1 text-xs text-muted">{t.orbNote}</p>
            <div className="mt-4 space-y-3">
              {majorAspects.length === 0 && <p className="text-sm text-muted">{t.noMajor}</p>}
              {majorAspects.map((aspect, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">
                      {planetMap[aspect.transitingPlanet].symbol} {planetMap[aspect.transitingPlanet].name}{" "}
                      <span className="font-normal text-muted">{t.todayVsNatal}</span>{" "}
                      {planetMap[aspect.natalPoint]?.symbol} {planetMap[aspect.natalPoint]?.name}
                      {t.natalSuffix}
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
                        {planetMap[aspect.transitingPlanet].symbol} {planetMap[aspect.transitingPlanet].name}{" "}
                        <span className="font-normal text-muted">{t.todayVsNatal}</span>{" "}
                        {planetMap[aspect.natalPoint]?.symbol} {planetMap[aspect.natalPoint]?.name}
                        {t.natalSuffix}
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
