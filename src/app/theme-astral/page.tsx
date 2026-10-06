import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { NatalChartTeaserForm } from "@/components/theme-astral/NatalChartTeaserForm";

export const metadata: Metadata = {
  title: "Calculer mon thème astral gratuit — Astrologium",
  description:
    "Ta date, heure et lieu de naissance suffisent : découvre ton thème natal complet en 30 secondes, sans créer de compte. Positions, maisons, Soleil, Lune, Ascendant.",
};

export default function ThemeAstralPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Thème astral gratuit</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Qu&apos;est-ce que dit vraiment ton ciel de naissance ?</h1>
          <p className="mt-5 text-muted">
            Sans créer de compte. Entre ta date, heure et lieu de naissance pour voir ton thème complet — tu ne
            crées un compte que si tu veux le garder.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <NatalChartTeaserForm locale="fr" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
