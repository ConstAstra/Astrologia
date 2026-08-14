import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { canonicalPair, hasFeatureAccess } from "@/lib/billing/entitlements";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeSynastry } from "@/lib/astro/synastry";
import { computeCompatibilityScore, compatibilityPunchline } from "@/lib/astro/compatibility-score";
import { quickSunSign } from "@/lib/astro/quick";
import { signOf } from "@/lib/astro/signs";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { ASPECT_META_EN } from "@/lib/astro/interpretations/aspects.en";
import { describeAspect, describeHouseOverlay } from "@/lib/astro/interpretations/compose";
import { composeSynastrySynthesis } from "@/lib/astro/interpretations/synastry-synthesis";
import { composeSynastryChartDomains } from "@/lib/astro/interpretations/synastry-domains";
import { composeAllPlanetSignComparabilities } from "@/lib/astro/interpretations/planet-sign-comparability";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import {
  RELATIONSHIP_META,
  isRelationshipType,
  relationshipAspectNote,
} from "@/lib/astro/interpretations/relationship";
import { RELATIONSHIP_META_EN, relationshipAspectNoteEn } from "@/lib/astro/interpretations/relationship.en";
import type { RelationshipType } from "@/lib/astro/interpretations/relationship";
import { listFriendSelfProfiles } from "@/lib/friends";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { AvatarPairPicker } from "@/components/dashboard/AvatarPairPicker";
import { RelationshipTabs } from "@/components/dashboard/RelationshipTabs";
import { CompatibilityMeter } from "@/components/dashboard/CompatibilityMeter";
import { SynastryShareCardButton } from "@/components/dashboard/SynastryShareCardButton";
import { CompatibilityVideoButton } from "@/components/dashboard/CompatibilityVideoButton";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { UnlockGate } from "@/components/billing/UnlockGate";
import { SynastryWheel } from "@/components/chart/SynastryWheel";
import { GrimoireReveal } from "@/components/dashboard/GrimoireReveal";
import { PLANET_KEYS } from "@/lib/astro/types";
import type { PointKey } from "@/lib/astro/types";

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
    house: string;
    compatibilityLabel: string;
    personPlanet: (label: string, symbol: string, name: string) => string;
    grimoireTitle: string;
    grimoireSubtitle: string;
    grimoireAspectsNote: string;
    synthesisTitle: string;
    synthesisOverviewHeading: string;
    synthesisHousesHeading: string;
    synthesisTensionsHeading: string;
    synthesisTensionsIntro: string;
    synthesisStrengthsHeading: string;
    synthesisStrengthsIntro: string;
    noneDetected: string;
    comparabilityTitle: string;
    comparabilityIntro: string;
    easyGround: string;
    frictionGround: string;
  }
