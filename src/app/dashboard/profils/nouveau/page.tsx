import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import type { Locale } from "@/lib/astro/interpretations/compose";

const TEXT: Record<Locale, { eyebrow: string; title: string; help: string }> = {
  fr: {
    eyebrow: "Nouveau profil",
    title: "Date, heure et lieu de naissance",
    help: "Plus l'heure est précise, plus l'Ascendant et les maisons seront fiables : une erreur de quelques minutes peut suffire à changer de signe ascendant en fin de degré.",
  },
  en: {
    eyebrow: "New profile",
    title: "Birth date, time and place",
    help: "The more precise the time, the more reliable the Ascendant and houses will be: an error of a few minutes can be enough to change the ascendant sign near the end of a degree.",
  },
};

export default async function NouveauProfilPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];

  return (
    <div className="mx-auto max-w-xl">
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.help}</p>
      <Card className="mt-6 p-6">
        <ProfileForm locale={locale} />
      </Card>
    </div>
  );
}
