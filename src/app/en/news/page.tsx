import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "News — Astrologium",
  description: "What's new at Astrologium: what's changing, what's being added.",
};

const ENTRIES = [
  {
    date: "August 2026",
    title: "Astrologium launches",
    body: [
      "Astrologium is live. The full natal chart — planets, houses, aspects, Ascendant — is free and unlimited, no card required.",
      "Every other tool is available right after signup: synastry and composite chart to explore a relationship between two people, life mission (a reading of the lunar Nodes axis), astrocartography (your planetary lines on the world map), and a daily horoscope that's actually calculated — not generic — for every sign.",
      "Referrals let you invite people close to you and build their chart to read a synastry or composite together.",
    ],
  },
];

export default function NewsEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Log</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">News</h1>
          <p className="mt-5 text-muted">What&apos;s changing and what&apos;s being added to Astrologium, over time.</p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="space-y-6">
            {ENTRIES.map((entry) => (
              <Card key={entry.title} className="p-7">
                <p className="text-xs uppercase tracking-wide text-gold-strong">{entry.date}</p>
                <h2 className="font-display mt-2 text-2xl">{entry.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                  {entry.body.map((paragraph, i) => (
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
