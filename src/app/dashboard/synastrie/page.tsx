import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { canonicalPair, hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { quickSunSign } from "@/lib/astro/quick";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { describeAspect } from "@/lib/astro/interpretations/compose";
import { HOUSE_META } from "@/lib/astro/interpretations/houses";
import {
  RELATIONSHIP_META,
  isRelationshipType,
  relationshipAspectNote,
} from "@/lib/astro/interpretations/relationship";
import type { RelationshipType } from "@/lib/astro/interpretations/relationship";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { AvatarPairPicker } from "@/components/dashboard/AvatarPairPicker";
import { RelationshipTabs } from "@/components/dashboard/RelationshipTabs";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { UnlockGate } from "@/components/billing/UnlockGate";

export default async function SynastriePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; relation?: string }>;
}) {
  const userId = await requireUserId();
  const { a, b, relation } = await searchParams;
  const relationshipType: RelationshipType = isRelationshipType(relation) ? relation : "romantique";

  const profiles = await prisma.profile.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });

  if (profiles.length < 2) {
    return (
      <div>
        <Eyebrow>Synastrie</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">Il vous faut deux profils</h1>
        <p className="mt-3 text-sm text-muted">
          Ajoutez au moins un second profil (par exemple votre partenaire) pour comparer deux thèmes.
        </p>
      </div>
    );
  }

  const pickable = profiles.map((p) => ({
    id: p.id,
    label: p.label,
    sunSign: quickSunSign({
      date: p.birthDate,
      time: p.birthTime,
      tzName: p.tzName,
      latitude: p.latitude,
      longitude: p.longitude,
      timeUnknown: p.timeUnknown,
    }),
  }));

  if (!a || !b) {
    return (
      <div>
        <Eyebrow>Synastrie</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">Choisissez deux profils</h1>
        <Card className="mt-6 p-6">
          <AvatarPairPicker profiles={pickable} basePath="/dashboard/synastrie" />
        </Card>
      </div>
    );
  }

  const profileA = profiles.find((p) => p.id === a);
  const profileB = profiles.find((p) => p.id === b);
  if (!profileA || !profileB) {
    return <p className="text-muted">Profil introuvable.</p>;
  }
  const sunA = pickable.find((p) => p.id === a)!.sunSign;
  const sunB = pickable.find((p) => p.id === b)!.sunSign;

  const [primaryProfileId, secondaryProfileId] = canonicalPair(a, b);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const access = await hasFeatureAccess(userId, { feature: "synastry", primaryProfileId, secondaryProfileId });

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          <PixelAvatar seed={a} sunSign={sunA} size={56} />
          <PixelAvatar seed={b} sunSign={sunB} size={56} />
        </div>
        <div>
          <Eyebrow>Synastrie</Eyebrow>
          <h1 className="font-display text-3xl">
            {profileA.label} &amp; {profileB.label}
          </h1>
        </div>
      </div>
      <RelationshipTabs active={relationshipType} basePath="/dashboard/synastrie" a={a} b={b} />
    </div>
  );

  if (!access) {
    return (
      <div>
        {header}
        <div className="mt-8">
          <UnlockGate feature="synastry" profileIdA={a} profileIdB={b} credits={user.credits} />
        </div>
      </div>
    );
  }

  const chartA = computeNatalChart(
    {
      date: profileA.birthDate,
      time: profileA.birthTime,
      tzName: profileA.tzName,
      latitude: profileA.latitude,
      longitude: profileA.longitude,
      timeUnknown: profileA.timeUnknown,
    },
    "placidus"
  );
  const chartB = computeNatalChart(
    {
      date: profileB.birthDate,
      time: profileB.birthTime,
      tzName: profileB.tzName,
      latitude: profileB.latitude,
      longitude: profileB.longitude,
      timeUnknown: profileB.timeUnknown,
    },
    "placidus"
  );

  const synastry = computeSynastry(chartA, chartB);
  const majorAspects = synastry.aspects.filter((asp) => asp.major);

  return (
    <div>
      {header}

      <Card className="mt-6 p-5 text-sm text-muted">{RELATIONSHIP_META[relationshipType].synastryFraming}</Card>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Aspects croisés majeurs</h2>
        <div className="mt-4 space-y-3">
          {majorAspects.length === 0 && <p className="text-sm text-muted">Aucun aspect majeur détecté dans les orbes retenues.</p>}
          {majorAspects.map((aspect, i) => {
            const note = relationshipAspectNote(aspect.personA, aspect.personB, relationshipType);
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">
                    A · {PLANET_META[aspect.personA].symbol} {PLANET_META[aspect.personA].name}{" "}
                    {ASPECT_META[aspect.aspect].symbol} {PLANET_META[aspect.personB].symbol}{" "}
                    {PLANET_META[aspect.personB].name} · B
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
                <p className="mt-2 text-xs leading-relaxed text-muted">{describeAspect(aspect, "synastry")}</p>
                {note && <p className="mt-1 text-xs leading-relaxed text-gold-strong">{note}</p>}
              </Card>
            );
          })}
        </div>
      </section>

      {chartA.hasReliableHouses && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Planètes de {profileB.label} dans les maisons de {profileA.label}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {synastry.bPlanetsInAHouses.map((overlay, i) => (
              <Card key={i} className="p-4 text-sm">
                <span className="font-medium">
                  {PLANET_META[overlay.point].symbol} {PLANET_META[overlay.point].name}
                </span>{" "}
                <span className="text-muted">en maison {overlay.house} — {HOUSE_META[overlay.house - 1].keyword}</span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
