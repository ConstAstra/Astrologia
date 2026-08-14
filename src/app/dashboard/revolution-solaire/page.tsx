import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow } from "@/components/ui/Card";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { quickSunSign, quickMoonSign } from "@/lib/astro/quick";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";

type Locale = "fr" | "en";

const TEXT: Record<
  Locale,
  { eyebrow: string; heading: string; intro: string }
> = {
  fr: {
    eyebrow: "Révolution solaire",
    heading: "Choisissez un profil",
    intro: "La révolution solaire dépend d'une date, heure et lieu de naissance précis — choisissez le profil à consulter.",
  },
  en: {
    eyebrow: "Solar return",
    heading: "Choose a profile",
    intro: "The solar return depends on a specific birth date, time and place — choose which profile to consult.",
  },
};

// Fonctionnalité liée à un profil précis : ce point d'entrée du menu du haut
// redirige directement s'il n'y a qu'un seul profil (le cas le plus courant,
// son propre thème), et propose un choix uniquement s'il y en a plusieurs.
export default async function RevolutionSolaireIndexPage() {
  const userId = await requireUserId();
  const [profiles, user] = await Promise.all([
    prisma.profile.findMany({
      where: { userId, archivedAt: null },
      orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  if (profiles.length === 0) redirect("/dashboard/profils/nouveau");
  if (profiles.length === 1) redirect(`/dashboard/revolution-solaire/${profiles[0].id}`);

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.heading}</h1>
      <p className="mt-2 text-sm text-muted">{t.intro}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile, i) => {
          const birthInput = {
            date: profile.birthDate,
            time: profile.birthTime,
            tzName: profile.tzName,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timeUnknown: profile.timeUnknown,
          };
          const sunSign = quickSunSign(birthInput);
          const moonSign = quickMoonSign(birthInput);
          let overrides: AvatarOverrides | undefined;
          if (profile.avatarOverrides) {
            try {
              overrides = JSON.parse(profile.avatarOverrides) as AvatarOverrides;
            } catch {
              overrides = undefined;
            }
          }
          return (
            <Link
              key={profile.id}
              href={`/dashboard/revolution-solaire/${profile.id}`}
              className="stagger-item"
              style={{ "--stagger-i": i } as CSSProperties}
            >
              <Card interactive className="flex items-center gap-4 p-6 transition-colors hover:border-gold/40">
                <PixelAvatar seed={profile.id} sunSign={sunSign} moonSign={moonSign} overrides={overrides} size={56} />
                <div>
                  <p className="font-display text-lg">{profile.label}</p>
                  <p className="text-xs text-gold-strong">{signMap[sunSign].name}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
