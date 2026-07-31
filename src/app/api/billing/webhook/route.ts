import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/billing/stripe";
import type { SubscriptionPlanId } from "@/lib/billing/plans";
import { grantReferralRewardOnce } from "@/lib/billing/entitlements";
import { sendEmail } from "@/lib/email";

const PAYMENT_ISSUE_TEXT = {
  fr: {
    failedSubject: "Échec de paiement — Astrologia",
    failedBody: (url: string) =>
      `<p>Bonjour,</p><p>Le paiement de votre abonnement Astrologia a échoué. Merci de mettre à jour votre moyen de paiement pour éviter une interruption de votre accès Premium.</p><p><a href="${url}">Mettre à jour mon moyen de paiement</a></p>`,
    actionSubject: "Action requise pour votre paiement — Astrologia",
    actionBody: (url: string) =>
      `<p>Bonjour,</p><p>Votre banque demande une confirmation supplémentaire pour valider le paiement de votre abonnement Astrologia (authentification 3D Secure).</p><p><a href="${url}">Confirmer mon paiement</a></p>`,
  },
  en: {
    failedSubject: "Payment failed — Astrologia",
    failedBody: (url: string) =>
      `<p>Hello,</p><p>The payment for your Astrologia subscription failed. Please update your payment method to avoid losing your Premium access.</p><p><a href="${url}">Update my payment method</a></p>`,
    actionSubject: "Action required for your payment — Astrologia",
    actionBody: (url: string) =>
      `<p>Hello,</p><p>Your bank requires additional confirmation to validate the payment for your Astrologia subscription (3D Secure authentication).</p><p><a href="${url}">Confirm my payment</a></p>`,
  },
};

async function findUserIdForCustomer(customerId: string, metadataUserId?: string | null) {
  if (metadataUserId) return metadataUserId;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  return user?.id ?? null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const userId = await findUserIdForCustomer(customerId, subscription.metadata?.userId);
  if (!userId) {
    console.error("Webhook Stripe: impossible de retrouver l'utilisateur pour le customer", customerId);
    return;
  }

  const plan = (subscription.metadata?.plan as SubscriptionPlanId | undefined) ?? null;
  const item = subscription.items.data[0];
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: plan,
      entitlementSource: "stripe",
      currentPeriodEnd,
    },
  });

  // Le parrainage n'est récompensé qu'au premier paiement réel — pas à la
  // création de l'abonnement, qui peut n'être qu'un essai gratuit pas
  // encore facturé. `status: "active"` couvre aussi bien l'abonnement sans
  // essai que la conversion post-essai (Stripe renvoie alors un nouvel
  // événement `customer.subscription.updated`, qui repasse par cette même
  // fonction).
  if (subscription.status === "active") {
    await grantReferralRewardOnce(userId);
  }
}

async function notifyPaymentIssue(invoice: Stripe.Invoice, kind: "failed" | "action_required") {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const userId = await findUserIdForCustomer(customerId, null);
  if (!userId) {
    console.error(`Webhook Stripe: impossible de retrouver l'utilisateur pour le paiement ${kind}`, customerId);
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const locale: "fr" | "en" = user.locale === "en" ? "en" : "fr";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const actionUrl = invoice.hosted_invoice_url ?? `${siteUrl}/dashboard/abonnement`;
  const t = PAYMENT_ISSUE_TEXT[locale];

  await sendEmail({
    to: user.email,
    subject: kind === "failed" ? t.failedSubject : t.actionSubject,
    html: kind === "failed" ? t.failedBody(actionUrl) : t.actionBody(actionUrl),
  });
}

async function grantCreditsOnce(params: {
  userId: string;
  externalId: string;
  credits: number;
  amountCents: number | null;
  currency: string | null;
}) {
  const existing = await prisma.creditGrant.findUnique({ where: { externalId: params.externalId } });
  if (existing) return; // idempotence : déjà crédité

  await prisma.$transaction([
    prisma.creditGrant.create({
      data: {
        userId: params.userId,
        source: "stripe",
        externalId: params.externalId,
        creditsAdded: params.credits,
        amountCents: params.amountCents,
        currency: params.currency,
      },
    }),
    prisma.user.update({ where: { id: params.userId }, data: { credits: { increment: params.credits } } }),
  ]);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Signature Stripe invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.userId;
      if (!userId) break;

      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription);
      } else if (session.mode === "payment") {
        const credits = Number(session.metadata?.credits ?? 0);
        if (credits > 0) {
          await grantCreditsOnce({
            userId,
            externalId: session.id,
            credits,
            amountCents: session.amount_total,
            currency: session.currency,
          });
          await grantReferralRewardOnce(userId);
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const userId = await findUserIdForCustomer(customerId, subscription.metadata?.userId);
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "canceled" },
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      // Le statut de l'abonnement lui-même (past_due, unpaid...) est mis à
      // jour séparément via customer.subscription.updated, que Stripe
      // envoie aussi lors d'un échec de paiement — cet événement sert
      // uniquement à prévenir l'utilisateur pour qu'il agisse vite.
      await notifyPaymentIssue(event.data.object as Stripe.Invoice, "failed");
      break;
    }
    case "invoice.payment_action_required": {
      await notifyPaymentIssue(event.data.object as Stripe.Invoice, "action_required");
      break;
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      console.error(
        `[ALERTE] Litige Stripe (chargeback) créé : charge=${dispute.charge}, montant=${dispute.amount}${dispute.currency}, motif=${dispute.reason}. Répondre dans le dashboard Stripe avant l'échéance.`
      );
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
