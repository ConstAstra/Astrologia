import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { FREE_PROFILE_LIMIT, isAvatarGlowing, STREAK_GLOW_THRESHOLD } from "@/lib/billing/entitlements";
import { DeleteProfileButton } from "@/components/dashboard/DeleteProfileButton";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { quickSunSign, quickMoonSign } from "@/lib/astro/quick";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
import { OverlapIcon, MergeIcon } from "@/components/icons/FeatureIcons";
import { HeroChartWheel } from "@/components/HeroChartWheel";

type Locale = "fr" | "en";

const TEXT: Record<
  Locale,
  {
    eyebrow: string;
    heading: string;
    quota: (count: number, limit: number) => string;
    addProfile: string;
    emptyHeading: string;
    empty: string;
    emptyReassure: string;
    createFirst: string;
    unknownTime: string;
    editAvatar: string;
    natalChart: string;
    transits: string;
    astrocartography: string;
    compareTwo: string;
    comparePrompt: string;
    synastry: string;
    composite: string;
    avatarLegend: string;
    glowActive: string;
    glowProgress: (daysLeft: number) => string;
  }
> = {
  fr: {
    eyebrow: "Vos profils",
    heading: "Thèmes enregistrés",
    quota: (count, limit) => `${count} / ${limit} profils sur l'offre gratuite.`,
    addProfile: "+ Ajouter un profil",
    emptyHeading: "Votre ciel vous attend",
    empty: "Ajoutez votre date, heure et lieu de naissance : positions planétaires, maisons et aspects se calculent en quelques secondes.",
    emptyReassure: "Gratuit, complet, sans carte bancaire.",
    createFirst: "Créer mon premier thème",
    unknownTime: "· heure inconnue",
    editAvatar: "Personnaliser l'avatar",
    natalChart: "Thème natal",
    transits: "Transits du jour",
    astrocartography: "Cartographie",
    compareTwo: "Comparer deux profils",
    comparePrompt: "Choisissez deux avatars pour lancer une synastrie ou un thème composite.",
    synastry: "Synastrie",
    composite: "Thème composite",
    avatarLegend: "🌙 Le petit badge en bas à gauche de l'avatar est un compagnon lié à l'élément de sa Lune (survolez-le pour voir lequel).",
    glowActive: "✨ Halo doré actif — Premium ou série de connexions ≥ 7 jours.",
    glowProgress: (daysLeft) =>
      daysLeft === 1
        ? "✨ Encore 1 jour de connexion pour débloquer le halo doré de l'avatar (ou passez Premium)."
        : `✨ Encore ${daysLeft} jours de connexion pour débloquer le halo doré de l'avatar (ou passez Premium).`,
  },
  en: {
    eyebrow: "Your profiles",
    heading: "Saved charts",
    quota: (count, limit) => `${count} / ${limit} profiles on the free plan.`,
    addProfile: "+ Add a profile",
    emptyHeading: "Your sky is waiting",
    empty: "Add your birth date, time and place: planetary positions, houses and aspects compute in seconds.",
    emptyReassure: "Free, complete, no card required.",
    createFirst: "Create my first chart",
    unknownTime: "· unknown time",
    editAvatar: "Customize avatar",
    natalChart: "Natal chart",
    transits: "Today's transits",
    astrocartography: "Astrocartography",
    compareTwo: "Compare two profiles",
    comparePrompt: "Pick two avatars to run a synastry or a composite chart.",
    synastry: "Synastry",
    composite: "Composite chart",
    avatarLegend: "🌙 The small badge on the avatar's bottom-left is a companion tied to its Moon's element (hover it to see which one).",
    glowActive: "✨ Golden glow active — Premium or a 7-day-or-longer login streak.",
    glowProgress: (daysLeft) =>
      daysLeft === 1
        ? "✨ 1 more day of logging in to unlock the avatar's golden glow (or go Premium)."
        : `✨ ${daysLeft} more days of logging in to unlock the avatar's golden glow (or go Premium).`,
  },
};

