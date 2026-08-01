import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { recordDailyActivity } from "@/lib/streak";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

function isPremiumActive(user: { subscriptionStatus: string; currentPeriodEnd: Date | null }) {
  if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") return false;
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

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
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
