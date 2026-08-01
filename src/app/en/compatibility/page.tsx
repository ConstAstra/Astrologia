import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";

export const metadata: Metadata = {
  title: "Zodiac Sign Compatibility — Astrologium",
  description:
    "Compatibility between the 12 zodiac signs: elements, modalities, strengths and watch-outs for every duo, clearly explained.",
};

export default function CompatibilityIndexEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Astrological compatibility</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">What&apos;s the compatibility between two signs?</h1>
          <p className="mt-5 text-muted">
            Pick a sign to see its compatibility with all 12 zodiac signs — based on elements and modalities.
            For a complete, personal reading (Moon, Venus, Mars, Ascendant), real synastry is free when you
            sign up.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ZODIAC_SIGNS.map((sign) => (
              <Card key={sign} className="p-6">
                <p className="font-display text-2xl">
                  {SIGN_META_EN[sign].symbol} {SIGN_META_EN[sign].name}
                </p>
                <p className="mt-1 text-xs text-muted">{SIGN_META_EN[sign].dates}</p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                  {ZODIAC_SIGNS.map((other) => (
                    <Link
                      key={other}
                      href={`/en/compatibility/${sign}-${other}`}
                      className="rounded-full border border-border-soft px-2 py-1 text-muted hover:text-foreground"
                    >
                      {SIGN_META_EN[other].symbol}
                    </Link>
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
