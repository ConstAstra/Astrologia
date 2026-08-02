import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { DuoTeaserForm } from "@/components/duo/DuoTeaserForm";

export const metadata: Metadata = {
  title: "Quick compatibility test — Astrologium",
  description:
    "Two names, two signs, a shareable card in 10 seconds — no account needed. For a full reading based on your real charts, real synastry is free when you sign up.",
};

export default function DuoEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Quick test</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">You & someone, what does it give?</h1>
          <p className="mt-5 text-muted">
            Two names, two signs, a shareable card — no account needed. Based on sun signs only; for real
            synastry (Moon, Venus, Mars, Ascendant), signing up stays free.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <DuoTeaserForm locale="en" />
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
