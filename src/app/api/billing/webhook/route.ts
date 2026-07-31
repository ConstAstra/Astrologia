import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/billing/stripe";
import type { SubscriptionPlanId } from "@/lib/billing/plans";
import { grantReferralRewardOnce } from "@/lib/billing/entitlements";

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
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
