import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_PAGE_KEYS, PLANET_SLUG_FR } from "@/lib/content/planet-pages";

export const metadata: Metadata = {
  title: "Les planètes en signe, une par une — Astrologium",
  description:
    "Vénus en Balance, Mars en Scorpion, Lune en Cancer… la signification de chaque planète dans chacun des 12 signes, expliquée clairement.",
};

export default function PlanetesIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Planètes en signe</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Que fait chaque planète dans chaque signe ?</h1>
          <p className="mt-5 text-muted">
            Un thème natal n&apos;est jamais qu&apos;un Soleil : 11 points s&apos;y positionnent, chacun dans l&apos;un
            des 12 signes. Choisissez une planète, puis un signe, pour lire ce que ce placement précis met en
            jeu — étant entendu que la maison et les aspects affinent toujours cette lecture de base.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {PLANET_PAGE_KEYS.map((point, i) => {
              const meta = PLANET_META[point];
              const slug = PLANET_SLUG_FR[point];
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
                        href={`/planetes/${slug}-en-${sign}`}
                        title={SIGN_META[sign].name}
                        className="rounded-full border border-border-soft px-2 py-1 text-muted hover:border-gold/40 hover:text-foreground"
                      >
                        {SIGN_META[sign].symbol}
                      </Link>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
