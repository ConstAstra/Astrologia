import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAstrocartography } from "@/lib/astro/astrocartography";
import { projectAstroCartoLines } from "@/components/map/ProjectedLine";
import { AstrocartographyMap } from "@/components/map/AstrocartographyMap";
import { describeAstroCartoLine, type Locale } from "@/lib/astro/interpretations/compose";
import { Card, Eyebrow } from "@/components/ui/Card";
import { UnlockGate } from "@/components/billing/UnlockGate";

const HIGHLIGHT_PLANETS = ["sun", "moon", "venus", "jupiter"] as const;

const TEXT: Record<Locale, {
  eyebrow: string;
  timeUnknown: string;
  instructions: string;
  mainLines: string;
}> = {
  fr: {
    eyebrow: "Cartographie astrologique",
    timeUnknown:
      "La cartographie astrologique repose entièrement sur l'heure exacte de naissance (elle détermine les angles Ascendant/Milieu du Ciel dont dépendent toutes les lignes). Ce profil a une heure de naissance inconnue : nous préférons ne rien afficher plutôt que produire une carte trompeuse. Ajoutez l'heure de naissance sur ce profil pour débloquer cet outil.",
    instructions:
      "Cliquez sur une planète ou un type de ligne pour l'afficher/la masquer. MC/IC sont des méridiens (droites) ; AC/DC sont des courbes qui dépendent de la latitude — voir la page « La méthode ».",
    mainLines: "Vos lignes principales",
  },
  en: {
    eyebrow: "Astrocartography",
    timeUnknown:
      "Astrocartography relies entirely on the exact birth time (it determines the Ascendant/Midheaven angles that all lines depend on). This profile has an unknown birth time: we'd rather show nothing than produce a misleading map. Add the birth time on this profile to unlock this tool.",
    instructions:
      "Click a planet or a line type to show/hide it. MC/IC are meridians (straight lines); AC/DC are curves that depend on latitude — see the \"Methodology\" page.",
    mainLines: "Your main lines",
  },
};

export default async function CartographiePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

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

  if (!access) {
    return (
      <div>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
        <div className="mt-8">
          <UnlockGate feature="astrocartography" profileIdA={profile.id} credits={user.credits} locale={locale} />
        </div>
      </div>
    );
  }

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

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t.instructions}</p>

      <div className="mt-6">
        <AstrocartographyMap data={mapData} locale={locale} />
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
    </div>
  );
}
