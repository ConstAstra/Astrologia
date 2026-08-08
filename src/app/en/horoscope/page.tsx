import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { composeSignHoroscope } from "@/lib/astro/interpretations/sign-horoscope";

const ELEMENT_COLORS: Record<string, string> = {
  Feu: "#c96b4a",
  Terre: "#9fc0a3",
  Air: "#c77b8a",
  Eau: "#8a9fc4",
};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Daily horoscope by sign — Astrologium",
  description:
    "Today's horoscope for all 12 zodiac signs, computed with whole-sign houses (sun sign technique): today's sky, moon phase, activated area of life.",
};

export default function HoroscopeIndexPageEn() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          <Eyebrow>Daily horoscope</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">What does the sky say for your sign today?</h1>
          <p className="mt-5 text-muted">
            {dateLabel} — area of life activated using the sun sign technique (whole-sign houses from the sign),
            the same sky for everyone, read through each sign. For a personal reading based on your real natal
            chart,{" "}
            <Link href="/en/signup" className="text-gold-strong underline">
              create your full chart for free
            </Link>
            .
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {ZODIAC_SIGNS.map((sign) => {
              const meta = SIGN_META_EN[sign];
              const color = ELEMENT_COLORS[meta.element];
              const horoscope = composeSignHoroscope(sign, today, "en");
              const featuredHouse = horoscope.housePlacements.find((p) => p.planet === "sun") ?? horoscope.housePlacements[0];

              return (
                <Link
                  key={sign}
                  href={`/en/horoscope/${sign}`}
                  className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border border-border-soft bg-surface p-7 text-center shadow-[inset_0_1px_0_0_#ffffff14,0_12px_32px_-20px_#00000080] backdrop-blur-sm transition-transform hover:-translate-y-1"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
                    style={{ background: color }}
                  />
                  <span className="font-display relative text-5xl" style={{ color }}>
                    {meta.symbol}
                  </span>
                  <span className="font-display relative text-xl">{meta.name}</span>
                  <span className="relative text-xs text-muted">{meta.dates}</span>
                  <span className="relative mt-2 text-xs text-muted">
                    Today&apos;s focus: <span className="text-foreground">{featuredHouse.houseName.replace(/^House [IVX]+ — /, "")}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
