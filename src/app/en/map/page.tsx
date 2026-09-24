import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { MapTeaserForm } from "@/components/carte/MapTeaserForm";

export const metadata: Metadata = {
  title: "Interactive astrocartography map — Astrologium",
  description:
    "Your birth date, time and place are enough: discover in 30 seconds, no account needed, which countries actually activate your astrological lines. Tap a country to see what would happen there.",
};

export default function MapPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Interactive map</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Where on Earth do your lines activate?</h1>
          <p className="mt-5 text-muted">
            Based on your real natal chart (birth date, time and place) — no account needed. Tap a country on
            the map to see what your lines actually say about it.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <MapTeaserForm locale="en" />
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
