import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { METHODOLOGY_EN } from "@/lib/astro/interpretations/methodology.en";

export const metadata: Metadata = {
  title: "Our method — Astrologium",
  description: "How Astrologium calculates your charts: zodiac, ephemerides, houses, aspects, synastry, composite, astrocartography.",
};

export default function MethodEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Transparency</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">How we calculate your sky</h1>
          <p className="mt-5 text-muted">
            No black box. Here, in detail, are the methods and conventions used for each tool — so you can
            read your charts with full knowledge of what&apos;s behind them.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="space-y-6">
            {METHODOLOGY_EN.map((section) => (
              <Card key={section.title} className="p-7">
                <h2 className="font-display text-2xl text-gold-strong">{section.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                  {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
