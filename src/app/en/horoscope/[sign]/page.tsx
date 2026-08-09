import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { ZodiacSign } from "@/lib/astro/types";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { composeSignHoroscope } from "@/lib/astro/interpretations/sign-horoscope";
import { SharePunchlineButton } from "@/components/horoscope/SharePunchlineButton";
import { ZodiacGlyphBg } from "@/components/ui/ZodiacGlyphBg";

const ELEMENT_COLORS: Record<string, string> = {
  Feu: "#c96b4a",
  Terre: "#9fc0a3",
  Air: "#c77b8a",
  Eau: "#8a9fc4",
};

export const revalidate = 3600;

function isZodiacSign(value: string): value is ZodiacSign {
  return (ZODIAC_SIGNS as readonly string[]).includes(value);
}

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({ sign }));
}

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign } = await params;
  if (!isZodiacSign(sign)) return {};
  const meta = SIGN_META_EN[sign];
  return {
    title: `${meta.name} horoscope today — Astrologium`,
    description: `Today's horoscope for ${meta.name}: moon phase, activated area of life (whole-sign houses), current sky climate.`,
    alternates: { canonical: `/en/horoscope/${sign}` },
  };
}

export default async function SignHoroscopePageEn({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params;
  if (!isZodiacSign(sign)) notFound();

  const meta = SIGN_META_EN[sign];
  const color = ELEMENT_COLORS[meta.element];
  const today = new Date();
  const horoscope = composeSignHoroscope(sign, today, "en");
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  const index = ZODIAC_SIGNS.indexOf(sign);
  const prevSign = ZODIAC_SIGNS[(index - 1 + ZODIAC_SIGNS.length) % ZODIAC_SIGNS.length];
  const nextSign = ZODIAC_SIGNS[(index + 1) % ZODIAC_SIGNS.length];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://astrologium.app";
  const pageUrl = `${siteUrl}/en/horoscope/${sign}`;

  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <div className="relative overflow-hidden pb-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: color }}
          />
          <ZodiacGlyphBg
            sign={sign}
            className="absolute left-1/2 top-0 w-[80vw] max-w-[760px] -translate-x-1/2"
          />
          <section className="relative px-6 pt-16 text-center">
            <div className="relative mx-auto max-w-2xl">
              <Link href="/en/horoscope" className="text-xs text-muted hover:text-foreground">
                ← All signs
              </Link>
              <div
                className="font-display mx-auto mt-6 flex h-28 w-28 items-center justify-center rounded-full border text-6xl"
                style={{ borderColor: `${color}55`, color, boxShadow: `0 0 60px -10px ${color}88` }}
              >
                {meta.symbol}
              </div>
              <div className="mt-4">
                <Eyebrow>{dateLabel}</Eyebrow>
              </div>
              <h1 className="font-display mt-3 text-4xl sm:text-5xl">{meta.name}</h1>
              <p className="mt-2 text-sm text-muted">{meta.dates}</p>
            </div>
          </section>

          <section className="relative mx-auto max-w-2xl px-6 pt-10">
            <Card className="border-gold/30 bg-gold/5 p-7 text-center">
              <p className="font-display text-2xl leading-snug sm:text-3xl">{horoscope.punchline}</p>
              <div className="mt-5 flex justify-center">
                <SharePunchlineButton text={horoscope.punchline} url={pageUrl} locale="en" />
              </div>
            </Card>
          </section>
        </div>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <p className="text-center text-sm text-muted">{horoscope.headline}</p>

          <Card className="mt-6 p-6">
            <p className="text-sm text-muted">☾ Moon phase</p>
            <p className="mt-2 text-sm leading-relaxed">{horoscope.moonPhaseLine}</p>
          </Card>

          {horoscope.skyAspectText && (
            <Card className="mt-5 p-6">
              <p className="text-sm text-muted">Sky climate</p>
              <p className="mt-2 text-sm leading-relaxed">{horoscope.skyAspectText}</p>
            </Card>
          )}

          <div className="mt-8">
            <p className="font-display text-xl">Today&apos;s activated areas</p>
            <p className="mt-1 text-sm text-muted">Where the transiting planets fall, read in whole-sign houses from {meta.name}.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {horoscope.housePlacements.map((p) => (
                <Card key={p.planet} className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-gold-strong">{PLANET_META_EN[p.planet].symbol}</span>
                    <div>
                      <p className="text-sm font-medium">{PLANET_META_EN[p.planet].name}</p>
                      <p className="text-xs text-muted">{p.houseName}</p>
                    </div>
                    <span className="ml-auto">
                      <Badge>House {p.house}</Badge>
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted">{p.houseKeyword}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mt-8 border-gold/30 bg-gold/5 p-6 text-center">
            <p className="text-sm text-muted">{horoscope.precisionNote}</p>
            <ButtonLink href="/en/signup" className="mt-4 inline-block">
              Create my personal chart, free →
            </ButtonLink>
          </Card>

          <div className="mt-10 flex items-center justify-between text-sm">
            <Link href={`/en/horoscope/${prevSign}`} className="text-muted hover:text-foreground">
              ← {SIGN_META_EN[prevSign].symbol} {SIGN_META_EN[prevSign].name}
            </Link>
            <Link href={`/en/horoscope/${nextSign}`} className="text-muted hover:text-foreground">
              {SIGN_META_EN[nextSign].symbol} {SIGN_META_EN[nextSign].name} →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
