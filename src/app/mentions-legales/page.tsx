import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Mentions légales — Astrologium" };

export default function MentionsLegalesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Mentions légales</h1>
          <Card className="mt-8 space-y-6 p-8 text-sm leading-relaxed text-muted">
            <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-4 text-terracotta">
              Modèle à personnaliser avant mise en ligne : remplacez chaque [À COMPLÉTER] par vos informations
              réelles (idéalement avec l&apos;avis d&apos;un professionnel du droit avant commercialisation).
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Éditeur du site</h2>
              <p className="mt-2">
                Raison sociale : [À COMPLÉTER]<br />
                Forme juridique : [À COMPLÉTER — auto-entreprise, SASU, etc.]<br />
                Siège social : [À COMPLÉTER]<br />
                SIRET : [À COMPLÉTER]<br />
                Directeur de la publication : [À COMPLÉTER]<br />
                Contact : [À COMPLÉTER — e-mail de contact]
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Hébergement</h2>
              <p className="mt-2">
                Hébergeur : [À COMPLÉTER — ex. Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA]<br />
                Base de données : [À COMPLÉTER — nom de votre fournisseur PostgreSQL en production]
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Nature du service</h2>
              <p className="mt-2">
                Astrologium propose des calculs et interprétations astrologiques à visée de réflexion
                personnelle et de divertissement. Ces contenus ne constituent ni un avis médical, ni un avis
                juridique ou financier, ni une prédiction garantie d&apos;événements futurs. L&apos;éditeur ne
                saurait être tenu responsable des décisions prises sur la base des lectures fournies.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Propriété intellectuelle</h2>
              <p className="mt-2">
                L&apos;ensemble des textes, méthodes de mise en forme et éléments graphiques du site sont la
                propriété de l&apos;éditeur, sauf mention contraire, et ne peuvent être reproduits sans
                autorisation préalable.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
