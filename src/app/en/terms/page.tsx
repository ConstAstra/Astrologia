import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Terms — Astrologium" };

export default function TermsEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Terms of use and sale</h1>
          <Card className="mt-8 space-y-6 p-8 text-sm leading-relaxed text-muted">
            <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-4 text-terracotta">
              Indicative template, to be reviewed by a legal professional before commercialization.
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">1. Purpose</h2>
              <p className="mt-2">
                Astrologium provides astrological calculations and interpretations (natal chart, synastry,
                composite chart, astrocartography) for personal reflection and entertainment purposes. The
                service does not constitute professional advice (medical, legal, financial, or psychological)
                and does not guarantee any prediction of future events.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">2. Plans and payment</h2>
              <p className="mt-2">
                A free account allows unlimited natal chart creation. Some features (synastry, composite
                chart, astrocartography) require either a Premium subscription (monthly or annual,
                cancellable at any time, free trial depending on the current offer) or the purchase of
                individual credits. Payments are processed by Stripe (web) or Apple (iOS app); Astrologium
                never stores any payment card details.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">3. Withdrawal and refunds</h2>
              <p className="mt-2">
                In accordance with regulations applicable to digital content delivered immediately after
                purchase, the right of withdrawal may not apply once a feature has been unlocked.
                Subscriptions can be cancelled at any time from the subscription management area (Stripe) or
                via Apple ID settings (App Store), with no renewal beyond the current period.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">4. Liability</h2>
              <p className="mt-2">
                The interpretations provided are symbolic and general in nature. Users remain solely
                responsible for decisions made based on this content. Astrologium strives to ensure the
                accuracy of its astronomical calculations but cannot guarantee absolute accuracy, in
                particular when an imprecise birth time is provided by the user.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">5. Account termination</h2>
              <p className="mt-2">
                You can delete your account at any time. An active subscription must be cancelled separately
                (Stripe or the App Store) before account deletion to avoid any renewal.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