> = {
  fr: {
    synastry: "Synastrie",
    needTwoProfiles: "Il vous faut deux profils",
    needTwoProfilesBody:
      "Ajoutez au moins un second profil (par exemple votre partenaire), ou invitez un ami : dès qu'il accepte, son profil apparaît ici automatiquement.",
    chooseTwo: "Choisissez deux profils",
    profileNotFound: "Profil introuvable.",
    majorAspects: "Aspects croisés majeurs",
    noMajorAspects: "Aucun aspect majeur détecté dans les orbes retenues.",
    planetsOf: (b, a) => `Planètes de ${b} dans les maisons de ${a}`,
    house: "Maison",
    compatibilityLabel: "Compatibilité astrologique",
    personPlanet: (label, symbol, name) => `${symbol} ${name} de ${label}`,
    grimoireTitle: "Le grimoire de ce lien",
    grimoireSubtitle: "Ce que vos deux thèmes racontent ensemble, chapitre par chapitre, sans entrer dans le détail des aspects.",
    grimoireAspectsNote: "Les aspects croisés détaillés sont à lire plus bas dans cette page.",
    synthesisTitle: "Lecture de synthèse",
    synthesisOverviewHeading: "Vue d'ensemble",
    synthesisHousesHeading: "Les maisons les plus activées",
    synthesisTensionsHeading: "Vos principales tensions",
    synthesisTensionsIntro: "Les aspects croisés qui demandent le plus d'ajustement conscient entre vous deux.",
    synthesisStrengthsHeading: "Vos principaux points d'appui",
    synthesisStrengthsIntro: "Les aspects croisés qui circulent le plus naturellement entre vous deux.",
    noneDetected: "Aucun détecté dans les orbes retenues.",
    comparabilityTitle: "Comparabilité planète par planète",
    comparabilityIntro:
      "Pour chaque planète, comment vos signes respectifs dialoguent (ou frottent) sur ce terrain précis, du plus friable au plus fluide.",
    easyGround: "Terrain facile",
    frictionGround: "Terrain de friction",
  },
  en: {
    synastry: "Synastry",
    needTwoProfiles: "You need two profiles",
    needTwoProfilesBody:
      "Add at least a second profile (for example your partner), or invite a friend: once they accept, their profile shows up here automatically.",
    chooseTwo: "Choose two profiles",
    profileNotFound: "Profile not found.",
    majorAspects: "Major cross-aspects",
    noMajorAspects: "No major aspect detected within the orbs used.",
    planetsOf: (b, a) => `${b}'s planets in ${a}'s houses`,
    house: "House",
    compatibilityLabel: "Astrological compatibility",
    personPlanet: (label, symbol, name) => `${label}'s ${symbol} ${name}`,
    grimoireTitle: "The grimoire of this bond",
    grimoireSubtitle: "What your two charts say together, chapter by chapter, without going into aspect-by-aspect detail.",
    grimoireAspectsNote: "The detailed cross-aspects are further down this page.",
    synthesisTitle: "Synthesis reading",
    synthesisOverviewHeading: "Overview",
    synthesisHousesHeading: "Houses most activated",
    synthesisTensionsHeading: "Your main tensions",
    synthesisTensionsIntro: "The cross-aspects that ask for the most conscious adjustment between you two.",
    synthesisStrengthsHeading: "Your main points of strength",
    synthesisStrengthsIntro: "The cross-aspects that flow most naturally between you two.",
    noneDetected: "None detected within the orbs used.",
    comparabilityTitle: "Planet-by-planet comparability",
    comparabilityIntro:
      "For each planet, how your respective signs get along (or clash) on that specific ground, from the most friable to the smoothest.",
    easyGround: "Easy ground",
    frictionGround: "Friction ground",
  },
};

