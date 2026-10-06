import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { ClaimDraftProfile } from "@/components/theme-astral/ClaimDraftProfile";
import type { Locale } from "@/lib/astro/interpretations/compose";

export default async function ReclamerProfilPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const locale: Locale = user.locale === "en" ? "en" : "fr";

  return <ClaimDraftProfile locale={locale} />;
}
