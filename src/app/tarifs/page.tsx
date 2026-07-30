import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow, Badge } from "@/components/ui/Card";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import {
  CREDIT_PACKS,
  SUBSCRIPTION_PLANS,
  appleProductIdForPack,
  appleProductIdForPlan,
} from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Tarifs — Astrologia",
  description: "Thème natal gratuit. Synastrie, composite et cartographie à l'unité ou en illimité avec Premium.",
};

export default function TarifsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          <Eyebrow>Tarifs</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Simple, honnête, sans surprise</h1>
          <p className="mt-5 text-muted">
            Votre thème natal complet est et restera gratuit. Vous ne payez que pour aller plus loin :
            synastrie, thème composite, cartographie astrologique.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col p-8">
              <Eyebrow>Gratuit</Eyebrow>
              <p className="font-display mt-2 text-3xl">0 €</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
                <li>✓ Thème astral complet, illimité</li>
                <li>✓ Jusqu&apos;à 6 profils enregistrés</li>
                <li>✓ Interprétations détaillées du thème natal</li>
                <li className="text-muted/60">— Synastrie, composite, cartographie : à l&apos;unité (voir crédits)</li>
              </ul>
            </Card>

            <Card className="flex flex-col border-gold/50 p-8 shadow-[0_0_0_1px_#d7b78133]">
              <Badge tone="gold">Premium — le plus populaire</Badge>
              <p className="font-display mt-2 text-3xl">
                {(SUBSCRIPTION_PLANS.monthly.amountCents / 100).toFixed(2)} € <span className="text-base text-muted">/ mois</span>
              </p>
              <p className="text-xs text-muted">Essai gratuit de {SUBSCRIPTION_PLANS.monthly.trialDays} jours</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
                <li>✓ Tout le plan gratuit</li>
                <li>✓ Synastrie illimitée</li>
                <li>✓ Thème composite illimité</li>
                <li>✓ Cartographie astrologique illimitée</li>
                <li>✓ Profils illimités</li>
              </ul>
              <div className="mt-6">
                <CheckoutButton
                  target={{ kind: "subscription", plan: "monthly", appleProductId: appleProductIdForPlan("monthly") }}
                >
                  Essayer Premium
                </CheckoutButton>
              </div>
            </Card>

            <Card className="flex flex-col p-8">
              <Eyebrow>Premium annuel</Eyebrow>
              <p className="font-display mt-2 text-3xl">
                {(SUBSCRIPTION_PLANS.annual.amountCents / 100).toFixed(0)} € <span className="text-base text-muted">/ an</span>
              </p>
              <p className="text-xs text-sage">
                Soit {(SUBSCRIPTION_PLANS.annual.amountCents / 1200).toFixed(2)} €/mois — économisez environ 34 %
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
                <li>✓ Tout Premium</li>
                <li>✓ Facturation annuelle simplifiée</li>
                <li>✓ Essai gratuit de {SUBSCRIPTION_PLANS.annual.trialDays} jours</li>
              </ul>
              <div className="mt-6">
                <CheckoutButton
                  variant="secondary"
                  target={{ kind: "subscription", plan: "annual", appleProductId: appleProductIdForPlan("annual") }}
                >
                  Essayer l&apos;annuel
                </CheckoutButton>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <Eyebrow>À l&apos;unité</Eyebrow>
            <h2 className="font-display mt-3 text-3xl">Pas envie de vous abonner ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Achetez des crédits et débloquez exactement la lecture dont vous avez besoin — une synastrie,
              un composite ou une cartographie. Un crédit dépensé sur une paire de profils la débloque pour
              toujours, sans repayer pour la relire.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {(Object.entries(CREDIT_PACKS) as [keyof typeof CREDIT_PACKS, (typeof CREDIT_PACKS)[keyof typeof CREDIT_PACKS]][]).map(
              ([id, pack]) => (
                <Card key={id} className="flex flex-col p-6 text-center">
                  <p className="font-display text-2xl">{pack.label}</p>
                  <p className="mt-2 text-2xl text-gold-strong">{(pack.amountCents / 100).toFixed(2)} €</p>
                  <p className="mt-1 text-xs text-muted">
                    soit {(pack.amountCents / 100 / pack.credits).toFixed(2)} € / déblocage
                  </p>
                  <div className="mt-5">
                    <CheckoutButton
                      variant="secondary"
                      target={{ kind: "credits", pack: id, appleProductId: appleProductIdForPack(id) }}
                    >
                      Acheter
                    </CheckoutButton>
                  </div>
                </Card>
              )
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
