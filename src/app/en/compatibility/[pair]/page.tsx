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
import { composeSignCompatibilityEn } from "@/lib/astro/interpretations/sign-compatibility.en";
import { ZodiacGlyphBg } from "@/components/ui/ZodiacGlyphBg";

const ZODIAC_INDEX = new Map(ZODIAC_SIGNS.map((s, i) => [s, i]));

const ELEMENT_LABEL_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };
const MODALITY_LABEL_EN: Record<string, string> = { Cardinal: "Cardinal", Fixe: "Fixed", Mutable: "Mutable" };

function isZodiacSign(value: string): value is ZodiacSign {
  return (ZODIAC_SIGNS as readonly string[]).includes(value);
}

function parsePair(pair: string): [ZodiacSign, ZodiacSign] | null {
  const parts = pair.split("-");
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!isZodiacSign(a) || !isZodiacSign(b)) return null;
  return [a, b];
}

function canonicalSlug(a: ZodiacSign, b: ZodiacSign): string {
  return ZODIAC_INDEX.get(a)! <= ZODIAC_INDEX.get(b)! ? `${a}-${b}` : `${b}-${a}`;
}

export async function generateStaticParams() {
  const params: { pair: string }[] = [];
  for (const a of ZODIAC_SIGNS) {
    for (const b of ZODIAC_SIGNS) {
      params.push({ pair: `${a}-${b}` });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const [signA, signB] = parsed;
  const a = SIGN_META_EN[signA];
  const b = SIGN_META_EN[signB];

  return {
    title: `${a.name} and ${b.name} Compatibility — Astrologium`,
    description: `Compatibility between ${a.name} and ${b.name}: element and modality affinity, strengths and watch-outs for the duo, clearly explained.`,
    alternates: { canonical: `/en/compatibility/${canonicalSlug(signA, signB)}` },
  };
}

export default async function CompatibilityEnPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const [signA, signB] = parsed;
  const a = SIGN_META_EN[signA];
  const b = SIGN_META_EN[signB];
  const compat = composeSignCompatibilityEn(signA, signB);

  const others = ZODIAC_SIGNS.filter((s) => s !== signA);

  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">
        <div className="relative overflow-hidden pb-8">
          <ZodiacGlyphBg
            sign={signA}
            className="absolute left-0 top-0 hidden w-[45vw] max-w-[440px] sm:block"
          />
          <ZodiacGlyphBg
            sign={signB}
            className="absolute right-0 top-0 hidden w-[45vw] max-w-[440px] scale-x-[-1] sm:block"
          />
          <section className="relative px-6 pt-16 text-center">
            <div className="relative mx-auto max-w-3xl">
              <Eyebrow>Astrological compatibility</Eyebrow>
              <h1 className="font-display mt-4 text-4xl sm:text-5xl">
                {a.symbol} {a.name} & {b.symbol} {b.name}
              </h1>
              <p className="mt-5 text-muted">
                A reading based on sun signs: their elements — {ELEMENT_LABEL_EN[a.element]} and{" "}
                {ELEMENT_LABEL_EN[b.element]}, the way energy gets expressed — and their modalities —{" "}
                {MODALITY_LABEL_EN[a.modality]} and {MODALITY_LABEL_EN[b.modality]}, the way it engages over time.
              </p>
            </div>
          </section>

          <section className="relative mx-auto max-w-3xl px-6 pt-8">
            <Card className="p-7 text-center">
              <p className="text-sm text-muted">Indicative affinity</p>
              <p className="font-display mt-2 text-3xl text-gold-strong">{"★".repeat(compat.score)}{"☆".repeat(5 - compat.score)}</p>
            </Card>
          </section>
        </div>

        <section className="mx-auto max-w-3xl px-6 pb-8">
          <div className="space-y-6">
            <Card className="p-7">
              <Badge tone="gold">Elements</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.elementText}</p>
            </Card>
            <Card className="p-7">
              <Badge tone="gold">Modalities</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.modalityText}</p>
            </Card>
            <Card className="p-7">
              <Badge tone="sage">Strengths of the duo</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.strengths}</p>
            </Card>
            <Card className="p-7">
              <Badge tone="terracotta">Watch-outs</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.challenges}</p>
            </Card>
          </div>

          <Card className="mt-6 border-gold/40 bg-gold/5 p-7 text-center">
            <p className="text-sm leading-relaxed text-muted">{compat.advice}</p>
            <div className="mt-5">
              <ButtonLink href="/en/signup">Get my real synastry for free</ButtonLink>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-16">
          <h2 className="font-display text-2xl">{a.name} compatibility with other signs</h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {others.map((s) => (
              <Link
                key={s}
                href={`/en/compatibility/${canonicalSlug(signA, s)}`}
                className="rounded-full border border-border-soft px-3 py-1 text-muted hover:text-foreground"
              >
                {SIGN_META_EN[s].symbol} {SIGN_META_EN[s].name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
