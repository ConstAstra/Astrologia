import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Conditions générales — Astrologium" };

export default function ConditionsGeneralesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Conditions générales d&apos;utilisation et de vente</h1>
          <Card className="mt-8 space-y-6 p-8 text-sm leading-relaxed text-muted">
            <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-4 text-terracotta">
              Modèle indicatif à faire relire par un professionnel du droit avant commercialisation.
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">1. Objet</h2>
              <p className="mt-2">
                Astrologium fournit des calculs et interprétations astrologiques (thème natal, synastrie,
                thème composite, cartographie astrologique) à des fins de réflexion personnelle et de
                divertissement. Le service ne constitue pas un conseil professionnel (médical, juridique,
                financier ou psychologique) et ne garantit aucune prédiction d&apos;événement futur.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">2. Formules et paiement</h2>
              <p className="mt-2">
                Un compte gratuit permet de créer un thème natal illimité. Certaines fonctionnalités
                (synastrie, thème composite, cartographie) requièrent soit un abonnement Premium (mensuel ou
                annuel, résiliable à tout moment, essai gratuit selon l&apos;offre en vigueur), soit
                l&apos;achat de crédits à l&apos;unité. Les paiements sont traités par Stripe (web) ou Apple
                (application iOS) ; aucune coordonnée bancaire n&apos;est stockée par Astrologium.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">3. Rétractation et remboursement</h2>
              <p className="mt-2">
                Conformément à la réglementation applicable au contenu numérique fourni immédiatement après
                achat, le droit de rétractation peut ne pas s&apos;appliquer une fois la fonctionnalité
                débloquée. Les abonnements peuvent être résiliés à tout moment depuis l&apos;espace de gestion
                de l&apos;abonnement (Stripe) ou via les réglages Apple ID (App Store), sans reconduction au-delà
                de la période en cours.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">4. Responsabilité</h2>
              <p className="mt-2">
                Les interprétations fournies sont de nature symbolique et générale. L&apos;utilisateur reste seul
                responsable des décisions prises sur la base de ces contenus. Astrologium s&apos;efforce d&apos;assurer
                l&apos;exactitude des calculs astronomiques mais ne peut garantir une exactitude absolue,
                notamment en cas d&apos;heure de naissance imprécise fournie par l&apos;utilisateur.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">5. Résiliation de compte</h2>
              <p className="mt-2">
                Vous pouvez supprimer votre compte à tout moment. Un abonnement en cours doit être annulé
                séparément (Stripe ou App Store) avant suppression du compte pour éviter tout renouvellement.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
