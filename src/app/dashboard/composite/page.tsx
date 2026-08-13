import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { canonicalPair, hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeComposite } from "@/lib/astro/composite";
import { computeAspects } from "@/lib/astro/aspects";
import { quickSunSign } from "@/lib/astro/quick";
import { PLANET_KEYS } from "@/lib/astro/types";
import type { PointKey } from "@/lib/astro/types";
import { signOf, formatLongitude } from "@/lib/astro/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { describeAspect, describeDegree, describePlanetInSign } from "@/lib/astro/interpretations/compose";
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
import { ChartWheel } from "@/components/chart/ChartWheel";

type Locale = "fr" | "en";

const DISPLAY_POINTS: PointKey[] = [...PLANET_KEYS, "asc", "mc", "fortune"];

const TEXT: Record<
  Locale,
  {
    composite: string;
    needTwoProfiles: string;
    needTwoProfilesBody: string;
    chooseTwo: string;
    profileNotFound: string;
    positions: string;
    house: string;
    degree: string;
    internalAspects: string;
  }
> = {
  fr: {
    composite: "Thème composite",
    needTwoProfiles: "Il vous faut deux profils",
    needTwoProfilesBody: "Ajoutez un second profil pour calculer un thème composite.",
    chooseTwo: "Choisissez deux profils",
    profileNotFound: "Profil introuvable.",
    positions: "Positions du composite",
    house: "Maison",
    degree: "Degré —",
    internalAspects: "Aspects internes",
  },
  en: {
    composite: "Composite chart",
    needTwoProfiles: "You need two profiles",
    needTwoProfilesBody: "Add a second profile to calculate a composite chart.",
    chooseTwo: "Choose two profiles",
    profileNotFound: "Profile not found.",
    positions: "Composite positions",
    house: "House",
    degree: "Degree —",
    internalAspects: "Internal aspects",
  },
};

export default async function CompositePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; relation?: string }>;
}) {
  const userId = await requireUserId();
  const { a, b, relation } = await searchParams;
  // Ne jamais présumer une relation amoureuse par défaut : l'amitié est le
  // cadrage le plus neutre tant que l'utilisateur n'a pas choisi un onglet.
  const relationshipType: RelationshipType = isRelationshipType(relation) ? relation : "amitie";

  const [profiles, currentUser] = await Promise.all([
    prisma.profile.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  const locale: Locale = currentUser.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const relationshipMeta = locale === "en" ? RELATIONSHIP_META_EN : RELATIONSHIP_META;
  const getAspectNote = locale === "en" ? relationshipAspectNoteEn : relationshipAspectNote;

  if (profiles.length < 2) {
    return (
      <div>
        <Eyebrow>{t.composite}</Eyebrow>
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
        <Eyebrow>{t.composite}</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{t.chooseTwo}</h1>
        <Card className="mt-6 p-6">
          <AvatarPairPicker profiles={pickable} basePath="/dashboard/composite" locale={locale} />
        </Card>
      </div>
    );
  }

  const profileA = profiles.find((p) => p.id === a);
  const profileB = profiles.find((p) => p.id === b);
  if (!profileA || !profileB) return <p className="text-muted">{t.profileNotFound}</p>;
  const sunA = pickable.find((p) => p.id === a)!.sunSign;
  const sunB = pickable.find((p) => p.id === b)!.sunSign;

  const [primaryProfileId, secondaryProfileId] = canonicalPair(a, b);
  const access = await hasFeatureAccess(userId, { feature: "composite", primaryProfileId, secondaryProfileId });

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          <PixelAvatar seed={a} sunSign={sunA} size={56} />
          <PixelAvatar seed={b} sunSign={sunB} size={56} />
        </div>
        <div>
          <Eyebrow>{t.composite}</Eyebrow>
          <h1 className="font-display text-3xl">
            {profileA.label} <em className="not-italic text-gold-strong">&amp;</em> {profileB.label}
          </h1>
        </div>
      </div>
      <RelationshipTabs active={relationshipType} basePath="/dashboard/composite" a={a} b={b} locale={locale} />
    </div>
  );

  if (!access) {
    return (
      <div>
        {header}
        <div className="mt-8">
          <UnlockGate feature="composite" profileIdA={a} profileIdB={b} credits={currentUser.credits} locale={locale} />
        </div>
      </div>
    );
  }

  const chartA = computeNatalChart(
    { date: profileA.birthDate, time: profileA.birthTime, tzName: profileA.tzName, latitude: profileA.latitude, longitude: profileA.longitude, timeUnknown: profileA.timeUnknown },
    "placidus"
  );
  const chartB = computeNatalChart(
    { date: profileB.birthDate, time: profileB.birthTime, tzName: profileB.tzName, latitude: profileB.latitude, longitude: profileB.longitude, timeUnknown: profileB.timeUnknown },
    "placidus"
  );

  const composite = computeComposite(chartA, chartB);
  const aspects = computeAspects(composite.points, composite.hasReliableHouses ? DISPLAY_POINTS : [...PLANET_KEYS]);
  const wheelPoints = DISPLAY_POINTS.filter((k) => composite.points[k]).map((k) => ({ key: k, longitude: composite.points[k].longitude }));

  return (
    <div>
      {header}
      <Card className="mt-6 p-5 text-sm text-muted">{relationshipMeta[relationshipType].compositeFraming}</Card>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[420px_1fr]">
        <Card className="p-4">
          <ChartWheel
            points={wheelPoints}
            ascendant={composite.houses.ascendant}
            houseCusps={composite.houses.cusps}
            aspects={aspects}
            locale={locale}
          />
        </Card>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl">{t.positions}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DISPLAY_POINTS.map((key) => {
                const point = composite.points[key];
                if (!point) return null;
                const sign = signOf(point.longitude);
                return (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {planetMap[key].symbol} {planetMap[key].name}
                      </p>
                      {point.house && <Badge>{t.house} {point.house}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-gold-strong">
                      {formatLongitude(point.longitude)} {signMap[sign].name}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {describePlanetInSign(key, sign, relationshipType, locale)}
                    </p>
                    <p className="mt-2 border-t border-border-soft pt-2 text-xs leading-relaxed text-muted/80">
                      <span className="text-gold-strong/90">{t.degree} </span>
                      {describeDegree(point.longitude, locale, composite.points)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">{t.internalAspects}</h2>
            <div className="mt-4 space-y-3">
              {aspects.map((aspect, i) => {
                const note = getAspectNote(aspect.a, aspect.b, relationshipType);
                return (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium">
                        {planetMap[aspect.a].symbol} {planetMap[aspect.a].name}{" "}
                        <span className="font-normal text-muted">↔</span> {planetMap[aspect.b].symbol}{" "}
                        {planetMap[aspect.b].name}
                      </p>
                      <Badge tone={aspectMap[aspect.aspect].tone === "harmonieux" ? "sage" : aspectMap[aspect.aspect].tone === "tendu" ? "terracotta" : "neutral"}>
                        {aspectMap[aspect.aspect].name}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {describeAspect(aspect, "composite", relationshipType, locale)}
                    </p>
                    {note && <p className="mt-1 text-xs leading-relaxed text-gold-strong">{note}</p>}
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
