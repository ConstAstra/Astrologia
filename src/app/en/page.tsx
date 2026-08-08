import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { HeroChartWheel } from "@/components/HeroChartWheel";
import { SunIcon, OverlapIcon, MergeIcon, MapPinIcon, OrbitIcon, WheelIcon, EyeIcon } from "@/components/icons/FeatureIcons";

export const metadata: Metadata = {
  title: "Astrologium — Natal Chart, Synastry, Composite & Astrocartography",
  description:
    "Create your natal chart, synastry, composite chart and astrocartography. Precise calculations, method fully explained, in English.",
};

const TOOLS = [
  {
    title: "Natal chart",
    description:
      "Precise positions of the planets, houses and aspects at the exact moment of your birth, with a detailed reading sign by sign, house by house.",
    teaserHref: "/en/signup",
    teaserLabel: "Create my full chart, free →",
    icon: SunIcon,
  },
  {
    title: "Synastry",
    description:
      "Overlay two charts to understand the dynamics of a couple or a relationship: cross-aspects, overlapping houses, strengths and friction points.",
    icon: OverlapIcon,
  },
  {
    title: "Composite chart",
    description:
      "The chart \"of the couple\" itself, calculated with the midpoint method — a third entity, beyond the two individuals.",
    icon: MergeIcon,
  },
  {
    title: "Astrocartography",
    description:
      "Your planetary lines projected on a world map: where does your Sun shine, where does your Venus soften life, where does Saturn bring structure?",
    teaserHref: "/en/map",
    teaserLabel: "Try the interactive map, no account →",
    icon: MapPinIcon,
  },
];

const ENGAGEMENTS = [
  {
    title: "Precise ephemerides",
    description: "Apparent geocentric planetary positions, accurate to within an arcsecond.",
    icon: OrbitIcon,
  },
  {
    title: "Transparent houses",
    description: "Placidus, whole sign, equal houses or Porphyry — you choose, we explain the difference.",
    icon: WheelIcon,
  },
  {
    title: "Honest limits",
    description: "Unknown birth time? We tell you, instead of inventing an Ascendant. See our method page.",
    icon: EyeIcon,
  },
];

export default function HomeEn() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <div className="text-center lg:text-left">
            <Eyebrow>Western astrology</Eyebrow>
            <h1 className="font-display mx-auto mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.1] sm:text-5xl lg:mx-0">
              Discover <em className="text-gold-strong not-italic">yourself and others</em> through astrology.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-balance text-xl text-foreground/90 lg:mx-0">
              Your chart, your relationships, your partnership, your places to live: each with its own reading.
            </p>
            <p className="mx-auto mt-4 max-w-lg text-balance text-base text-muted lg:mx-0">
              Every calculation, every house system, every orb is documented: you always know what you&apos;re
              reading and why.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <ButtonLink href="/en/signup" size="lg">
                Create my natal chart
              </ButtonLink>
              <ButtonLink href="/en/method" variant="secondary" size="lg">
                Understand the method
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-muted/70">Full natal chart, free and unlimited — no card required.</p>
          </div>
          <div className="hidden lg:block">
            <HeroChartWheel className="mx-auto max-w-md" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-5 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Card key={tool.title} className="p-7">
                <tool.icon className="h-7 w-7 text-gold-strong" />
                <h2 className="font-display mt-4 text-2xl">{tool.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{tool.description}</p>
                {tool.teaserHref && (
                  <Link href={tool.teaserHref} className="mt-3 inline-block text-sm text-gold-strong underline">
                    {tool.teaserLabel}
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Eyebrow>Our commitment</Eyebrow>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">Rigor over showmanship</h2>
          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            {ENGAGEMENTS.map((item) => (
              <div key={item.title}>
                <item.icon className="h-6 w-6 text-gold-strong" />
                <p className="font-display mt-3 text-xl text-gold-strong">{item.title}</p>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
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
