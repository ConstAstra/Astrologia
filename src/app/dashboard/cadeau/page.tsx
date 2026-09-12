import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow } from "@/components/ui/Card";
import { GiftCodeRedeemForm } from "@/components/dashboard/GiftCodeRedeemForm";
import type { Locale } from "@/lib/astro/interpretations/compose";

const TEXT: Record<Locale, { eyebrow: string; title: string; intro: string }> = {
  fr: {
    eyebrow: "Code cadeau",
    title: "Vous avez un code cadeau ?",
    intro: "Saisissez-le ci-dessous pour débloquer votre accès Premium ou vos crédits offerts.",
  },
  en: {
    eyebrow: "Gift code",
    title: "Got a gift code?",
    intro: "Enter it below to unlock your gifted Premium access or credits.",
  },
};

export default async function CadeauPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];

  return (
    <div className="mx-auto max-w-lg">
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.intro}</p>

      <Card className="mt-6 p-6">
        <GiftCodeRedeemForm locale={locale} />
      </Card>
    </div>
  );
}
