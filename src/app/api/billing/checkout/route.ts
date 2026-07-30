import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { getStripe } from "@/lib/billing/stripe";
import { CREDIT_PACKS, CURRENCY, SUBSCRIPTION_PLANS } from "@/lib/billing/plans";
import type { CreditPackId, SubscriptionPlanId } from "@/lib/billing/plans";

const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("subscription"), plan: z.enum(["monthly", "annual"]) }),
  z.object({ kind: z.literal("credits"), pack: z.enum(["pack_1", "pack_5", "pack_12"]) }),
]);

function siteUrl(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const stripe = getStripe();
  const base = siteUrl(request);

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  if (parsed.data.kind === "subscription") {
    const planId: SubscriptionPlanId = parsed.data.plan;
    const plan = SUBSCRIPTION_PLANS[planId];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      metadata: { userId: user.id, kind: "subscription", plan: planId },
      subscription_data: {
        trial_period_days: plan.trialDays,
        metadata: { userId: user.id, plan: planId },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: plan.amountCents,
            recurring: { interval: plan.interval },
            product_data: { name: `Astrologia Premium — ${plan.label}` },
          },
        },
      ],
      success_url: `${base}/dashboard/abonnement?success=1`,
      cancel_url: `${base}/dashboard/abonnement?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  }

  const packId: CreditPackId = parsed.data.pack;
  const pack = CREDIT_PACKS[packId];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    client_reference_id: user.id,
    metadata: { userId: user.id, kind: "credits", pack: packId, credits: String(pack.credits) },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: pack.amountCents,
          product_data: { name: `Astrologia — ${pack.label}` },
        },
      },
    ],
    success_url: `${base}/dashboard/abonnement?success=1`,
    cancel_url: `${base}/dashboard/abonnement?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
