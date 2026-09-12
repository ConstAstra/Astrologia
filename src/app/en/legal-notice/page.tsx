import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Legal notice — Astrologium" };

export default function LegalNoticeEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Legal notice</h1>
          <Card className="mt-8 space-y-6 p-8 text-sm leading-relaxed text-muted">
            <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-4 text-terracotta">
              Business registration (French SIRET number) is in progress. Fields marked [TO COMPLETE] will be
              filled in once it is issued; no identity information is invented in the meantime. The rest of
              this page reflects the service&apos;s real configuration.
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Publisher</h2>
              <p className="mt-2">
                Trade name: Constastra<br />
                Legal form: Sole proprietorship (French micro-entreprise), registration in progress with the
                French business registry (Guichet unique / INPI)<br />
                Operator&apos;s full name: [TO COMPLETE]<br />
                Registered address: [TO COMPLETE]<br />
                Registration number (SIRET): [TO COMPLETE — pending issuance]<br />
                Publication director: the operator named above<br />
                Contact: [TO COMPLETE — contact e-mail]
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Hosting</h2>
              <p className="mt-2">
                Application host: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
                Database host: Neon Inc. (Neon Postgres service), infrastructure operated from the European
                Union
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Nature of the service</h2>
              <p className="mt-2">
                Astrologium provides astrological calculations and interpretations for <strong>entertainment
                and personal reflection purposes</strong> only, with no scientific claim whatsoever. Astrology
                is not a science: its interpretations rest on no established scientific validation, and the
                publisher never claims that the readings provided are accurate, verified, or predictive.
              </p>
              <p className="mt-3">
                This content does not constitute medical, psychological, legal, or financial advice in any
                way, and does not replace the support of a healthcare professional (doctor, psychologist,
                psychiatrist, therapist) or any other qualified professional. If you are experiencing personal,
                emotional, or psychological difficulties, please consult a qualified professional rather than
                relying on the content of this site.
              </p>
              <p className="mt-3">
                The publisher cannot be held liable for decisions made on the basis of the readings provided.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Intellectual property</h2>
              <p className="mt-2">
                All text, layout methods, and graphic elements on this site are the property of the
                publisher, unless otherwise stated, and may not be reproduced without prior authorization.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Liability</h2>
              <p className="mt-2">
                The publisher makes every effort to ensure the technical accuracy of astronomical calculations
                (ephemerides, house systems) but cannot guarantee absolute accuracy, particularly when the
                birth time provided by the user is imprecise or unknown. The publisher cannot be held liable
                for a temporary unavailability of the service, nor for indirect damages resulting from its
                use.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Governing law and jurisdiction</h2>
              <p className="mt-2">
                This site and this notice are governed by French law. Absent an amicable resolution of a
                dispute, the competent French courts will have jurisdiction, subject to mandatory consumer
                protection rules applicable to users residing in the European Union.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Consumer mediation</h2>
              <p className="mt-2">
                Under French law (Code de la consommation, art. L.616-1), consumers have the right to use a
                free consumer mediation service to resolve disputes amicably. The applicable mediator will be
                named here once business registration is complete. You may also use the EU Online Dispute
                Resolution platform:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-strong hover:underline"
                >
                  ec.europa.eu/consumers/odr
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Cookies</h2>
              <p className="mt-2">
                This site uses only a strictly necessary session cookie for authentication. No advertising or
                third-party analytics cookies are set. See our{" "}
                <Link href="/en/privacy" className="text-gold-strong hover:underline">
                  privacy policy
                </Link>{" "}
                for details.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
