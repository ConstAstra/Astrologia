import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { PointKey, ZodiacSign } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { describePlanetInSign } from "@/lib/astro/interpretations/compose";
import { PLANET_PAGE_KEYS, PLANET_SLUG_FR, planetSlugToKey } from "@/lib/content/planet-pages";

const ELEMENT_COLORS: Record<string, string> = {
  Feu: "#c96b4a",
  Terre: "#9fc0a3",
  Air: "#c77b8a",
  Eau: "#8a9fc4",
};

function isZodiacSign(value: string): value is ZodiacSign {
  return (ZODIAC_SIGNS as readonly string[]).includes(value);
}

function parseSlug(slug: string): [PointKey, ZodiacSign] | null {
  const parts = slug.split("-");
  if (parts.length !== 3 || parts[1] !== "en") return null;
  const [planetPart, , signPart] = parts;
  const point = planetSlugToKey(planetPart, PLANET_SLUG_FR);
  if (!point || !PLANET_PAGE_KEYS.includes(point)) return null;
  if (!isZodiacSign(signPart)) return null;
  return [point, signPart];
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const point of PLANET_PAGE_KEYS) {
    for (const sign of ZODIAC_SIGNS) {
      params.push({ slug: `${PLANET_SLUG_FR[point]}-en-${sign}` });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};
  const [point, sign] = parsed;
  const planet = PLANET_META[point];
  const signMeta = SIGN_META[sign];

  return {
    title: `${planet.name} en ${signMeta.name} — signification — Astrologium`,
    description: `${planet.name} en ${signMeta.name} : ce que ce placement précis change dans un thème natal, expliqué clairement — et ce qu'il ne dit pas encore.`,
    alternates: { canonical: `/planetes/${slug}` },
  };
}

export default async function PlaneteEnSignePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();
  const [point, sign] = parsed;

  const planet = PLANET_META[point];
  const signMeta = SIGN_META[sign];
  const color = ELEMENT_COLORS[signMeta.element];
  const reading = describePlanetInSign(point, sign);

  const otherSigns = ZODIAC_SIGNS.filter((s) => s !== sign);
  const otherPlanets = PLANET_PAGE_KEYS.filter((p) => p !== point);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-10 pt-16 text-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: color }}
          />
          <div className="relative mx-auto max-w-2xl">
            <Link href="/planetes" className="text-xs text-muted hover:text-foreground">
              ← Toutes les planètes en signe
            </Link>
            <div
              className="font-display mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border text-5xl"
              style={{ borderColor: `${color}55`, color, boxShadow: `0 0 60px -10px ${color}88` }}
            >
              {planet.symbol}
            </div>
            <div className="mt-4">
              <Eyebrow>Planète en signe</Eyebrow>
            </div>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl">
              {planet.name} en {signMeta.symbol} {signMeta.name}
            </h1>
            <p className="mt-3 text-sm text-muted">{planet.keyword}</p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-8">
          <Card className="p-7">
            <p className="text-sm text-muted">{planet.name}, en général</p>
            <p className="mt-2 text-sm leading-relaxed">{planet.essence}</p>
          </Card>

          <Card className="mt-6 border-gold/30 bg-gold/5 p-7">
            <p className="text-sm text-gold-strong">
              {planet.name} en {signMeta.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed">{reading}</p>
          </Card>

          <Card className="mt-6 p-6 text-center">
            <p className="text-sm text-muted">
              {`Ce texte décrit le signe seul. Dans votre thème réel, ${planet.name.toLowerCase()} tombe aussi dans une maison précise et forme des aspects avec les autres planètes — c'est là que se joue la vraie nuance personnelle.`}
            </p>
            <div className="mt-4">
              <ButtonLink href="/inscription">Calculer mon thème complet, gratuit →</ButtonLink>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-2xl px-6 pb-16">
          <h2 className="font-display text-xl">
            {planet.name} dans un autre signe
          </h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {otherSigns.map((s) => (
              <Link
                key={s}
                href={`/planetes/${PLANET_SLUG_FR[point]}-en-${s}`}
                className="rounded-full border border-border-soft px-3 py-1 text-muted hover:text-foreground"
              >
                {SIGN_META[s].symbol} {SIGN_META[s].name}
              </Link>
            ))}
          </div>

          <h2 className="font-display mt-10 text-xl">
            Un autre point en {signMeta.name}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {otherPlanets.map((p) => (
              <Link
                key={p}
                href={`/planetes/${PLANET_SLUG_FR[p]}-en-${sign}`}
                className="rounded-full border border-border-soft px-3 py-1 text-muted hover:text-foreground"
              >
                {PLANET_META[p].symbol} {PLANET_META[p].name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
