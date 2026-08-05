import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { quickSunSign } from "@/lib/astro/quick";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { CompatInviteForm } from "@/components/duo/CompatInviteForm";

const TEXT = {
  fr: {
    eyebrow: "Test rapide",
    title: (name: string) => `${name} & toi, ça donne quoi ?`,
    body: "Choisis ton prénom et ton signe pour voir votre compatibilité en 10 secondes — sans créer de compte.",
  },
  en: {
    eyebrow: "Quick test",
    title: (name: string) => `${name} & you, what does it give?`,
    body: "Pick your name and sign to see your compatibility in 10 seconds — no account needed.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const owner = await prisma.user.findUnique({ where: { referralCode: code }, select: { name: true, locale: true } });
  if (!owner) return {};
  const locale = owner.locale === "en" ? "en" : "fr";
  const name = owner.name?.trim() || (locale === "en" ? "Someone" : "Quelqu'un");
  return {
    title: `${TEXT[locale].title(name)} — Astrologium`,
    description: TEXT[locale].body,
  };
}

export default async function CompatInvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const owner = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { name: true, locale: true, profiles: { where: { isSelf: true }, take: 1 } },
  });
  const profile = owner?.profiles[0];
  // On préfère ne rien afficher plutôt qu'une page cassée : sans profil "soi"
  // côté propriétaire du lien, il n'y a rien de réel à comparer.
  if (!owner || !profile) notFound();

  const locale: "fr" | "en" = owner.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const ownerName = owner.name?.trim() || profile.label;
  const ownerSign = quickSunSign({
    date: profile.birthDate,
    time: profile.birthTime,
    tzName: profile.tzName,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timeUnknown: profile.timeUnknown,
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">{t.title(ownerName)}</h1>
          <p className="mt-5 text-muted">{t.body}</p>
          <p className="mt-3 text-sm text-gold-strong">
            {signMap[ownerSign].symbol} {ownerName} — {signMap[ownerSign].name}
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <CompatInviteForm code={code} ownerName={ownerName} ownerSign={ownerSign} locale={locale} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
