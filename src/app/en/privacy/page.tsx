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
              This page describes how Astrologium actually processes your data. Business registration (French
              SIRET) is in progress; only the operator&apos;s identity and contact address remain to be filled
              in, which does not affect the commitments described here.
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Data collected</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Account: e-mail, password (hashed with bcrypt, never stored or transmitted in plain text), optional name, preferred language.</li>
                <li>
                  Astrological profiles: date, time, and place of birth, and the geographic coordinates derived
                  from them — data we treat with particular care because it can indirectly reveal personal
                  information, even though the GDPR does not formally classify it as &quot;special category&quot;
                  data under Article 9.
                </li>
                <li>Personalization: avatar visual choices you save yourself; no new information is inferred beyond what you selected.</li>
                <li>Usage: login streaks and timestamps of your last readings, used to track your own progress.</li>
                <li>Referrals: the referral code linked to your account and its association with referred accounts, used to attribute earned credits.</li>
                <li>Notifications (only if you enable them): your browser&apos;s push subscription endpoint and encryption keys; your e-mail address for the daily horoscope.</li>
                <li>Billing: handled by Stripe and/or Apple, which process payment details directly — we never store any card data.</li>
                <li>Technical: IP address, used briefly for rate limiting (abuse prevention) on certain sensitive API endpoints, never for advertising profiling.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Purposes and legal basis</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Providing the requested calculations and managing your profiles — performance of the contract between you and Astrologium.</li>
                <li>Managing your subscription, credits, and billing — performance of the contract.</li>
                <li>Securing your account (password hashing, rate limiting, session tokens) — legitimate interest in protecting the service and its users.</li>
                <li>Sending you the daily horoscope or push notifications — only on the basis of your explicit consent (opt-in, one-click unsubscribe at any time).</li>
                <li>Referral program — performance of the contract and legitimate interest in promoting the service.</li>
                <li>Generating an AI-written personalized reading for a significant astrological event, and the in-depth synthesis of your chart (natal, synastry, composite, solar return, life mission) — performance of the contract, based solely on your chart&apos;s calculated astrological data (positions, houses, aspects, degrees). No identifying data (name, e-mail, account ID) is ever sent to this subprocessor.</li>
              </ul>
              <p className="mt-2">No data is ever sold to third parties or used for advertising purposes.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Subprocessors</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Vercel Inc. — application hosting (United States).</li>
                <li>Neon Inc. — PostgreSQL database hosting, infrastructure operated from the European Union.</li>
                <li>Stripe — web payment processing.</li>
                <li>Apple — iOS in-app purchase processing.</li>
                <li>Resend — transactional e-mail delivery (password reset, daily horoscope), when configured in production.</li>
                <li>Anthropic — generates the text of personalized astrological event readings and the in-depth chart synthesis, from calculated astrological data only, with no identifying data. This synthesis is cached after it is first generated: it is not regenerated on every visit.</li>
                <li>OpenStreetMap / Nominatim — converts the birthplace you enter into geographic coordinates.</li>
              </ul>
              <p className="mt-2">
                Some of these subprocessors are based in the United States. These international transfers are
                covered by the European Commission&apos;s Standard Contractual Clauses (SCC) or an equivalent
                safeguard offered by each subprocessor.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Security</h2>
              <p className="mt-2">
                Passwords are hashed with bcrypt and are never stored or transmitted in plain text. Traffic
                between your browser and our servers is encrypted (HTTPS/TLS). The session cookie is marked{" "}
                <code>httpOnly</code> (inaccessible to JavaScript) and <code>secure</code> in production
                (sent only over HTTPS), to limit the risk of session theft.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Cookies and trackers</h2>
              <p className="mt-2">
                Astrologium uses only a strictly necessary session cookie for authentication. No advertising
                cookies or third-party analytics trackers are set on this site.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Your rights</h2>
              <p className="mt-2">
                Under the GDPR, you have the right to access, rectify, erase, and port your data. You can
                exercise most of these rights directly and immediately from your dashboard: update your
                account information, delete an astrological profile, or delete your account entirely. For any
                other request, write to us at [TO COMPLETE — contact e-mail].
              </p>
              <p className="mt-2">
                You also have the right to lodge a complaint with your national data protection authority
                (in France, the CNIL — www.cnil.fr) if you believe our processing of your data does not comply
                with the GDPR.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Retention</h2>
              <p className="mt-2">
                Account data and profiles are kept for as long as your account remains active. Deleting your
                account immediately and irreversibly deletes the associated profiles, reading history, and
                preferences. Billing data may be kept longer by our payment subprocessors for their own legal
                obligations (accounting, fraud prevention), independently of Astrologium. Technical logs used
                for security and rate limiting are kept for a limited time before automatic deletion.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Minors</h2>
              <p className="mt-2">
                Astrologium is not specifically directed at minors. Depending on your jurisdiction, creating an
                account below the applicable age of digital consent may require a parent or guardian&apos;s
                consent.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
