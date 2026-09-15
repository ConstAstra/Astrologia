import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { getStripe } from "@/lib/billing/stripe";
import { createRateLimiter } from "@/lib/rate-limit";

// Même coût/quota API Stripe qu'un checkout — voir billing/checkout/route.ts.
const portalLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (portalLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement Stripe associé à ce compte." }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${base}/dashboard/abonnement`,
  });

  return NextResponse.json({ url: session.url });
}