export default async function SynastriePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; relation?: string }>;
}) {
  const userId = await requireUserId();
  const { a, b, relation } = await searchParams;
  // Ne jamais présumer une relation amoureuse par défaut : l'amitié est le
  // cadrage le plus neutre tant que l'utilisateur n'a pas choisi un onglet.
  const relationshipType: RelationshipType = isRelationshipType(relation) ? relation : "amitie";

  const [ownProfiles, currentUser, friends] = await Promise.all([
    prisma.profile.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "asc" } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    listFriendSelfProfiles(userId),
  ]);
  // Le profil "soi" d'un ami accepté peut être choisi comme second profil,
  // au même titre que ses propres profils — sans jamais exposer les autres
  // profils enregistrés de l'ami (voir listFriendSelfProfiles). Le label
  // affiché devient le prénom du compte ami plutôt que l'intitulé "Moi" que
  // l'ami a pu donner à son propre profil, sans quoi deux profils "Moi"
  // (le vôtre et le sien) seraient indiscernables dans le sélecteur.
  const profiles = [
    ...ownProfiles,
    ...friends.map((f) => ({ ...f.profile, label: f.name?.trim() || f.profile.label })),
  ];
  const locale: Locale = currentUser.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const aspectMap = locale === "en" ? ASPECT_META_EN : ASPECT_META;
  const relationshipMeta = locale === "en" ? RELATIONSHIP_META_EN : RELATIONSHIP_META;
  const getAspectNote = locale === "en" ? relationshipAspectNoteEn : relationshipAspectNote;

  if (profiles.length < 2) {
    return (
      <div>
        <Eyebrow>{t.synastry}</Eyebrow>
        <h1 className="font-display mt-2 text-3xl">{t.needTwoProfiles}</h1>
        <p className="mt-3 text-sm text-muted">{t.needTwoProfilesBody}</p>
        <Link href="/dashboard/amis" className="mt-4 inline-block text-sm text-gold-strong underline">
          {locale === "en" ? "Invite a friend →" : "Inviter un ami →"}
        </Link>
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
            {profileA.label} <em className="not-italic text-gold-strong">&amp;</em> {profileB.label}
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
  const { percentage: compatibilityPercentage } = computeCompatibilityScore(synastry.aspects);
  const { text: compatibilityPunch, color: compatibilityPunchColor } = compatibilityPunchline(
    compatibilityPercentage,
    synastry.aspects,
    locale
  );
  const synthesis = composeSynastrySynthesis(
    synastry,
    chartA,
    chartB,
    compatibilityPercentage,
    compatibilityPunch,
    profileA.label,
    profileB.label,
    relationshipType,
    locale
  );
  const comparabilities = composeAllPlanetSignComparabilities(chartA, chartB, profileA.label, profileB.label, locale);
  const grimoireDomains = composeSynastryChartDomains(synastry, chartA, chartB, profileA.label, profileB.label, locale);
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;

  const moonA = signOf(chartA.points.moon.longitude);
  const moonB = signOf(chartB.points.moon.longitude);
  const ascA = chartA.hasReliableHouses ? signOf(chartA.points.asc.longitude) : undefined;
  const ascB = chartB.hasReliableHouses ? signOf(chartB.points.asc.longitude) : undefined;
  const parseOverrides = (raw: string | null): AvatarOverrides | undefined => {
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as AvatarOverrides;
    } catch {
      return undefined;
    }
  };
  const overridesA = parseOverrides(profileA.avatarOverrides);
  const overridesB = parseOverrides(profileB.avatarOverrides);

  const wheelPointsA = PLANET_KEYS.filter((k) => chartA.points[k]).map((k) => ({
    key: k as PointKey,
    longitude: chartA.points[k].longitude,
  }));
  const wheelPointsB = PLANET_KEYS.filter((k) => chartB.points[k]).map((k) => ({
    key: k as PointKey,
    longitude: chartB.points[k].longitude,
  }));

  return (
    <div>
      {header}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="flex flex-col items-center p-6">
          <SynastryWheel
            pointsA={wheelPointsA}
            pointsB={wheelPointsB}
            crossAspects={majorAspects}
            labelA={profileA.label}
            labelB={profileB.label}
            locale={locale}
          />
        </Card>

        <Card className="flex flex-col items-center gap-4 p-6">
          <CompatibilityMeter
            percentage={compatibilityPercentage}
            seedA={a}
            seedB={b}
            sunA={sunA}
            sunB={sunB}
            moonA={moonA}
            moonB={moonB}
            ascA={ascA}
            ascB={ascB}
            overridesA={overridesA}
            overridesB={overridesB}
            label={t.compatibilityLabel}
          />
          <p className="text-sm font-medium" style={{ color: compatibilityPunchColor }}>
            {compatibilityPunch}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <SynastryShareCardButton
              profileIdA={a}
              profileIdB={b}
              fileName={`${profileA.label}-${profileB.label}-compatibilite.png`}
              locale={locale}
            />
            <CompatibilityVideoButton
              seedA={a}
              sunA={sunA}
              moonA={moonA}
              ascA={ascA}
              overridesA={overridesA}
              nameA={profileA.label}
              seedB={b}
              sunB={sunB}
              moonB={moonB}
              ascB={ascB}
              overridesB={overridesB}
              nameB={profileB.label}
              percentage={compatibilityPercentage}
              punchline={compatibilityPunch}
              punchlineColor={compatibilityPunchColor}
              referralCode={currentUser.referralCode}
              locale={locale}
            />
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5 text-sm text-muted">{relationshipMeta[relationshipType].synastryFraming}</Card>

      <div className="mt-6">
        <GrimoireReveal
          domains={grimoireDomains}
          title={t.grimoireTitle}
          subtitle={t.grimoireSubtitle}
          aspectsNote={t.grimoireAspectsNote}
          locale={locale}
        />
      </div>

      <Card className="mt-6 p-6">
        <Eyebrow>{t.synthesisTitle}</Eyebrow>

        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisOverviewHeading}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{synthesis.overview}</p>
        </div>

        {synthesis.housesOverview && (
          <div className="mt-6 border-t border-border-soft pt-6">
            <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisHousesHeading}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{synthesis.housesOverview}</p>
          </div>
        )}

        <div className="mt-6 border-t border-border-soft pt-6">
          <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisTensionsHeading}</p>
          <p className="mt-1 text-xs text-muted/70">{t.synthesisTensionsIntro}</p>
          <div className="mt-3 space-y-3">
            {synthesis.tensions.length === 0 ? (
              <p className="text-sm text-muted">{t.noneDetected}</p>
            ) : (
              synthesis.tensions.map((s, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted">
                  {s}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-border-soft pt-6">
          <p className="text-xs uppercase tracking-wide text-muted">{t.synthesisStrengthsHeading}</p>
          <p className="mt-1 text-xs text-muted/70">{t.synthesisStrengthsIntro}</p>
          <div className="mt-3 space-y-3">
            {synthesis.strengths.length === 0 ? (
              <p className="text-sm text-muted">{t.noneDetected}</p>
            ) : (
              synthesis.strengths.map((s, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted">
                  {s}
                </p>
              ))
            )}
          </div>
        </div>
      </Card>

      {chartA.hasReliableHouses && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">{t.planetsOf(profileB.label, profileA.label)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {synastry.bPlanetsInAHouses.map((overlay, i) => (
              <Card key={i} className="p-4">
                <p className="text-sm font-medium">
                  {planetMap[overlay.point].symbol} {planetMap[overlay.point].name}{" "}
                  <span className="font-normal text-muted">, {t.house} {overlay.house}</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {describeHouseOverlay(overlay.point, overlay.house, profileB.label, profileA.label, locale)}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {chartB.hasReliableHouses && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">{t.planetsOf(profileA.label, profileB.label)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {synastry.aPlanetsInBHouses.map((overlay, i) => (
              <Card key={i} className="p-4">
                <p className="text-sm font-medium">
                  {planetMap[overlay.point].symbol} {planetMap[overlay.point].name}{" "}
                  <span className="font-normal text-muted">, {t.house} {overlay.house}</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {describeHouseOverlay(overlay.point, overlay.house, profileA.label, profileB.label, locale)}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t.comparabilityTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.comparabilityIntro}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {comparabilities.map((c, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">
                  {planetMap[c.point].symbol} {planetMap[c.point].name}
                </p>
                <Badge tone={c.score >= 4 ? "sage" : "terracotta"}>
                  {c.score >= 4 ? t.easyGround : t.frictionGround}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted/70">
                {signMap[c.signA].symbol} {signMap[c.signA].name}
                {c.signA !== c.signB && (
                  <>
                    {" "}
                    <span className="text-muted/50">↔</span> {signMap[c.signB].symbol} {signMap[c.signB].name}
                  </>
                )}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{c.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t.majorAspects}</h2>
        <div className="mt-4 space-y-3">
          {majorAspects.length === 0 && <p className="text-sm text-muted">{t.noMajorAspects}</p>}
          {majorAspects.map((aspect, i) => {
            const note = getAspectNote(aspect.personA, aspect.personB, relationshipType);
            return (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">
                    {t.personPlanet(profileA.label, planetMap[aspect.personA].symbol, planetMap[aspect.personA].name)}{" "}
                    <span className="font-normal text-muted">↔</span>{" "}
                    {t.personPlanet(profileB.label, planetMap[aspect.personB].symbol, planetMap[aspect.personB].name)}
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
    </div>
  );
}
