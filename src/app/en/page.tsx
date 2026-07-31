import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Astrologia — Natal Chart, Synastry, Composite & Astrocartography",
  description:
    "Create your natal chart, synastry, composite chart and astrocartography. Precise calculations, method fully explained, in English.",
};

const TOOLS = [
  {
    title: "Natal chart",
    description:
      "Precise positions of the planets, houses and aspects at the exact moment of your birth, with a detailed reading sign by sign, house by house.",
  },
  {
    title: "Synastry",
    description:
      "Overlay two charts to understand the dynamics of a couple or a relationship: cross-aspects, overlapping houses, strengths and friction points.",
  },
  {
    title: "Composite chart",
    description:
      "The chart \"of the couple\" itself, calculated with the midpoint method — a third entity, beyond the two individuals.",
  },
  {
    title: "Astrocartography",
    description:
      "Your planetary lines projected on a world map: where does your Sun shine, where does your Venus soften life, where does Saturn bring structure?",
  },
];

export default function HomeEn() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
          <Eyebrow>Western astrology, calculated with rigor</Eyebrow>
          <h1 className="font-display mx-auto mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">
            Your birth sky, read with precision — and explained from start to finish.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted">
            Natal chart, synastry, composite chart and astrocartography. Every calculation, every house
            system, every orb is documented: you always know what you&apos;re reading and why.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/en/signup" size="lg">
              Create my natal chart
            </ButtonLink>
            <ButtonLink href="/en/method" variant="secondary" size="lg">
              Understand the method
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-muted/70">Full natal chart free. No credit card required.</p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-5 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Card key={tool.title} className="p-7">
                <h2 className="font-display text-2xl">{tool.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{tool.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Eyebrow>Our commitment</Eyebrow>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">Rigor over showmanship</h2>
          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            <div>
              <p className="font-display text-xl text-gold-strong">Precise ephemerides</p>
              <p className="mt-2 text-sm text-muted">
                Apparent geocentric planetary positions, accurate to within an arcsecond.
              </p>
            </div>
            <div>
              <p className="font-display text-xl text-gold-strong">Transparent houses</p>
              <p className="mt-2 text-sm text-muted">
                Placidus, whole sign, equal houses or Porphyry — you choose, we explain the difference.
              </p>
            </div>
            <div>
              <p className="font-display text-xl text-gold-strong">Honest limits</p>
              <p className="mt-2 text-sm text-muted">
                Unknown birth time? We tell you, instead of inventing an Ascendant. See our method page.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <Card className="p-10">
            <h2 className="font-display text-3xl">Ready to see your sky?</h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              The full natal chart is free. Synastry, composite and astrocartography unlock one at a time,
              or unlimited with Premium.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/en/signup" size="lg">
                Start for free
              </ButtonLink>
              <ButtonLink href="/en/pricing" variant="secondary" size="lg">
                See pricing
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
