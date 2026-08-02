import type { Metadata } from "next";
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
              Template to be filled in before going live: replace every [TO COMPLETE] with your real
              information (ideally reviewed by a legal professional before commercialization).
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Publisher</h2>
              <p className="mt-2">
                Legal name: [TO COMPLETE]<br />
                Legal form: [TO COMPLETE — sole trader, SASU, etc.]<br />
                Registered address: [TO COMPLETE]<br />
                Registration number (SIRET): [TO COMPLETE]<br />
                Publication director: [TO COMPLETE]<br />
                Contact: [TO COMPLETE — contact e-mail]
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Hosting</h2>
              <p className="mt-2">
                Host: [TO COMPLETE — e.g. Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA]<br />
                Database: [TO COMPLETE — name of your production PostgreSQL provider]
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
          </Card>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
