import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { PLANET_PAGE_KEYS, PLANET_SLUG_EN } from "@/lib/content/planet-pages";

export const metadata: Metadata = {
  title: "Every planet in every sign — Astrologium",
  description:
    "Venus in Libra, Mars in Scorpio, Moon in Cancer… the meaning of each planet in each of the 12 signs, clearly explained.",
};

export default function PlanetsIndexEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Planets in sign</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">What does each planet do in each sign?</h1>
          <p className="mt-5 text-muted">
            A natal chart is never just a Sun sign: 11 points are placed there, each in one of the 12 signs.
            Pick a planet, then a sign, to read what that specific placement means — keeping in mind that the
            house and aspects always refine this base reading further.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {PLANET_PAGE_KEYS.map((point, i) => {
              const meta = PLANET_META_EN[point];
              const slug = PLANET_SLUG_EN[point];
              return (
                <Card
                  key={point}
                  className="stagger-item p-6"
                  style={{ "--stagger-i": i } as CSSProperties}
                >
                  <p className="font-display text-2xl text-gold-strong">
                    {meta.symbol} {meta.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">{meta.keyword}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                    {ZODIAC_SIGNS.map((sign) => (
                      <Link
                        key={sign}
                        href={`/en/planets/${slug}-in-${sign}`}
                        title={SIGN_META_EN[sign].name}
                        className="rounded-full border border-border-soft px-2 py-1 text-muted hover:border-gold/40 hover:text-foreground"
                      >
                        {SIGN_META_EN[sign].symbol}
                      </Link>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
