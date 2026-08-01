import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Eyebrow } from "@/components/ui/Card";
import { quickSunSign, quickMoonSign } from "@/lib/astro/quick";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
import { AvatarEditor } from "@/components/avatar/AvatarEditor";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { eyebrow: string; heading: (label: string) => string }> = {
  fr: { eyebrow: "Personnalisation", heading: (label) => `Avatar de ${label}` },
  en: { eyebrow: "Customization", heading: (label) => `${label}'s avatar` },
};

export default async function AvatarEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const [profile, user] = await Promise.all([
    prisma.profile.findFirst({ where: { id, userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);
  if (!profile) notFound();

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];

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
    <div>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.heading(profile.label)}</h1>

      <div className="mt-8">
        <AvatarEditor
          profileId={profile.id}
          seed={profile.id}
          sunSign={sunSign}
          moonSign={moonSign}
          initialOverrides={overrides}
          locale={locale}
        />
      </div>
    </div>
  );
}
