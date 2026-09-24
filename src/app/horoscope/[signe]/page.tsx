import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { ZodiacSign } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
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
  return ZODIAC_SIGNS.map((signe) => ({ signe }));
}

export async function generateMetadata({ params }: { params: Promise<{ signe: string }> }): Promise<Metadata> {
  const { signe } = await params;
  if (!isZodiacSign(signe)) return {};
  const meta = SIGN_META[signe];
  return {
    title: `Horoscope ${meta.name} du jour — Astrologium`,
    description: `L'horoscope du jour pour le signe ${meta.name} : phase lunaire, foyer d'énergie activé (maisons entières), climat du ciel actuel.`,
    alternates: { canonical: `/horoscope/${signe}` },
  };
}

export default async function SignHoroscopePage({ params }: { params: Promise<{ signe: string }> }) {
  const { signe } = await params;
  if (!isZodiacSign(signe)) notFound();

  const meta = SIGN_META[signe];
  const color = ELEMENT_COLORS[meta.element];
  const today = new Date();
  const horoscope = composeSignHoroscope(signe, today, "fr");
  const dateLabel = today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const index = ZODIAC_SIGNS.indexOf(signe);
  const prevSign = ZODIAC_SIGNS[(index - 1 + ZODIAC_SIGNS.length) % ZODIAC_SIGNS.length];
  const nextSign = ZODIAC_SIGNS[(index + 1) % ZODIAC_SIGNS.length];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://astrologium.app";
  const pageUrl = `${siteUrl}/horoscope/${signe}`;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="relative overflow-hidden pb-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: color }}
          />
          <ZodiacGlyphBg
            sign={signe}
            className="absolute left-1/2 top-0 w-[68vw] max-w-[660px] -translate-x-1/2"
          />
          <section className="relative px-6 pt-16 text-center">
            <div className="relative mx-auto max-w-2xl">
              <Link href="/horoscope" className="text-xs text-muted hover:text-foreground">
                ← Tous les signes
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
                <SharePunchlineButton text={horoscope.punchline} url={pageUrl} locale="fr" />
              </div>
            </Card>
          </section>
        </div>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <p className="text-center text-sm text-muted">{horoscope.headline}</p>

          <Card className="mt-6 p-6">
            <p className="text-sm text-muted">☾ Phase lunaire</p>
            <p className="mt-2 text-sm leading-relaxed">{horoscope.moonPhaseLine}</p>
          </Card>

          {horoscope.skyAspectText && (
            <Card className="mt-5 p-6">
              <p className="text-sm text-muted">Climat du ciel</p>
              <p className="mt-2 text-sm leading-relaxed">{horoscope.skyAspectText}</p>
            </Card>
          )}

          <div className="mt-8">
            <p className="font-display text-xl">Foyers activés aujourd&apos;hui</p>
            <p className="mt-1 text-sm text-muted">
              Où tombent les planètes en transit, lues en maisons entières depuis {meta.name}.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {horoscope.housePlacements.map((p) => (
                <Card key={p.planet} className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-gold-strong">{PLANET_META[p.planet].symbol}</span>
                    <div>
                      <p className="text-sm font-medium">{PLANET_META[p.planet].name}</p>
                      <p className="text-xs text-muted">{p.houseName}</p>
                    </div>
                    <span className="ml-auto">
                      <Badge>Maison {p.house}</Badge>
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted">{p.houseKeyword}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mt-8 border-gold/30 bg-gold/5 p-6 text-center">
            <p className="text-sm text-muted">{horoscope.precisionNote}</p>
            <ButtonLink href="/inscription" className="mt-4 inline-block">
              Créer mon thème personnel, gratuit →
            </ButtonLink>
          </Card>

          <div className="mt-10 flex items-center justify-between text-sm">
            <Link href={`/horoscope/${prevSign}`} className="text-muted hover:text-foreground">
              ← {SIGN_META[prevSign].symbol} {SIGN_META[prevSign].name}
            </Link>
            <Link href={`/horoscope/${nextSign}`} className="text-muted hover:text-foreground">
              {SIGN_META[nextSign].symbol} {SIGN_META[nextSign].name} →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
