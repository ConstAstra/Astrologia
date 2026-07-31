import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { canonicalPair, hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { quickSunSign } from "@/lib/astro/quick";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { describeAspect } from "@/lib/astro/interpretations/compose";
import { HOUSE_META } from "@/lib/astro/interpretations/houses";
import { HOUSE_META_EN } from "@/lib/astro/interpretations/houses.en";
import {
  RELATIONSHIP_META,
  isRelationshipType,
  relationshipAspectNote,
} from "@/lib/astro/interpretations/relationship";
import { RELATIONSHIP_META_EN, relationshipAspectNoteEn } from "@/lib/astro/interpretations/relationship.en";
import type { RelationshipType } from "@/lib/astro/interpretations/relationship";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { AvatarPairPicker } from "@/components/dashboard/AvatarPairPicker";
import { RelationshipTabs } from "@/components/dashboard/RelationshipTabs";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { UnlockGate } from "@/components/billing/UnlockGate";

type Locale = "fr" | "en";

const TEXT: Record<
  Locale,
  {
    synastry: string;
    needTwoProfiles: string;
    needTwoProfilesBody: string;
    chooseTwo: string;
    profileNotFound: string;
    majorAspects: string;
    noMajorAspects: string;
    planetsOf: (b: string, a: string) => string;
    inHouse: (house: number) => string;
  }
> = {
  fr: {
    synastry: "Synastrie",
    needTwoProfiles: "Il vous faut deux profils",
    needTwoProfilesBody: "Ajoutez au moins un second profil (par exemple votre partenaire) pour comparer deux thèmes.",
    chooseTwo: "Choisissez deux profils",
    profileNotFound: "Profil introuvable.",
    majorAspects: "Aspects croisés majeurs",
    noMajorAspects: "Aucun aspect majeur détecté dans les orbes retenues.",
    planetsOf: (b, a) => `Planètes de ${b} dans les maisons de ${a}`,
    inHouse: (house) => `en maison ${house} —`,
  },
  en: {
    synastry: "Synastry",
    needTwoProfiles: "You need two profiles",
    needTwoProfilesBody: "Add at least a second profile (for example your partner) to compare two charts.",
    chooseTwo: "Choose two profiles",
    profileNotFound: "Profile not found.",
    majorAspects: "Major cross-aspects",
    noMajorAspects: "No major aspect detected within the orbs used.",
    planetsOf: (b, a) => `${b}'s planets in ${a}'s houses`,
    inHouse: (house) => `in house ${house} —`,
  },
};

export default async function SynastriePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; relation?: string }>;
}) {
  const userId = await requireUserId();
  const { a, b, relation } = await searchParams;
  const relationshipType: RelationshipType = isRelationshipType(relation) ? relation : "romantique";

  const [profiles, currentUser] = await Promise.all([
    prisma.profile.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  const locale: Locale = currentUser.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const houseList = locale === "en" ? HOUSE_META_EN : HOUSE_META;
  const relationshipMeta = locale === "en" ? RELATIONSHIP_META_EN : RELATIONSHIP_META;
  const getAspectNote = locale === "en" ? relationshipAspectNoteEn : relationshipAspectNote;

  if (profiles.length < 2) {
    return (
      <div>
        <Eyebrow>{t.synastry}</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{t.needTwoProfiles}</h1>
        <p className="mt-3 text-sm text-muted">{t.needTwoProfilesBody}</p>
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
        <Eyebrow>{t.synastry}</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{t.chooseTwo}</h1>
        <Card className="mt-6 p-6">
          <AvatarPairPicker profiles={pickable} basePath="/dashboard/synastrie" locale={locale} />
        </Card>
      </div>
    );
  }

  const profileA = profiles.find((p) => p.id === a);
  const profileB = profiles.find((p) => p.id === b);
  if (!profileA || !profileB) {
    return <p className="text-muted">{t.profileNotFound}</p>;
  }
  const sunA = pickable.find((p) => p.id === a)!.sunSign;
  const sunB = pickable.find((p) => p.id === b)!.sunSign;

  const [primaryProfileId, secondaryProfileId] = canonicalPair(a, b);
  const access = await hasFeatureAccess(userId, { feature: "synastry", primaryProfileId, secondaryProfileId });

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          <PixelAvatar seed={a} sunSign={sunA} size={56} />
          <PixelAvatar seed={b} sunSign={sunB} size={56} />
        </div>
        <div>
          <Eyebrow>{t.synastry}</Eyebrow>
          <h1 className="font-display text-3xl">
            {profileA.label} &amp; {profileB.label}
          </h1>
        </div>
      </div>
      <RelationshipTabs active={relationshipType} basePath="/dashboard/synastrie" a={a} b={b} locale={locale} />
    </div>
  );

  if (!access) {
    return (
      <div>
        {header}
        <div className="mt-8">
          <UnlockGate feature="synastry" profileIdA={a} profileIdB={b} credits={currentUser.credits} locale={locale} />
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

      <Card className="mt-6 p-5 text-sm text-muted">{relationshipMeta[relationshipType].synastryFraming}</Card>

      <section className="mt-8">
        <h2 className="font-display text-2xl">{t.majorAspects}</h2>
        <div className="mt-4 space-y-3">
          {majorAspects.length === 0 && <p className="text-sm text-muted">{t.noMajorAspects}</p>}
          {majorAspects.map((aspect, i) => {
            const note = getAspectNote(aspect.personA, aspect.personB, relationshipType);
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">
                    A · {planetMap[aspect.personA].symbol} {planetMap[aspect.personA].name}{" "}
                    {aspectMap[aspect.aspect].symbol} {planetMap[aspect.personB].symbol}{" "}
                    {planetMap[aspect.personB].name} · B
                  </p>
                  <Badge
                    tone={
                      aspectMap[aspect.aspect].tone === "harmonieux"
                        ? "sage"
                        : aspectMap[aspect.aspect].tone === "tendu"
                          ? "terracotta"
                          : "neutral"
                    }
                  >
                    {aspectMap[aspect.aspect].name}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {describeAspect(aspect, "synastry", relationshipType, locale)}
                </p>
                {note && <p className="mt-1 text-xs leading-relaxed text-gold-strong">{note}</p>}
              </Card>
            );
          })}
        </div>
      </section>

      {chartA.hasReliableHouses && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">{t.planetsOf(profileB.label, profileA.label)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {synastry.bPlanetsInAHouses.map((overlay, i) => (
              <Card key={i} className="p-4 text-sm">
                <span className="font-medium">
                  {planetMap[overlay.point].symbol} {planetMap[overlay.point].name}
                </span>{" "}
                <span className="text-muted">
                  {t.inHouse(overlay.house)} {houseList[overlay.house - 1].keyword}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
