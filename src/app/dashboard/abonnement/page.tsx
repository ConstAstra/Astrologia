import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth/session";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ManageBillingButton } from "@/components/billing/ManageBillingButton";
import { NotificationToggle } from "@/components/account/NotificationToggle";
import { PushNotificationToggle } from "@/components/account/PushNotificationToggle";
import { StreakReminderToggle } from "@/components/account/StreakReminderToggle";
import { FriendActivityPushToggle } from "@/components/account/FriendActivityPushToggle";
import { UpcomingTransitAlertToggle } from "@/components/account/UpcomingTransitAlertToggle";
import { ReferralCard } from "@/components/account/ReferralCard";
import { ChangeEmailForm } from "@/components/account/ChangeEmailForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import type { Locale } from "@/lib/astro/interpretations/compose";

const STATUS_LABELS: Record<Locale, Record<string, string>> = {
  fr: {
    free: "Gratuit",
    trialing: "Essai gratuit en cours",
    active: "Actif",
    past_due: "Paiement en retard",
    canceled: "Résilié",
  },
  en: {
    free: "Free",
    trialing: "Free trial in progress",
    active: "Active",
    past_due: "Payment overdue",
    canceled: "Canceled",
  },
};

const TEXT: Record<Locale, {
  eyebrow: string;
  title: string;
  paymentConfirmed: string;
  paymentCanceled: string;
  status: string;
  premium: string;
  free: string;
  plan: (p: string) => string;
  monthly: string;
  yearly: string;
  accessUntil: string;
  renewsOn: string;
  managedVia: (source: string) => string;
  stripeWeb: string;
  appleStore: string;
  creditsBalance: string;
  goPremium: string;
  buyCredits: string;
  referral: string;
  notifications: string;
  account: string;
  changeEmail: string;
  changePassword: string;
  dangerZone: string;
  giftCode: string;
}> = {
  fr: {
    eyebrow: "Abonnement",
    title: "Votre compte",
    paymentConfirmed: "Paiement confirmé, merci !",
    paymentCanceled: "Paiement annulé — vous n'avez pas été débité.",
    status: "Statut",
    premium: "Premium",
    free: "Gratuit",
    plan: (p) => `Formule : ${p}`,
    monthly: "Mensuelle",
    yearly: "Annuelle",
    accessUntil: "Accès jusqu'au",
    renewsOn: "Renouvellement le",
    managedVia: (source) => `Géré via ${source}.`,
    stripeWeb: "Stripe (web)",
    appleStore: "l'App Store (Apple)",
    creditsBalance: "Solde de crédits :",
    goPremium: "Passer Premium",
    buyCredits: "Acheter des crédits",
    referral: "Parrainage",
    notifications: "Notifications",
    account: "Compte",
    changeEmail: "Adresse e-mail",
    changePassword: "Mot de passe",
    dangerZone: "Zone dangereuse",
    giftCode: "Un code cadeau ?",
  },
  en: {
    eyebrow: "Subscription",
    title: "Your account",
    paymentConfirmed: "Payment confirmed, thank you!",
    paymentCanceled: "Payment canceled — you were not charged.",
    status: "Status",
    premium: "Premium",
    free: "Free",
    plan: (p) => `Plan: ${p}`,
    monthly: "Monthly",
    yearly: "Yearly",
    accessUntil: "Access until",
    renewsOn: "Renews on",
    managedVia: (source) => `Managed via ${source}.`,
    stripeWeb: "Stripe (web)",
    appleStore: "the App Store (Apple)",
    creditsBalance: "Credit balance:",
    goPremium: "Go Premium",
    buyCredits: "Buy credits",
    referral: "Referral",
    notifications: "Notifications",
    account: "Account",
    changeEmail: "Email address",
    changePassword: "Password",
    dangerZone: "Danger zone",
    giftCode: "Got a gift code?",
  },
};

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { success, canceled } = await searchParams;

  const locale: Locale = user.locale === "en" ? "en" : "fr";
  const t = TEXT[locale];
  const statusLabels = STATUS_LABELS[locale];

  const isPremium = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
  const successfulReferrals = await prisma.user.count({
    where: { referredByUserId: user.id, referralRewardGranted: true },
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const signupPath = locale === "en" ? "/en/signup" : "/inscription";
  const referralUrl = `${siteUrl}${signupPath}?ref=${user.referralCode}`;

  return (
    <div className="mx-auto max-w-2xl">
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-3xl">{t.title}</h1>

      {success && <Card className="mt-6 border-sage/40 bg-sage/10 p-4 text-sm text-sage">{t.paymentConfirmed}</Card>}
      {canceled && (
        <Card className="mt-6 border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          {t.paymentCanceled}
        </Card>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">{t.status}</p>
            <p className="font-display mt-1 text-2xl">{statusLabels[user.subscriptionStatus] ?? user.subscriptionStatus}</p>
          </div>
          {isPremium ? <Badge tone="gold">{t.premium}</Badge> : <Badge>{t.free}</Badge>}
        </div>
        {user.subscriptionPlan && (
          <p className="mt-2 text-sm text-muted">
            {t.plan(user.subscriptionPlan === "monthly" ? t.monthly : t.yearly)}
          </p>
        )}
        {user.currentPeriodEnd && (
          <p className="text-sm text-muted">
            {user.subscriptionStatus === "canceled" ? t.accessUntil : t.renewsOn}{" "}
            {new Date(user.currentPeriodEnd).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR")}
          </p>
        )}
        {user.entitlementSource && (
          <p className="mt-1 text-xs text-muted/70">
            {t.managedVia(user.entitlementSource === "stripe" ? t.stripeWeb : t.appleStore)}
          </p>
        )}

        <p className="mt-4 text-sm text-muted">
          {t.creditsBalance} <span className="text-gold-strong">{user.credits}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {!isPremium && <ButtonLink href={locale === "en" ? "/en/pricing" : "/tarifs"}>{t.goPremium}</ButtonLink>}
          <ButtonLink href={locale === "en" ? "/en/pricing" : "/tarifs"} variant="secondary">
            {t.buyCredits}
          </ButtonLink>
          {user.entitlementSource === "stripe" && <ManageBillingButton locale={locale} />}
        </div>
        <p className="mt-4 text-xs text-muted">
          <ButtonLink href="/dashboard/cadeau" variant="ghost" size="sm">
            {t.giftCode}
          </ButtonLink>
        </p>
      </Card>

      <Card className="mt-6 p-6">
        <p className="text-sm text-muted">{t.referral}</p>
        <div className="mt-3">
          <ReferralCard referralUrl={referralUrl} successfulReferrals={successfulReferrals} locale={locale} />
        </div>
      </Card>

      <Card className="mt-6 space-y-5 p-6">
        <p className="text-sm text-muted">{t.notifications}</p>
        <NotificationToggle initialOptIn={user.dailyHoroscopeOptIn} locale={locale} />
        <div className="border-t border-border-soft pt-5">
          <PushNotificationToggle initialOptIn={user.dailyTransitPushOptIn} locale={locale} />
        </div>
        <div className="border-t border-border-soft pt-5">
          <StreakReminderToggle initialOptIn={user.streakReminderOptIn} locale={locale} />
        </div>
        <div className="border-t border-border-soft pt-5">
          <FriendActivityPushToggle initialOptIn={user.friendActivityPushOptIn} locale={locale} />
        </div>
        <div className="border-t border-border-soft pt-5">
          <UpcomingTransitAlertToggle initialOptIn={user.upcomingTransitAlertOptIn} locale={locale} />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <p className="font-display text-xl">{t.account}</p>
        <div className="mt-4">
          <p className="text-sm text-muted">{t.changeEmail}</p>
          <div className="mt-2">
            <ChangeEmailForm currentEmail={user.email} locale={locale} />
          </div>
        </div>
        <div className="mt-6 border-t border-border-soft pt-6">
          <p className="text-sm text-muted">{t.changePassword}</p>
          <div className="mt-2">
            <ChangePasswordForm locale={locale} />
          </div>
        </div>
        <div className="mt-6 border-t border-border-soft pt-6">
          <p className="text-sm text-muted">{t.dangerZone}</p>
          <div className="mt-2">
            <DeleteAccountForm locale={locale} />
          </div>
        </div>
      </Card>
    </div>
  );
}
