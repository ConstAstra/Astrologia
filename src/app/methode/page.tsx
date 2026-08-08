import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { METHODOLOGY } from "@/lib/astro/interpretations/methodology";
import { SunIcon, OverlapIcon, MergeIcon, MapPinIcon, OrbitIcon, WheelIcon, EyeIcon } from "@/components/icons/FeatureIcons";

export const metadata: Metadata = {
  title: "La méthode — Astrologium",
  description: "Comment Astrologium calcule vos thèmes : zodiaque, éphémérides, maisons, aspects, synastrie, composite, cartographie.",
};

// Une icône par section, dans l'ordre de METHODOLOGY — purement décoratif,
// pensé pour casser l'effet "mur de texte" plutôt que pour ajouter du sens.
// Les icônes se répètent volontairement entre sections apparentées (zodiaque
// et maisons partagent une logique de roue, degré exact et limites assumées
// une logique d'observation précise) plutôt que d'inventer un pictogramme
// arbitraire par section.
const SECTION_ICONS = [WheelIcon, OrbitIcon, WheelIcon, EyeIcon, OverlapIcon, OverlapIcon, MergeIcon, MapPinIcon, EyeIcon, SunIcon];

export default function MethodePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-16 text-center">
          <Eyebrow>Transparence</Eyebrow>
          <h1 className="font-display mt-4 text-4xl sm:text-5xl">Comment on calcule votre ciel</h1>
          <p className="mt-5 text-muted">
            Aucune boîte noire. Voici, dans le détail, les méthodes et conventions utilisées pour chaque
            outil — pour que vous puissiez lire vos thèmes en toute connaissance de cause.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="space-y-6">
            {METHODOLOGY.map((section, i) => {
              const Icon = SECTION_ICONS[i % SECTION_ICONS.length];
              return (
                <Card key={section.title} className="p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/5">
                      <Icon className="h-5 w-5 text-gold-strong" />
                    </span>
                    <h2 className="font-display text-2xl text-gold-strong">{section.title}</h2>
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                    {section.body.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
