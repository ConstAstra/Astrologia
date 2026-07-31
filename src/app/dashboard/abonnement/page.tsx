import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ManageBillingButton } from "@/components/billing/ManageBillingButton";
import { NotificationToggle } from "@/components/account/NotificationToggle";

const STATUS_LABELS: Record<string, string> = {
  free: "Gratuit",
  trialing: "Essai gratuit en cours",
  active: "Actif",
  past_due: "Paiement en retard",
  canceled: "Résilié",
};

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { success, canceled } = await searchParams;

  const isPremium = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";

  return (
    <div className="mx-auto max-w-2xl">
      <Eyebrow>Abonnement</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">Votre compte</h1>

      {success && (
        <Card className="mt-6 border-sage/40 bg-sage/10 p-4 text-sm text-sage">Paiement confirmé, merci !</Card>
      )}
      {canceled && (
        <Card className="mt-6 border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          Paiement annulé — vous n&apos;avez pas été débité.
        </Card>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Statut</p>
            <p className="font-display mt-1 text-2xl">{STATUS_LABELS[user.subscriptionStatus] ?? user.subscriptionStatus}</p>
          </div>
          {isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>Gratuit</Badge>}
        </div>
        {user.subscriptionPlan && (
          <p className="mt-2 text-sm text-muted">Formule : {user.subscriptionPlan === "monthly" ? "Mensuelle" : "Annuelle"}</p>
        )}
        {user.currentPeriodEnd && (
          <p className="text-sm text-muted">
            {user.subscriptionStatus === "canceled" ? "Accès jusqu'au" : "Renouvellement le"}{" "}
            {new Date(user.currentPeriodEnd).toLocaleDateString("fr-FR")}
          </p>
        )}
        {user.entitlementSource && (
          <p className="mt-1 text-xs text-muted/70">
            Géré via {user.entitlementSource === "stripe" ? "Stripe (web)" : "l'App Store (Apple)"}.
          </p>
        )}

        <p className="mt-4 text-sm text-muted">
          Solde de crédits : <span className="text-gold-strong">{user.credits}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {!isPremium && <ButtonLink href="/tarifs">Passer Premium</ButtonLink>}
          <ButtonLink href="/tarifs" variant="secondary">
            Acheter des crédits
          </ButtonLink>
          {user.entitlementSource === "stripe" && <ManageBillingButton />}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <p className="text-sm text-muted">Notifications</p>
        <div className="mt-3">
          <NotificationToggle initialOptIn={user.dailyHoroscopeOptIn} />
        </div>
      </Card>
    </div>
  );
}
