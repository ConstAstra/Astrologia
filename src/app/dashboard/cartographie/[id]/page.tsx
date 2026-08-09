import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAstrocartography } from "@/lib/astro/astrocartography";
import { computeCountryLineMatches, rankCountriesForCategory } from "@/lib/astro/astrocartography-countries";
import { THEME_CATEGORIES, CATEGORY_LABELS } from "@/lib/astro/interpretations/astrocartography-categories";
import { MAJOR_COUNTRIES } from "@/components/map/majorCountries";
import { MAJOR_COUNTRIES_EN } from "@/components/map/majorCountries.en";
import { projectAstroCartoLines } from "@/components/map/ProjectedLine";
import { AstrocartographyMap } from "@/components/map/AstrocartographyMap";
import { describeAstroCartoLine, explainCountryRanking, type Locale } from "@/lib/astro/interpretations/compose";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { LINE_TYPE_META } from "@/lib/astro/interpretations/astrocartography-content";
import { LINE_TYPE_META_EN } from "@/lib/astro/interpretations/astrocartography-content.en";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { UnlockGate } from "@/components/billing/UnlockGate";
import { HappyPlacesPostcardButton } from "@/components/dashboard/HappyPlacesPostcardButton";

const HIGHLIGHT_PLANETS = ["sun", "moon", "venus", "jupiter"] as const;

const TEXT: Record<Locale, {
  eyebrow: string;
  timeUnknown: string;
  instructions: string;
  mainLines: string;
  premium: string;
  bestPlacesHeading: string;
  bestPlacesIntro: string;
  noRanking: string;
  postcardLabel: string;
}> = {
  fr: {
    eyebrow: "Cartographie astrologique",
    timeUnknown:
      "La cartographie astrologique repose entièrement sur l'heure exacte de naissance (elle détermine les angles Ascendant/Milieu du Ciel dont dépendent toutes les lignes). Ce profil a une heure de naissance inconnue : nous préférons ne rien afficher plutôt que produire une carte trompeuse. Ajoutez l'heure de naissance sur ce profil pour débloquer cet outil.",
    instructions:
      "Cliquez sur une planète ou un type de ligne pour l'afficher/la masquer. MC/IC sont des méridiens (droites) ; AC/DC sont des courbes qui dépendent de la latitude — voir la page « La méthode ».",
    mainLines: "Vos lignes principales",
    premium: "Premium",
    bestPlacesHeading: "Meilleurs endroits pour vous",
    bestPlacesIntro:
      "À partir des pays où vos lignes passent réellement (frontières exactes, pas une simple proximité) — classés selon vos lignes les plus favorables à chaque thème.",
    noRanking: "Aucun pays de la liste ne ressort particulièrement pour ce thème.",
    postcardLabel: "Vos 3 endroits les plus heureux, tous thèmes confondus, en carte à partager :",
  },
  en: {
    eyebrow: "Astrocartography",
    timeUnknown:
      "Astrocartography relies entirely on the exact birth time (it determines the Ascendant/Midheaven angles that all lines depend on). This profile has an unknown birth time: we'd rather show nothing than produce a misleading map. Add the birth time on this profile to unlock this tool.",
    instructions:
      "Click a planet or a line type to show/hide it. MC/IC are meridians (straight lines); AC/DC are curves that depend on latitude — see the \"Methodology\" page.",
    mainLines: "Your main lines",
    premium: "Premium",
    bestPlacesHeading: "Best places for you",
    bestPlacesIntro:
      "Based on the countries your lines actually cross (real borders, not just nearby coordinates) — ranked by your most favorable lines for each theme.",
    noRanking: "No country in the list particularly stands out for this theme.",
    postcardLabel: "Your 3 happiest places overall, as a shareable card:",
  },
};

export default async function CartographiePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const { country: selectedCountryId } = await searchParams;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];

  if (profile.timeUnknown) {
    return (
      <div>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
        <Card className="mt-8 p-8 text-center">
          <p className="text-muted">{t.timeUnknown}</p>
        </Card>
      </div>
    );
  }

  const access = await hasFeatureAccess(userId, { feature: "astrocartography", primaryProfileId: profile.id });

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

  const lines = computeAstrocartography(chart);
  const mapData = projectAstroCartoLines(lines, undefined, undefined, locale);

  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const lineTypeMap = locale === "en" ? LINE_TYPE_META_EN : LINE_TYPE_META;
  const countryList = locale === "en" ? MAJOR_COUNTRIES_EN : MAJOR_COUNTRIES;
  const countryName = (countryId: string) => countryList.find((c) => c.id === countryId)?.name ?? countryId;
  const sortedCountryOptions = [...countryList].sort((a, b) => a.name.localeCompare(b.name, locale));

  const countryMatches = computeCountryLineMatches(lines);

  if (!access) {
    return (
      <div>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t.instructions}</p>

        <div className="mt-6">
          <AstrocartographyMap
            data={mapData}
            locale={locale}
            countryMatches={countryMatches}
            countries={sortedCountryOptions}
            initialSelectedCountryId={selectedCountryId}
            locked
          />
        </div>

        <div className="mt-8">
          <UnlockGate feature="astrocartography" profileIdA={profile.id} credits={user.credits} locale={locale} />
        </div>
      </div>
    );
  }

  const rankingsByCategory = THEME_CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[locale][category],
    ranked: rankCountriesForCategory(category, countryMatches).slice(0, 3),
  }));

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t.instructions}</p>

      <div className="mt-6">
        <AstrocartographyMap
          data={mapData}
          locale={locale}
          countryMatches={countryMatches}
          countries={sortedCountryOptions}
          initialSelectedCountryId={selectedCountryId}
        />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t.mainLines}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HIGHLIGHT_PLANETS.flatMap((planet) =>
            (["MC", "AC"] as const).map((type) => (
              <Card key={`${planet}-${type}`} className="p-4 text-sm">
                <p className="leading-relaxed text-muted">{describeAstroCartoLine(planet, type, locale)}</p>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl">{t.bestPlacesHeading}</h2>
          <Badge tone="gold">{t.premium}</Badge>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-muted">{t.bestPlacesIntro}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted">{t.postcardLabel}</p>
          <HappyPlacesPostcardButton profileId={profile.id} locale={locale} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {rankingsByCategory.map(({ category, label, ranked }) => (
            <Card key={category} className="p-4">
              <p className="font-medium">{label}</p>
              {ranked.length === 0 ? (
                <p className="mt-2 text-sm text-muted">{t.noRanking}</p>
              ) : (
                <ol className="mt-2 space-y-2 text-sm">
                  {ranked.map((r, i) => (
                    <li key={r.countryId}>
                      <p className="text-gold-strong">
                        {i + 1}. {countryName(r.countryId)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {r.supportingLines
                          .map((l) => `${planetMap[l.planet].symbol} ${planetMap[l.planet].name} — ${lineTypeMap[l.type].name}`)
                          .join(" · ")}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted/80">
                        {explainCountryRanking(r.supportingLines, locale)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
