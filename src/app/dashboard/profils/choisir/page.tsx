import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Eyebrow } from "@/components/ui/Card";
import { FREE_PROFILE_LIMIT, needsProfileSelection } from "@/lib/billing/entitlements";
import { quickSunSign, quickMoonSign } from "@/lib/astro/quick";
import { ProfileSelectionForm } from "@/components/dashboard/ProfileSelectionForm";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { eyebrow: string; heading: string; intro: (limit: number) => string }> = {
  fr: {
    eyebrow: "Abonnement Premium expiré",
    heading: "Choisissez les profils à garder",
    intro: (limit) =>
      `Votre offre gratuite couvre ${limit} profils. Choisissez ceux que vous gardez actifs : les autres sont archivés, pas supprimés, et redeviennent accessibles dès que vous reprenez Premium.`,
  },
  en: {
    eyebrow: "Premium subscription expired",
    heading: "Choose which profiles to keep",
    intro: (limit) =>
      `Your free plan covers ${limit} profiles. Choose which ones stay active: the rest are archived, not deleted, and become accessible again as soon as you go Premium.`,
  },
};

// Écran bloquant (voir dashboard/layout.tsx) affiché quand un compte
// non-Premium se retrouve avec plus de profils actifs que la limite
// gratuite — typiquement juste après la fin d'un abonnement pendant lequel
// plusieurs profils ont été créés. Redirige si la sélection n'est en fait
// plus nécessaire (ex. abonnement repris, ou déjà résolu par un autre onglet).
export default async function ChoisirProfilsPage() {
  const userId = await requireUserId();
  if (!(await needsProfileSelection(userId))) {
    redirect("/dashboard/profils");
  }

  const [profiles, user] = await Promise.all([
    prisma.profile.findMany({
      where: { userId, archivedAt: null },
      orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];

  const withSigns = profiles.map((profile) => {
    const birthInput = {
      date: profile.birthDate,
      time: profile.birthTime,
      tzName: profile.tzName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timeUnknown: profile.timeUnknown,
    };
    return {
      id: profile.id,
      label: profile.label,
      isSelf: profile.isSelf,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      timeUnknown: profile.timeUnknown,
      locationName: profile.locationName,
      sunSign: quickSunSign(birthInput),
      moonSign: quickMoonSign(birthInput),
    };
  });

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.heading}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t.intro(FREE_PROFILE_LIMIT)}</p>
      <ProfileSelectionForm profiles={withSigns} limit={FREE_PROFILE_LIMIT} locale={locale} />
    </div>
  );
}
