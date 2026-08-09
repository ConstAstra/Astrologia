import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Actualités — Astrologium",
  description: "Le journal des nouveautés d'Astrologium : ce qui change, ce qui s'ajoute.",
};

const ENTRIES = [
  {
    date: "Août 2026",
    title: "Lancement d'Astrologium",
    body: [
      "Astrologium ouvre ses portes. Le thème natal complet — planètes, maisons, aspects, Ascendant — est gratuit et illimité, sans carte bancaire.",
      "Les autres outils sont disponibles dès l'inscription : synastrie et thème composite pour explorer une relation à deux, mission de vie (lecture de l'axe des Nœuds lunaires), cartographie astrale (vos lignes planétaires sur la carte du monde), et un horoscope du jour calculé — pas générique — pour chaque signe.",
      "Le parrainage permet d'inviter vos proches et de créer leur thème pour lire une synastrie ou un composite ensemble.",
    ],
  },
];

export default function ActualitesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Journal</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Actualités</h1>
          <p className="mt-5 text-muted">
            Ce qui change et ce qui s&apos;ajoute à Astrologium, au fil du temps.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="space-y-6">
            {ENTRIES.map((entry) => (
              <Card key={entry.title} className="p-7">
                <p className="text-xs uppercase tracking-wide text-gold-strong">{entry.date}</p>
                <h2 className="font-display mt-2 text-2xl">{entry.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                  {entry.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
