import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import {
  CREDIT_PACKS,
  SUBSCRIPTION_PLANS,
  appleProductIdForPack,
  appleProductIdForPlan,
} from "@/lib/billing/plans";
import { FREE_PROFILE_LIMIT } from "@/lib/billing/entitlements";

export const metadata: Metadata = {
  title: "Pricing — Astrologia",
  description: "Free natal chart. Synastry, composite and astrocartography one at a time, or unlimited with Premium.",
};

const PACK_LABEL_EN: Record<keyof typeof CREDIT_PACKS, string> = {
  pack_1: "1 unlock",
  pack_5: "5 unlocks",
  pack_12: "12 unlocks",
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Simple, honest, no surprises</h1>
          <p className="mt-5 text-muted">
            Your full natal chart is, and will remain, free. You only pay to go further: synastry, composite
            chart, astrocartography. Prices in EUR (€).
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col p-8">
              <Eyebrow>Free</Eyebrow>
              <p className="font-display mt-2 text-3xl">€0</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
                <li>✓ Full, unlimited natal chart</li>
                <li>✓ Up to {FREE_PROFILE_LIMIT} saved profiles</li>
                <li>✓ Detailed natal chart interpretations</li>
                <li className="text-muted/60">— Synastry, composite, astrocartography: one at a time (see credits)</li>
              </ul>
            </Card>

            <Card className="flex flex-col border-gold/50 p-8 shadow-[0_0_0_1px_#e8935f33]">
              <Badge tone="gold">Premium — most popular</Badge>
              <p className="font-display mt-2 text-3xl">
                €{(SUBSCRIPTION_PLANS.monthly.amountCents / 100).toFixed(2)} <span className="text-base text-muted">/ month</span>
              </p>
              <p className="text-xs text-muted">Free {SUBSCRIPTION_PLANS.monthly.trialDays}-day trial</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
                <li>✓ Everything in the free plan</li>
                <li>✓ Unlimited synastry</li>
                <li>✓ Unlimited composite chart</li>
                <li>✓ Unlimited astrocartography</li>
                <li>✓ Unlimited profiles</li>
              </ul>
              <div className="mt-6">
                <CheckoutButton
                  locale="en"
                  target={{ kind: "subscription", plan: "monthly", appleProductId: appleProductIdForPlan("monthly") }}
                >
                  Try Premium
                </CheckoutButton>
              </div>
            </Card>

            <Card className="flex flex-col p-8">
              <Eyebrow>Premium annual</Eyebrow>
              <p className="font-display mt-2 text-3xl">
                €{(SUBSCRIPTION_PLANS.annual.amountCents / 100).toFixed(0)} <span className="text-base text-muted">/ year</span>
              </p>
              <p className="text-xs text-sage">
                That&apos;s €{(SUBSCRIPTION_PLANS.annual.amountCents / 1200).toFixed(2)}/month — save about{" "}
                {Math.round((1 - SUBSCRIPTION_PLANS.annual.amountCents / (SUBSCRIPTION_PLANS.monthly.amountCents * 12)) * 100)}
                %
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
                <li>✓ Everything in Premium</li>
                <li>✓ Simplified annual billing</li>
                <li>✓ Free {SUBSCRIPTION_PLANS.annual.trialDays}-day trial</li>
              </ul>
              <div className="mt-6">
                <CheckoutButton
                  locale="en"
                  variant="secondary"
                  target={{ kind: "subscription", plan: "annual", appleProductId: appleProductIdForPlan("annual") }}
                >
                  Try annual
                </CheckoutButton>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <Eyebrow>One at a time</Eyebrow>
            <h2 className="font-display mt-3 text-3xl">Don&apos;t want to subscribe?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Buy credits and unlock exactly the reading you need — a synastry, a composite or an
              astrocartography. A credit spent on a pair of profiles unlocks it forever, no need to pay again
              to re-read it.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {(Object.entries(CREDIT_PACKS) as [keyof typeof CREDIT_PACKS, (typeof CREDIT_PACKS)[keyof typeof CREDIT_PACKS]][]).map(
              ([id, pack]) => (
                <Card key={id} className="flex flex-col p-6 text-center">
                  <p className="font-display text-2xl">{PACK_LABEL_EN[id]}</p>
                  <p className="mt-2 text-2xl text-gold-strong">€{(pack.amountCents / 100).toFixed(2)}</p>
                  <p className="mt-1 text-xs text-muted">
                    €{(pack.amountCents / 100 / pack.credits).toFixed(2)} / unlock
                  </p>
                  <div className="mt-5">
                    <CheckoutButton
                      locale="en"
                      variant="secondary"
                      target={{ kind: "credits", pack: id, appleProductId: appleProductIdForPack(id) }}
                    >
                      Buy
                    </CheckoutButton>
                  </div>
                </Card>
              )
            )}
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
