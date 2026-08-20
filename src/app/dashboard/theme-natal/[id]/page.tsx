import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAspects } from "@/lib/astro/aspects";
import { computeDominance } from "@/lib/astro/dominance";
import { PLANET_KEYS } from "@/lib/astro/types";
import type { Aspect, HouseSystem, PointKey } from "@/lib/astro/types";
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
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { composeChartDomains } from "@/lib/astro/interpretations/chart-domains";
import { buildChartFacts } from "@/lib/astro/interpretations/chart-facts";
import { getOrGenerateDeepSynthesis } from "@/lib/ai/deep-synthesis-cache";
import { composeChartHighlights } from "@/lib/astro/interpretations/chart-highlights";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { canViewProfile } from "@/lib/friends";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { OverviewCard } from "@/components/chart/OverviewCard";
import { ShareChartToggle } from "@/components/account/ShareChartToggle";
import { UnlockGate } from "@/components/billing/UnlockGate";
import { ShareCardButton } from "@/components/dashboard/ShareCardButton";
import { GrimoireOpeningReveal } from "@/components/dashboard/GrimoireOpeningReveal";
import { SectionNav } from "@/components/dashboard/SectionNav";
import { CollapsibleAspects } from "@/components/dashboard/CollapsibleAspects";

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
    aspects: string;
    noAspects: string;
    ascendantRulerTitle: string;
    ascendantRulerExplainer: string;
    signHeading: string;
    houseHeading: string;
    grimoireTitle: string;
    grimoireSubtitle: string;
    grimoireAspectsNote: string;
    viewingAsFriend: (name: string) => string;
    navOverview: string;
    navGrimoire: string;
    navPositions: string;
    navAspects: string;
    showMoreMinorAspects: (n: number) => string;
    showLessAspects: string;
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
    aspects: "Aspects",
    noAspects: "Aucun aspect détecté dans les orbes retenues.",
    ascendantRulerTitle: "Maître de l'Ascendant",
    ascendantRulerExplainer:
      "Chaque signe a une planète qui le gouverne (son maître) : la position de cette planète dans votre thème colore la façon dont vous vivez concrètement cette première impression.",
    signHeading: "En signe",
    houseHeading: "En maison",
    grimoireTitle: "Le grimoire de votre thème",
    grimoireSubtitle: "Toute la charte résumée bout à bout, chapitre par chapitre, sans entrer dans le détail des aspects.",
    grimoireAspectsNote: "Les aspects détaillés, planète par planète, sont à lire plus bas dans cette page.",
    viewingAsFriend: (name) => `Vous voyez le thème de ${name} en tant qu'ami : lecture seule.`,
    navOverview: "Vue d'ensemble",
    navGrimoire: "Grimoire",
    navPositions: "Positions",
    navAspects: "Aspects",
    showMoreMinorAspects: (n) => `Voir ${n} aspect${n > 1 ? "s" : ""} mineur${n > 1 ? "s" : ""} de plus`,
    showLessAspects: "Replier les aspects mineurs",
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
    aspects: "Aspects",
    noAspects: "No aspect detected within the orbs used.",
    ascendantRulerTitle: "Ascendant ruler",
    ascendantRulerExplainer:
      "Every sign has a planet that rules it (its ruler): where that planet sits in your chart colors how you actually live out that first impression.",
    signHeading: "In sign",
    houseHeading: "In house",
    grimoireTitle: "The grimoire of your chart",
    grimoireSubtitle: "The whole chart summarized end to end, chapter by chapter, without going into aspect-by-aspect detail.",
    grimoireAspectsNote: "The planet-by-planet aspect details are further down this page.",
    viewingAsFriend: (name) => `You're viewing ${name}'s chart as a friend: read-only.`,
    navOverview: "Overview",
    navGrimoire: "Grimoire",
    navPositions: "Positions",
    navAspects: "Aspects",
    showMoreMinorAspects: (n) => `Show ${n} more minor aspect${n > 1 ? "s" : ""}`,
    showLessAspects: "Collapse minor aspects",
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

  const wheelPoints = DISPLAY_POINTS.filter((k) => chart.points[k] && (chart.hasReliableHouses || PLANET_KEYS.includes(k as (typeof PLANET_KEYS)[number]))).map(
    (k) => ({ key: k, longitude: chart.points[k].longitude, house: chart.points[k].house })
  );

  const dominance = computeDominance(chart.points, chart.hasReliableHouses);
  const ascendantRuler = dominance.ascendantRuler;
  const ascendantRulerPoint = ascendantRuler ? chart.points[ascendantRuler] : undefined;

  const synthesisAccess = await hasFeatureAccess(userId, { feature: "synthesis", primaryProfileId: profile.id });
  let grimoireDomains = null;
  if (synthesisAccess) {
    const facts = buildChartFacts(chart, locale);
    const themeLabel = locale === "en" ? "natal chart" : "thème natal";
    grimoireDomains =
      (await getOrGenerateDeepSynthesis({ type: "natal", profileId: profile.id, locale }, facts, { themeLabel })) ??
      composeChartDomains(chart, locale);
  }

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

      <Card className="p-6">
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

      <div id="vue-ensemble" className="mt-6 grid scroll-mt-24 items-start gap-6 lg:grid-cols-[380px_1fr]">
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
          <p className="mt-1 text-xs text-muted">{t.ascendantRulerExplainer}</p>
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

      <div id="grimoire" className="mt-6 scroll-mt-24">
        {grimoireDomains ? (
          <GrimoireOpeningReveal
            storageKey={`grimoire-opened:natal:${profile.id}`}
            domains={grimoireDomains}
            title={t.grimoireTitle}
            subtitle={t.grimoireSubtitle}
            aspectsNote={t.grimoireAspectsNote}
            locale={locale}
          />
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
          <section id="positions" className="scroll-mt-24">
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
                    <p className="mt-2 whitespace-pre-line border-t border-border-soft pt-2 text-xs leading-relaxed text-muted/80">
                      <span className="text-gold-strong/90">{t.degree} </span>
                      {describeDegree(point.longitude, locale, chart.points)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section id="aspects" className="scroll-mt-24">
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
    </div>
  );
}
