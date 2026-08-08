import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { HeroChartWheel } from "@/components/HeroChartWheel";
import { SunIcon, OverlapIcon, MergeIcon, MapPinIcon, OrbitIcon, WheelIcon, EyeIcon } from "@/components/icons/FeatureIcons";

const TOOLS = [
  {
    title: "Thème astral",
    description:
      "Positions précises des planètes, des maisons et des aspects au moment exact de votre naissance, avec une lecture détaillée signe par signe, maison par maison.",
    teaserHref: "/decouvrir",
    teaserLabel: "Voir mon Big 3 en 10 secondes, sans compte →",
    icon: SunIcon,
  },
  {
    title: "Synastrie",
    description:
      "Superposez deux thèmes pour comprendre la dynamique d'un couple ou d'une relation : aspects croisés, maisons superposées, forces et frictions.",
    icon: OverlapIcon,
  },
  {
    title: "Thème composite",
    description:
      "Le thème \"du couple\" lui-même, calculé par la méthode des points médians — une troisième entité, au-delà des deux personnes.",
    icon: MergeIcon,
  },
  {
    title: "Cartographie astrologique",
    description:
      "Vos lignes planétaires projetées sur une carte du monde : où votre Soleil brille-t-il, où votre Vénus adoucit-elle la vie, où Saturne structure-t-il ?",
    teaserHref: "/carte",
    teaserLabel: "Essayer la carte interactive, sans compte →",
    icon: MapPinIcon,
  },
];

const ENGAGEMENTS = [
  {
    title: "Éphémérides précises",
    description: "Positions planétaires géocentriques apparentes, précision de l'ordre de la seconde d'arc.",
    icon: OrbitIcon,
  },
  {
    title: "Maisons transparentes",
    description: "Placidus, signes entiers, maisons égales ou Porphyre — vous choisissez, on vous explique la différence.",
    icon: WheelIcon,
  },
  {
    title: "Limites assumées",
    description: "Heure inconnue ? On vous le dit plutôt que d'inventer un Ascendant. Voir la page méthode.",
    icon: EyeIcon,
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <div className="text-center lg:text-left">
            <Eyebrow>Astrologie occidentale</Eyebrow>
            <h1 className="font-display mx-auto mt-5 max-w-xl text-balance text-4xl font-semibold leading-[1.1] sm:text-5xl lg:mx-0">
              Partez à la découverte de <em className="text-gold-strong not-italic">vous-même et des autres</em> grâce à
              l&apos;astrologie.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-balance text-xl text-foreground/90 lg:mx-0">
              Votre thème, vos relations, votre couple, vos lieux de vie : à chacun sa lecture.
            </p>
            <p className="mx-auto mt-4 max-w-lg text-balance text-base text-muted lg:mx-0">
              Chaque calcul, chaque système de maisons, chaque orbe est documenté : vous savez toujours ce que
              vous lisez et pourquoi.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <ButtonLink href="/decouvrir" size="lg">
                Découvrir mon thème astral
              </ButtonLink>
              <ButtonLink href="/methode" variant="secondary" size="lg">
                Comprendre la méthode
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-muted/70">Ton Big 3 en 10 secondes, sans compte. Thème complet gratuit ensuite.</p>
          </div>
          <div className="hidden lg:block">
            <HeroChartWheel className="mx-auto max-w-md" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-5 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Card key={tool.title} className="p-7">
                <tool.icon className="h-7 w-7 text-gold-strong" />
                <h2 className="font-display mt-4 text-2xl">{tool.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{tool.description}</p>
                {tool.teaserHref && (
                  <Link href={tool.teaserHref} className="mt-3 inline-block text-sm text-gold-strong underline">
                    {tool.teaserLabel}
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Eyebrow>Notre engagement</Eyebrow>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">La rigueur avant l&apos;effet de manche</h2>
          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            {ENGAGEMENTS.map((item) => (
              <div key={item.title}>
                <item.icon className="h-6 w-6 text-gold-strong" />
                <p className="font-display mt-3 text-xl text-gold-strong">{item.title}</p>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
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
