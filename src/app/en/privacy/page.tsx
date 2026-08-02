import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Privacy — Astrologium" };

export default function PrivacyEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Privacy policy</h1>
          <Card className="mt-8 space-y-6 p-8 text-sm leading-relaxed text-muted">
            <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-4 text-terracotta">
              Indicative template, to be reviewed by a professional before production use — in particular
              for full GDPR compliance (record of processing activities, precise legal basis per purpose,
              data protection officer where applicable).
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Data collected</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Account: e-mail, password (hashed, never stored in plain text), optional name.</li>
                <li>
                  Astrological profiles: date, time, and place of birth (a sensitive data point in that it
                  indirectly reveals personal information) — used solely for the requested calculations.
                </li>
                <li>Billing: handled by Stripe and/or Apple, which process payment details directly — we never store any card data.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Purposes</h2>
              <p className="mt-2">
                Providing the requested calculations and interpretations, managing your subscription and
                credits, and securing your account. No data is ever sold to third parties.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Subprocessors</h2>
              <p className="mt-2">
                Application hosting and database [TO COMPLETE], Stripe (web payments), Apple (iOS in-app
                purchases), OpenStreetMap/Nominatim geocoding service (processes the entered birthplace to
                convert it into coordinates).
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Your rights</h2>
              <p className="mt-2">
                Under the GDPR, you have the right to access, rectify, erase, and port your data. You can
                delete your profiles at any time from your dashboard, or request full account deletion at
                [TO COMPLETE — contact e-mail].
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Retention</h2>
              <p className="mt-2">
                Account data and profiles are kept for as long as the account remains active. Deleting your
                account deletes the associated profiles.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
