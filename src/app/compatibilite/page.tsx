import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";

export const metadata: Metadata = {
  title: "Compatibilité astrologique des signes — Astrologium",
  description:
    "Compatibilité entre les 12 signes du zodiaque : éléments, modalités, forces et points de vigilance de chaque duo, expliqués clairement.",
};

export default function CompatibiliteIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Compatibilité astrologique</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Quelle compatibilité entre deux signes ?</h1>
          <p className="mt-5 text-muted">
            Choisissez un signe pour voir sa compatibilité avec les 12 signes du zodiaque — basée sur les
            éléments et modalités. Pour une lecture complète et personnelle (Lune, Vénus, Mars, Ascendant),
            la vraie synastrie reste gratuite à l&apos;inscription.
          </p>
          <Link href="/duo" className="mt-4 inline-block text-sm text-gold-strong underline">
            Tester avec deux prénoms précis, sans compte →
          </Link>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ZODIAC_SIGNS.map((sign) => (
              <Card key={sign} className="p-6">
                <p className="font-display text-2xl">
                  {SIGN_META[sign].symbol} {SIGN_META[sign].name}
                </p>
                <p className="mt-1 text-xs text-muted">{SIGN_META[sign].dates}</p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                  {ZODIAC_SIGNS.map((other) => (
                    <Link
                      key={other}
                      href={`/compatibilite/${sign}-${other}`}
                      className="rounded-full border border-border-soft px-2 py-1 text-muted hover:text-foreground"
                    >
                      {SIGN_META[other].symbol}
                    </Link>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
