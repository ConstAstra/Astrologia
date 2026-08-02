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
import { composeSignCompatibility } from "@/lib/astro/interpretations/sign-compatibility";

const ZODIAC_INDEX = new Map(ZODIAC_SIGNS.map((s, i) => [s, i]));

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
  const a = SIGN_META[signA];
  const b = SIGN_META[signB];

  return {
    title: `Compatibilité ${a.name} et ${b.name} — Astrologium`,
    description: `Compatibilité entre ${a.name} et ${b.name} : affinité d'éléments et de modalités, forces et points de vigilance du duo, expliqués clairement.`,
    alternates: { canonical: `/compatibilite/${canonicalSlug(signA, signB)}` },
  };
}

export default async function CompatibilitePage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const [signA, signB] = parsed;
  const a = SIGN_META[signA];
  const b = SIGN_META[signB];
  const compat = composeSignCompatibility(signA, signB);

  const others = ZODIAC_SIGNS.filter((s) => s !== signA);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Compatibilité astrologique</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">
            {a.symbol} {a.name} & {b.symbol} {b.name}
          </h1>
          <p className="mt-5 text-muted">
            Une lecture basée sur les signes solaires : leurs éléments — {a.element} et {b.element}, la façon
            d&apos;exprimer l&apos;énergie — et leurs modalités — {a.modality} et {b.modality}, la façon de s&apos;y
            engager dans le temps.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <Card className="p-7 text-center">
            <p className="text-sm text-muted">Affinité indicative</p>
            <p className="font-display mt-2 text-3xl text-gold-strong">{"★".repeat(compat.score)}{"☆".repeat(5 - compat.score)}</p>
          </Card>

          <div className="mt-6 space-y-6">
            <Card className="p-7">
              <Badge tone="gold">Éléments</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.elementText}</p>
            </Card>
            <Card className="p-7">
              <Badge tone="gold">Modalités</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.modalityText}</p>
            </Card>
            <Card className="p-7">
              <Badge tone="sage">Forces du duo</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.strengths}</p>
            </Card>
            <Card className="p-7">
              <Badge tone="terracotta">Points de vigilance</Badge>
              <p className="mt-4 text-sm leading-relaxed text-muted">{compat.challenges}</p>
            </Card>
          </div>

          <Card className="mt-6 border-gold/40 bg-gold/5 p-7 text-center">
            <p className="text-sm leading-relaxed text-muted">{compat.advice}</p>
            <div className="mt-5">
              <ButtonLink href="/inscription">Faire ma vraie synastrie gratuitement</ButtonLink>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-16">
          <h2 className="font-display text-2xl">
            Compatibilité de {a.name} avec les autres signes
          </h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {others.map((s) => (
              <Link
                key={s}
                href={`/compatibilite/${canonicalSlug(signA, s)}`}
                className="rounded-full border border-border-soft px-3 py-1 text-muted hover:text-foreground"
              >
                {SIGN_META[s].symbol} {SIGN_META[s].name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
