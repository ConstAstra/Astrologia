import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

const TOOLS = [
  {
    title: "Thème astral",
    description:
      "Positions précises des planètes, des maisons et des aspects au moment exact de votre naissance, avec une lecture détaillée signe par signe, maison par maison.",
  },
  {
    title: "Synastrie",
    description:
      "Superposez deux thèmes pour comprendre la dynamique d'un couple ou d'une relation : aspects croisés, maisons superposées, forces et frictions.",
  },
  {
    title: "Thème composite",
    description:
      "Le thème \"du couple\" lui-même, calculé par la méthode des points médians — une troisième entité, au-delà des deux personnes.",
  },
  {
    title: "Cartographie astrologique",
    description:
      "Vos lignes planétaires projetées sur une carte du monde : où votre Soleil brille-t-il, où votre Vénus adoucit-elle la vie, où Saturne structure-t-il ?",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
          <Eyebrow>Astrologie occidentale, calculée avec rigueur</Eyebrow>
          <h1 className="font-display mx-auto mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">
            Partez à la découverte de <em className="text-gold-strong italic">vous-même et des autres</em>{" "}
            grâce à l&apos;astrologie.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-xl text-foreground/90">
            Votre thème, vos relations, votre couple, vos lieux de vie : à chacun sa lecture.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted">
            Thème astral, synastrie, thème composite et cartographie astrologique. Chaque calcul, chaque
            système de maisons, chaque orbe est documenté : vous savez toujours ce que vous lisez et pourquoi.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/inscription" size="lg">
              Découvrir mon thème astral
            </ButtonLink>
            <ButtonLink href="/methode" variant="secondary" size="lg">
              Comprendre la méthode
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-muted/70">Thème natal complet gratuit. Sans carte bancaire.</p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-5 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Card key={tool.title} className="p-7">
                <h2 className="font-display text-2xl">{tool.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{tool.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Eyebrow>Notre engagement</Eyebrow>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">La rigueur avant l&apos;effet de manche</h2>
          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            <div>
              <p className="font-display text-xl text-gold-strong">Éphémérides précises</p>
              <p className="mt-2 text-sm text-muted">
                Positions planétaires géocentriques apparentes, précision de l&apos;ordre de la seconde d&apos;arc.
              </p>
            </div>
            <div>
              <p className="font-display text-xl text-gold-strong">Maisons transparentes</p>
              <p className="mt-2 text-sm text-muted">
                Placidus, signes entiers, maisons égales ou Porphyre — vous choisissez, on vous explique la différence.
              </p>
            </div>
            <div>
              <p className="font-display text-xl text-gold-strong">Limites assumées</p>
              <p className="mt-2 text-sm text-muted">
                Heure inconnue ? On vous le dit plutôt que d&apos;inventer un Ascendant. Voir la page méthode.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <Card className="p-10">
            <h2 className="font-display text-3xl">Prêt(e) à voir votre ciel ?</h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              Le thème natal complet est gratuit. La synastrie, le composite et la cartographie se débloquent à
              l&apos;unité ou en illimité avec Premium.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/inscription" size="lg">
                Commencer gratuitement
              </ButtonLink>
              <ButtonLink href="/tarifs" variant="secondary" size="lg">
                Voir les tarifs
              </ButtonLink>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
