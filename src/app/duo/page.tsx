import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Eyebrow } from "@/components/ui/Card";
import { DuoTeaserForm } from "@/components/duo/DuoTeaserForm";
import { getDuoSocialProofCount } from "@/lib/duo-social-proof";

export const metadata: Metadata = {
  title: "Test de compatibilité rapide · Astrologium",
  description:
    "Deux prénoms, deux signes, une carte à partager en 10 secondes, sans compte. Pour une lecture complète basée sur vos vrais thèmes, la vraie synastrie est gratuite à l'inscription.",
};

// Sans ça, Next prérend la page une fois au build et fige le compteur de
// preuve sociale à sa valeur du moment, jamais mis à jour en production.
export const revalidate = 300;

export default async function DuoPage() {
  const socialProofCount = await getDuoSocialProofCount();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Test rapide</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Toi & untel, ça donne quoi ?</h1>
          <p className="mt-5 text-muted">
            Deux prénoms, deux signes, une carte à partager, sans créer de compte. Basé sur les signes
            solaires uniquement ; pour une vraie synastrie (Lune, Vénus, Mars, Ascendant), l&apos;inscription
            reste gratuite.
          </p>
          {socialProofCount !== null && (
            <p className="mt-3 text-sm text-gold-strong">
              🔥 {socialProofCount.toLocaleString("fr-FR")} cartes générées cette semaine
            </p>
          )}
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          <DuoTeaserForm locale="fr" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
