import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { recordDailyActivity } from "@/lib/streak";
import { isPremiumActive, needsProfileSelection } from "@/lib/billing/entitlements";
import { isAdminEmail } from "@/lib/admin";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

const PROFILE_SELECTION_PATH = "/dashboard/profils/choisir";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  // Verrou global : un compte non-Premium qui se retrouve avec plus de
  // profils actifs que la limite gratuite (typiquement juste après la fin
  // d'un abonnement) doit choisir lesquels garder avant de pouvoir utiliser
  // le reste du dashboard — voir /dashboard/profils/choisir. On exclut
  // explicitement cette page elle-même du verrou, sans quoi elle se
  // redirigerait indéfiniment vers elle-même.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname !== PROFILE_SELECTION_PATH && (await needsProfileSelection(user.id))) {
    redirect(PROFILE_SELECTION_PATH);
  }

  const { currentStreak, isNewMilestone } = await recordDailyActivity(user.id, {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
  });

  return (
    <>
      <DashboardNav
        email={user.email}
        credits={user.credits}
        isPremium={isPremiumActive(user)}
        locale={user.locale === "en" ? "en" : "fr"}
        streak={currentStreak}
        streakMilestone={isNewMilestone}
        isAdmin={isAdminEmail(user.email)}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