export default async function ProfilsPage() {
  const userId = await requireUserId();
  const [profiles, user] = await Promise.all([
    prisma.profile.findMany({
      where: { userId },
      orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const glowing = isAvatarGlowing(user);
  const daysUntilGlow = Math.max(0, STREAK_GLOW_THRESHOLD - user.currentStreak);

  const withSigns = profiles.map((profile) => {
    const birthInput = {
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    };
    let overrides: AvatarOverrides | undefined;
    if (profile.avatarOverrides) {
      try {
        overrides = JSON.parse(profile.avatarOverrides) as AvatarOverrides;
      } catch {
        overrides = undefined;
      }
    }
    return {
      profile,
      sunSign: quickSunSign(birthInput),
      moonSign: quickMoonSign(birthInput),
      overrides,
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="font-display mt-2 text-3xl">{t.heading}</h1>
          <p className="mt-1 text-sm text-muted">{t.quota(profiles.length, FREE_PROFILE_LIMIT)}</p>
        </div>
        <ButtonLink href="/dashboard/profils/nouveau">{t.addProfile}</ButtonLink>
      </div>

      {profiles.length === 0 ? (
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="font-display text-2xl sm:text-3xl">{t.emptyHeading}</p>
            <p className="mt-3 max-w-md text-muted">{t.empty}</p>
            <div className="mt-6">
              <ButtonLink href="/dashboard/profils/nouveau" size="lg">
                {t.createFirst}
              </ButtonLink>
            </div>
            <p className="mt-3 text-xs text-muted/70">{t.emptyReassure}</p>
          </div>
          <div className="hidden lg:block">
            <HeroChartWheel className="mx-auto max-w-[260px] opacity-80" />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withSigns.map(({ profile, sunSign, moonSign, overrides }) => (
            <Card key={profile.id} className="flex flex-col p-6">
              <div className="flex items-center gap-4">
                <PixelAvatar
                  seed={profile.id}
                  sunSign={sunSign}
                  moonSign={moonSign}
                  overrides={overrides}
                  size={64}
                  glowing={glowing}
                  locale={locale}
                />
                <div>
                  <p className="font-display text-xl">{profile.label}</p>
                  <p className="text-xs text-gold-strong">{signMap[sunSign].name}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                {profile.birthDate}
                {profile.timeUnknown ? ` ${t.unknownTime}` : ` · ${profile.birthTime}`}
              </p>
              <p className="text-sm text-muted">{profile.locationName}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/dashboard/profils/${profile.id}/avatar`}
                  className="rounded-full border border-violet/40 px-3 py-1 text-violet hover:bg-violet/10"
                >
                  {t.editAvatar}
                </Link>
                <Link
                  href={`/dashboard/theme-natal/${profile.id}`}
                  className="rounded-full border border-gold/40 px-3 py-1 text-gold-strong hover:bg-gold/10"
                >
                  {t.natalChart}
                </Link>
                <Link
                  href={`/dashboard/transits/${profile.id}`}
                  className="rounded-full border border-sage/40 px-3 py-1 text-sage hover:bg-sage/10"
                >
                  {t.transits}
                </Link>
                <Link
                  href={`/dashboard/cartographie/${profile.id}`}
                  className="rounded-full border border-border-soft px-3 py-1 text-muted hover:text-foreground"
                >
                  {t.astrocartography}
                </Link>
                <DeleteProfileButton profileId={profile.id} locale={locale} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {profiles.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          {t.avatarLegend} {glowing ? t.glowActive : t.glowProgress(daysUntilGlow)}
        </p>
      )}

      {profiles.length >= 2 && (
        <Card className="mt-8 overflow-hidden p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/5">
              <OverlapIcon className="h-5 w-5 text-gold-strong" />
            </span>
            <div>
              <p className="font-display text-xl">{t.compareTwo}</p>
              <p className="mt-1 text-sm text-muted">{t.comparePrompt}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/synastrie" variant="secondary">
              <OverlapIcon className="h-4 w-4" />
              {t.synastry}
            </ButtonLink>
            <ButtonLink href="/dashboard/composite" variant="secondary">
              <MergeIcon className="h-4 w-4" />
              {t.composite}
            </ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}
