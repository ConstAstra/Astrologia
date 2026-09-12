import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { NatalChartTeaserForm } from "@/components/theme-astral/NatalChartTeaserForm";

export const metadata: Metadata = {
  title: "Calculate my free natal chart — Astrologium",
  description:
    "Your birth date, time and place are enough: see your full natal chart in 30 seconds, no account needed. Positions, houses, Sun, Moon, Ascendant.",
};

export default function NatalChartTeaserPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Free natal chart</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">What does your birth sky actually say?</h1>
          <p className="mt-5 text-muted">
            No account needed. Enter your birth date, time and place to see your full chart — you only create an
            account if you want to keep it.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <NatalChartTeaserForm locale="en" />
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
