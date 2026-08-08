import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { GUIDES } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Guides d'astrologie — comprendre les bases — Astrologium",
  description:
    "Mercure rétrograde, les 12 maisons, l'Ascendant, lire un thème natal, synastrie vs composite, lire un aspect : des guides clairs pour comprendre l'astrologie occidentale.",
};

export default function GuidesIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          <Eyebrow>Guides</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Comprendre l&apos;astrologie, pas à pas</h1>
          <p className="mt-5 text-muted">
            Les concepts de base de l&apos;astrologie occidentale, expliqués clairement — même rigueur et mêmes
            limites assumées que le reste du site. Pour la méthode de calcul elle-même, voir{" "}
            <Link href="/methode" className="text-gold-strong underline">
              la page méthode
            </Link>
            .
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex flex-col gap-4">
            {GUIDES.map((guide, i) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <Card className="group flex items-start gap-5 p-6 transition-colors hover:border-gold/40">
                  <span className="font-display shrink-0 text-2xl text-gold-strong/60">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-xl group-hover:text-gold-strong">{guide.title}</p>
                    <p className="mt-2 text-sm text-muted">{guide.description}</p>
                    <p className="mt-3 text-xs text-muted/70">{guide.readingMinutes} min de lecture</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
