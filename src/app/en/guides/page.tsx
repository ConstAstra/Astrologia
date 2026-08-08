import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { GUIDES_EN } from "@/lib/content/guides.en";

export const metadata: Metadata = {
  title: "Astrology guides — understanding the basics — Astrologium",
  description:
    "Mercury retrograde, the 12 houses, the Ascendant, reading a natal chart, synastry vs composite, reading an aspect: clear guides to understand Western astrology.",
};

export default function GuidesIndexPageEn() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          <Eyebrow>Guides</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Understanding astrology, step by step</h1>
          <p className="mt-5 text-muted">
            The core concepts of Western astrology, clearly explained — the same rigor and the same honest
            limits as the rest of the site. For the calculation method itself, see{" "}
            <Link href="/en/method" className="text-gold-strong underline">
              the method page
            </Link>
            .
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-col gap-4">
            {GUIDES_EN.map((guide, i) => (
              <Link key={guide.slug} href={`/en/guides/${guide.slug}`}>
                <Card interactive className="group flex items-start gap-5 p-6 transition-colors hover:border-gold/40">
                  <span className="font-display shrink-0 text-2xl text-gold-strong/60">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-xl group-hover:text-gold-strong">{guide.title}</p>
                    <p className="mt-2 text-sm text-muted">{guide.description}</p>
                    <p className="mt-3 text-xs text-muted/70">{guide.readingMinutes} min read</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
