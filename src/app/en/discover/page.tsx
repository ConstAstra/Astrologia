import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { BigThreeTeaserForm } from "@/components/discover/BigThreeTeaserForm";
import { HeroChartWheel } from "@/components/HeroChartWheel";

export const metadata: Metadata = {
  title: "Discover your chart in 10 seconds — Astrologium",
  description:
    "Your birth date is enough: discover your Sun, Moon and Ascendant in a few seconds, no account needed.",
};

export default function DiscoverPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <HeroChartWheel className="mx-auto mb-2 max-w-[130px] opacity-50 sm:max-w-[150px]" />
          <Eyebrow>Quick discovery</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Your Big 3, in 10 seconds</h1>
          <p className="mt-5 text-muted">
            Sun, Moon, Ascendant — the three pillars of your chart, no account needed. For the full chart
            (houses, aspects, transits), signing up stays free afterwards.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <BigThreeTeaserForm locale="en" />
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
