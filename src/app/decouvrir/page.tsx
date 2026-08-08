import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { BigThreeTeaserForm } from "@/components/discover/BigThreeTeaserForm";
import { HeroChartWheel } from "@/components/HeroChartWheel";

export const metadata: Metadata = {
  title: "Découvre ton thème en 10 secondes — Astrologium",
  description:
    "Ta date de naissance suffit : découvre ton Soleil, ta Lune et ton Ascendant en quelques secondes, sans créer de compte.",
};

export default function DecouvrirPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <HeroChartWheel className="mx-auto mb-2 max-w-[130px] opacity-50 sm:max-w-[150px]" />
          <Eyebrow>Découverte rapide</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Ton Big 3, en 10 secondes</h1>
          <p className="mt-5 text-muted">
            Soleil, Lune, Ascendant — les trois piliers de ton thème, sans créer de compte. Pour le thème
            complet (maisons, aspects, transits), l&apos;inscription reste gratuite ensuite.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <BigThreeTeaserForm locale="fr" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
