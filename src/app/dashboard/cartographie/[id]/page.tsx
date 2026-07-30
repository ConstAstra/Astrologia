import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAstrocartography } from "@/lib/astro/astrocartography";
import { projectAstroCartoLines } from "@/components/map/ProjectedLine";
import { AstrocartographyMap } from "@/components/map/AstrocartographyMap";
import { describeAstroCartoLine } from "@/lib/astro/interpretations/compose";
import { Card, Eyebrow } from "@/components/ui/Card";
import { UnlockGate } from "@/components/billing/UnlockGate";

const HIGHLIGHT_PLANETS = ["sun", "moon", "venus", "jupiter"] as const;

export default async function CartographiePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId } });
  if (!profile) notFound();

  if (profile.timeUnknown) {
    return (
      <div>
        <Eyebrow>Cartographie astrologique</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
        <Card className="mt-8 p-8 text-center">
          <p className="text-muted">
            La cartographie astrologique repose entièrement sur l&apos;heure exacte de naissance (elle
            détermine les angles Ascendant/Milieu du Ciel dont dépendent toutes les lignes). Ce profil a une
            heure de naissance inconnue : nous préférons ne rien afficher plutôt que produire une carte
            trompeuse. Ajoutez l&apos;heure de naissance sur ce profil pour débloquer cet outil.
          </p>
        </Card>
      </div>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const access = await hasFeatureAccess(userId, { feature: "astrocartography", primaryProfileId: profile.id });

  if (!access) {
    return (
      <div>
        <Eyebrow>Cartographie astrologique</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
        <div className="mt-8">
          <UnlockGate feature="astrocartography" profileIdA={profile.id} credits={user.credits} />
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
  const mapData = projectAstroCartoLines(lines);

  return (
    <div>
      <Eyebrow>Cartographie astrologique</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{profile.label}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Cliquez sur une planète ou un type de ligne pour l&apos;afficher/la masquer. MC/IC sont des méridiens
        (droites) ; AC/DC sont des courbes qui dépendent de la latitude — voir la page « La méthode ».
      </p>

      <div className="mt-6">
        <AstrocartographyMap data={mapData} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Vos lignes principales</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HIGHLIGHT_PLANETS.flatMap((planet) =>
            (["MC", "AC"] as const).map((type) => (
              <Card key={`${planet}-${type}`} className="p-4 text-sm">
                <p className="leading-relaxed text-muted">{describeAstroCartoLine(planet, type)}</p>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
