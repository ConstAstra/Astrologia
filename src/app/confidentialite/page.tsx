import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Confidentialité — Astrologia" };

export default function ConfidentialitePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Politique de confidentialité</h1>
          <Card className="mt-8 space-y-6 p-8 text-sm leading-relaxed text-muted">
            <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-4 text-terracotta">
              Modèle indicatif, à faire relire par un professionnel avant mise en production — en particulier
              pour la conformité RGPD complète (registre des traitements, base légale précise par finalité,
              délégué à la protection des données le cas échéant).
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Données collectées</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Compte : e-mail, mot de passe (haché, jamais stocké en clair), nom optionnel.</li>
                <li>
                  Profils astrologiques : date, heure et lieu de naissance (donnée sensible au sens où elle
                  révèle indirectement des informations personnelles) — utilisés uniquement pour les calculs
                  demandés.
                </li>
                <li>Facturation : gérée par Stripe et/ou Apple, qui traitent directement les moyens de paiement — nous ne stockons aucune donnée de carte bancaire.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Finalités</h2>
              <p className="mt-2">
                Fournir les calculs et interprétations demandés, gérer l&apos;abonnement et les crédits, assurer
                la sécurité du compte. Aucune donnée n&apos;est vendue à des tiers.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Sous-traitants</h2>
              <p className="mt-2">
                Hébergement applicatif et base de données [À COMPLÉTER], Stripe (paiements web), Apple (achats
                intégrés iOS), service de géocodage OpenStreetMap/Nominatim (traite le lieu de naissance saisi
                pour le convertir en coordonnées).
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Vos droits</h2>
              <p className="mt-2">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et
                de portabilité de vos données. Vous pouvez supprimer vos profils à tout moment depuis votre
                tableau de bord, ou demander la suppression complète de votre compte à [À COMPLÉTER — e-mail de contact].
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Conservation</h2>
              <p className="mt-2">
                Les données de compte et les profils sont conservés tant que le compte est actif. La
                suppression du compte entraîne la suppression des profils associés.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
