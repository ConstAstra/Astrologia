import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "FAQ — Astrologium",
  description:
    "Astrologium est-il gratuit ? Quelle différence avec un horoscope classique ? Mes données sont-elles privées ? Réponses claires aux questions les plus fréquentes.",
};

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Astrologium est-il vraiment gratuit ?",
    answer:
      "Le thème natal complet — planètes, maisons, aspects, Ascendant — est gratuit et illimité, sans carte bancaire. Certaines fonctionnalités relationnelles (synastrie, thème composite) et avancées (cartographie astrale, mission de vie) nécessitent soit un abonnement Premium, soit un crédit acheté à l'unité.",
  },
  {
    question: "Quelle différence avec un horoscope classique ?",
    answer:
      "Un horoscope de magazine décrit 12 cases, une par signe solaire. Astrologium calcule un vrai thème à partir de votre date, heure et lieu de naissance réels : positions planétaires exactes, maisons, aspects entre les planètes. La méthode complète, avec ses conventions et ses limites assumées, est détaillée sur la page Méthode.",
  },
  {
    question: "L'astrologie est-elle une science ?",
    answer:
      "Non, et Astrologium ne prétend jamais le contraire. C'est un outil de réflexion et de divertissement, sans validation scientifique établie, qui ne remplace ni un avis médical, ni un accompagnement psychologique, ni aucun conseil professionnel.",
  },
  {
    question: "Combien coûte l'abonnement Premium ?",
    answer:
      "12,99€/mois ou 89€/an (environ 43% d'économie sur l'annuel), avec 7 jours d'essai gratuit. Pour un usage occasionnel, des crédits à l'unité sont aussi disponibles, de 2,99€ à 24,99€ pour un pack de 12 déblocages.",
  },
  {
    question: "Mes données sont-elles privées ?",
    answer:
      "Oui. Le mot de passe est haché et jamais stocké en clair, aucune donnée n'est vendue à des tiers, et votre thème reste strictement personnel. Le détail complet — sous-traitants, durée de conservation, vos droits — est expliqué dans la politique de confidentialité.",
  },
  {
    question: "Puis-je supprimer mon compte ?",
    answer:
      "Oui, à tout moment, directement depuis votre tableau de bord — la suppression est immédiate et définitive, sans avoir à nous contacter.",
  },
  {
    question: "Ça fonctionne sur mobile ?",
    answer:
      "Oui, le site s'utilise normalement depuis un navigateur mobile, sans rien installer. Une application iOS est également en préparation.",
  },
  {
    question: "Je ne connais pas mon heure de naissance, je fais comment ?",
    answer:
      "Créez votre profil en cochant \"heure inconnue\" : l'Ascendant et les maisons sont alors désactivés (ils dépendent d'une heure précise), mais le Soleil, la Lune et les autres planètes en signe restent fiables et affichés normalement.",
  },
  {
    question: "Combien de profils puis-je créer gratuitement ?",
    answer:
      "3 profils gratuits — le vôtre et deux proches, par exemple pour tester une synastrie. Passé ce nombre, un abonnement Premium permet d'en ajouter davantage.",
  },
  {
    question: "Comment fonctionne le parrainage ?",
    answer:
      "Chaque compte dispose d'un lien de parrainage personnel. Dès que la personne invitée effectue son premier achat réel (abonnement ou crédits), 2 crédits sont offerts au parrain et 2 au filleul.",
  },
  {
    question: "Le site existe en anglais ?",
    answer: "Oui, l'intégralité du site et des calculs sont disponibles en français et en anglais.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Questions fréquentes</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">FAQ</h1>
          <p className="mt-5 text-muted">
            Les questions les plus posées avant de créer un compte — pour le reste,{" "}
            <Link href="/methode" className="text-gold-strong underline">
              la méthode
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="text-gold-strong underline">
              politique de confidentialité
            </Link>{" "}
            entrent davantage dans le détail.
          </p>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-8 pb-16">
          <div className="space-y-3">
            {FAQ.map((item) => (
              <Card key={item.question} className="overflow-hidden p-0">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-display text-base marker:content-none">
                    {item.question}
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3 shrink-0 text-gold-strong transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 4.5 6 8l3.5-3.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
                </details>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
