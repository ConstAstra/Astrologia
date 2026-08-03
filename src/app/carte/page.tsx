import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { MapTeaserForm } from "@/components/carte/MapTeaserForm";

export const metadata: Metadata = {
  title: "Carte astrologique interactive — Astrologium",
  description:
    "Ta date, heure et lieu de naissance suffisent : découvre en 30 secondes, sans compte, quels pays du monde activent vraiment tes lignes astrologiques. Tape un pays, découvre ce qui s'y passerait.",
};

export default function CartePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Carte interactive</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Où sur Terre tes lignes s&apos;activent ?</h1>
          <p className="mt-5 text-muted">
            Basé sur ton vrai thème natal (date, heure et lieu de naissance) — sans créer de compte. Tape un
            pays sur la carte pour voir ce que tes lignes y racontent vraiment.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <MapTeaserForm locale="fr" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
