import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

function isPremiumActive(user: { subscriptionStatus: string; currentPeriodEnd: Date | null }) {
  if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") return false;
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() < Date.now()) return false;
  return true;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  return (
    <>
      <DashboardNav email={user.email} credits={user.credits} isPremium={isPremiumActive(user)} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
