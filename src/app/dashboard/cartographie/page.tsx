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
    eyebrow: "Cartographie astrologique",
    heading: "Choisissez un profil",
    intro: "Vos lignes planétaires dépendent d'un thème précis — choisissez le profil à consulter.",
  },
  en: {
    eyebrow: "Astrocartography",
    heading: "Choose a profile",
    intro: "Your planetary lines depend on a specific chart — choose which profile to consult.",
  },
};

// Fonctionnalité liée à un profil précis : ce point d'entrée du menu du haut
// redirige directement s'il n'y a qu'un seul profil (le cas le plus courant,
// son propre thème), et propose un choix uniquement s'il y en a plusieurs.
export default async function CartographieIndexPage() {
  const userId = await requireUserId();
  const [profiles, user] = await Promise.all([
    prisma.profile.findMany({
      where: { userId },
      orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  if (profiles.length === 0) redirect("/dashboard/profils/nouveau");
  if (profiles.length === 1) redirect(`/dashboard/cartographie/${profiles[0].id}`);

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;

  return (
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.heading}</h1>
      <p className="mt-2 text-sm text-muted">{t.intro}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => {
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
            <Link key={profile.id} href={`/dashboard/cartographie/${profile.id}`}>
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
