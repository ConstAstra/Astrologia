import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";
import { SUBSCRIPTION_PLANS } from "@/lib/billing/plans";
import { Card, Eyebrow } from "@/components/ui/Card";
import { GiftCodeManager } from "@/components/admin/GiftCodeManager";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display mt-1 text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted/70">{hint}</p>}
    </Card>
  );
}

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) notFound();

  const now = new Date();
  const cutoff30 = isoDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

  const [
    totalUsers,
    statusGroups,
    payingPlanGroups,
    activeSourceGroups,
    creditAgg,
    recentSignups,
    recentlyActive,
    giftCodes,
    pageViewsByPath,
    pageViewsTotalAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["subscriptionStatus"], _count: { _all: true } }),
    prisma.user.groupBy({ by: ["subscriptionPlan"], where: { subscriptionStatus: "active" }, _count: { _all: true } }),
    prisma.user.groupBy({
      by: ["entitlementSource"],
      where: { subscriptionStatus: { in: ["active", "trialing"] } },
      _count: { _all: true },
    }),
    prisma.creditGrant.aggregate({ _sum: { creditsAdded: true, amountCents: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, createdAt: true, subscriptionStatus: true },
    }),
    prisma.user.findMany({
      where: { lastActiveDate: { not: null } },
      orderBy: { lastActiveDate: "desc" },
      take: 10,
      select: { id: true, email: true, lastActiveDate: true, currentStreak: true },
    }),
    prisma.giftCode.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { date: { gte: cutoff30 } },
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: 15,
    }),
    prisma.pageView.aggregate({ where: { date: { gte: cutoff30 } }, _sum: { count: true } }),
  ]);

  const statusCount = (status: string) =>
    statusGroups.find((g: { subscriptionStatus: string; _count: { _all: number } }) => g.subscriptionStatus === status)?._count
      ._all ?? 0;
  const activeCount = statusCount("active");
  const trialingCount = statusCount("trialing");
  const freeCount = statusCount("free");
  const pastDueCount = statusCount("past_due");
  const canceledCount = statusCount("canceled");
  const subscriberCount = activeCount + trialingCount;

  const payingMonthly =
    payingPlanGroups.find((g: { subscriptionPlan: string | null; _count: { _all: number } }) => g.subscriptionPlan === "monthly")
      ?._count._all ?? 0;
  const payingAnnual =
    payingPlanGroups.find((g: { subscriptionPlan: string | null; _count: { _all: number } }) => g.subscriptionPlan === "annual")
      ?._count._all ?? 0;
  const mrrCents = payingMonthly * SUBSCRIPTION_PLANS.monthly.amountCents + payingAnnual * Math.round(SUBSCRIPTION_PLANS.annual.amountCents / 12);

  const stripeCount =
    activeSourceGroups.find((g: { entitlementSource: string | null; _count: { _all: number } }) => g.entitlementSource === "stripe")
      ?._count._all ?? 0;
  const appleCount =
    activeSourceGroups.find((g: { entitlementSource: string | null; _count: { _all: number } }) => g.entitlementSource === "apple")
      ?._count._all ?? 0;

  const creditsGranted = creditAgg._sum.creditsAdded ?? 0;
  const creditsRevenueCents = creditAgg._sum.amountCents ?? 0;
  const pageViewsTotal = pageViewsTotalAgg._sum.count ?? 0;

  return (
    <div>
      <Eyebrow>Admin</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">Tableau de bord</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Visible uniquement pour {admin.email}. Cette page n&apos;apparaît dans aucune navigation publique.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={String(totalUsers)} />
        <StatCard
          label="Abonnés"
          value={String(subscriberCount)}
          hint={`${activeCount} actifs · ${trialingCount} en essai`}
        />
        <StatCard label="Gratuits" value={String(freeCount)} hint={`${pastDueCount} en retard · ${canceledCount} résiliés`} />
        <StatCard
          label="MRR estimé"
          value={formatEur(mrrCents)}
          hint={`${payingMonthly} mensuel · ${payingAnnual} annuel (hors essai)`}
        />
        <StatCard label="Crédits vendus" value={String(creditsGranted)} hint={formatEur(creditsRevenueCents) + " encaissés"} />
        <StatCard label="Via Stripe (web)" value={String(stripeCount)} />
        <StatCard label="Via Apple" value={String(appleCount)} />
        <StatCard label="Pages vues (30j)" value={String(pageViewsTotal)} />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="font-medium">Inscriptions récentes</p>
          {recentSignups.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aucune inscription pour l&apos;instant.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recentSignups.map((u: { id: string; email: string; createdAt: Date; subscriptionStatus: string }) => (
                <li key={u.id} className="flex items-center justify-between gap-3 border-t border-border-soft pt-2 first:border-t-0 first:pt-0">
                  <span className="truncate text-muted">{u.email}</span>
                  <span className="shrink-0 text-xs text-muted/70">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")} · {u.subscriptionStatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <p className="font-medium">Actifs récemment</p>
          {recentlyActive.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aucune activité enregistrée pour l&apos;instant.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recentlyActive.map((u: { id: string; email: string; lastActiveDate: string | null; currentStreak: number }) => (
                <li key={u.id} className="flex items-center justify-between gap-3 border-t border-border-soft pt-2 first:border-t-0 first:pt-0">
                  <span className="truncate text-muted">{u.email}</span>
                  <span className="shrink-0 text-xs text-muted/70">
                    {u.lastActiveDate} · série {u.currentStreak}j
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mt-10">
        <Card className="p-5">
          <p className="font-medium">Trafic — 30 derniers jours ({pageViewsTotal} pages vues)</p>
          {pageViewsByPath.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Pas encore de données. Le compteur se remplit au fil des visites une fois déployé.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {pageViewsByPath.map((p: { path: string; _sum: { count: number | null } }) => (
                <li key={p.path} className="flex items-center justify-between gap-3 border-t border-border-soft pt-1.5 first:border-t-0 first:pt-0">
                  <span className="truncate font-mono text-xs text-muted">{p.path}</span>
                  <span className="shrink-0 text-gold-strong">{p._sum.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Codes cadeaux</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Un code offert (abonnement Premium ou crédits) qu&apos;une personne saisit sur /dashboard/cadeau pour en bénéficier.
        </p>
        <div className="mt-4">
          <GiftCodeManager
            initialCodes={giftCodes.map((g: (typeof giftCodes)[number]) => ({
              id: g.id,
              code: g.code,
              label: g.label,
              grantType: g.grantType,
              subscriptionPlan: g.subscriptionPlan,
              durationDays: g.durationDays,
              creditsAmount: g.creditsAmount,
              maxRedemptions: g.maxRedemptions,
              redemptionCount: g.redemptionCount,
              active: g.active,
              expiresAt: g.expiresAt ? g.expiresAt.toISOString() : null,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
