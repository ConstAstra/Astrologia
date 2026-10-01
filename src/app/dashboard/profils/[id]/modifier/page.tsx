import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import type { Locale } from "@/lib/astro/interpretations/compose";

const TEXT: Record<Locale, { eyebrow: string; title: (label: string) => string; help: string }> = {
  fr: {
    eyebrow: "Modifier le profil",
    title: (label) => `Date, heure et lieu de naissance de ${label}`,
    help: "Changer la date, l'heure ou le lieu recalcule entièrement le thème : les lectures approfondies déjà générées pour ce profil seront régénérées à la prochaine visite.",
  },
  en: {
    eyebrow: "Edit profile",
    title: (label) => `${label}'s birth date, time and place`,
    help: "Changing the date, time, or place fully recalculates the chart: any in-depth readings already generated for this profile will be regenerated on your next visit.",
  },
};

export default async function ModifierProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId, archivedAt: null } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];

  return (
    <div className="mx-auto max-w-xl">
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.title(profile.label)}</h1>
      <p className="mt-2 text-sm text-muted">{t.help}</p>
      <Card className="mt-6 p-6">
        <ProfileForm
          locale={locale}
          profile={{
            id: profile.id,
            label: profile.label,
            isSelf: profile.isSelf,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            timeUnknown: profile.timeUnknown,
            locationName: profile.locationName,
            latitude: profile.latitude,
            longitude: profile.longitude,
            tzName: profile.tzName,
          }}
        />
      </Card>
    </div>
  );
}
