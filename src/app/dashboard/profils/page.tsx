import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { FREE_PROFILE_LIMIT } from "@/lib/billing/entitlements";
import { DeleteProfileButton } from "@/components/dashboard/DeleteProfileButton";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { quickSunSign } from "@/lib/astro/quick";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";

type Locale = "fr" | "en";

const TEXT: Record<
  Locale,
  {
    eyebrow: string;
    heading: string;
    quota: (count: number, limit: number) => string;
    addProfile: string;
    empty: string;
    createFirst: string;
    unknownTime: string;
    natalChart: string;
    transits: string;
    astrocartography: string;
    compareTwo: string;
    comparePrompt: string;
    synastry: string;
    composite: string;
  }
> = {
  fr: {
    eyebrow: "Vos profils",
    heading: "Thèmes enregistrés",
    quota: (count, limit) => `${count} / ${limit} profils sur l'offre gratuite.`,
    addProfile: "+ Ajouter un profil",
    empty: "Aucun profil pour le moment. Ajoutez votre date, heure et lieu de naissance pour révéler votre thème astral.",
    createFirst: "Créer mon premier thème",
    unknownTime: "· heure inconnue",
    natalChart: "Thème natal",
    transits: "Transits du jour",
    astrocartography: "Cartographie",
    compareTwo: "Comparer deux profils",
    comparePrompt: "Choisissez deux avatars pour lancer une synastrie ou un thème composite.",
    synastry: "Synastrie",
    composite: "Thème composite",
  },
  en: {
    eyebrow: "Your profiles",
    heading: "Saved charts",
    quota: (count, limit) => `${count} / ${limit} profiles on the free plan.`,
    addProfile: "+ Add a profile",
    empty: "No profile yet. Add your birth date, time and place to reveal your natal chart.",
    createFirst: "Create my first chart",
    unknownTime: "· unknown time",
    natalChart: "Natal chart",
    transits: "Today's transits",
    astrocartography: "Astrocartography",
    compareTwo: "Compare two profiles",
    comparePrompt: "Pick two avatars to run a synastry or a composite chart.",
    synastry: "Synastry",
    composite: "Composite chart",
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

  const withSigns = profiles.map((profile) => ({
    profile,
    sunSign: quickSunSign({
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    }),
  }));

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
        <Card className="mt-8 p-10 text-center">
          <p className="text-muted">{t.empty}</p>
          <div className="mt-5">
            <ButtonLink href="/dashboard/profils/nouveau">{t.createFirst}</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withSigns.map(({ profile, sunSign }) => (
            <Card key={profile.id} className="flex flex-col p-6">
              <div className="flex items-center gap-4">
                <PixelAvatar seed={profile.id} sunSign={sunSign} size={64} />
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

      {profiles.length >= 2 && (
        <Card className="mt-8 p-6">
          <p className="font-display text-xl">{t.compareTwo}</p>
          <p className="mt-1 text-sm text-muted">{t.comparePrompt}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard/synastrie" variant="secondary">
              {t.synastry}
            </ButtonLink>
            <ButtonLink href="/dashboard/composite" variant="secondary">
              {t.composite}
            </ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}
