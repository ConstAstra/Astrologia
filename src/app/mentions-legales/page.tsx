import type { Metadata } from "next";
import Link from "next/link";
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
              L&apos;immatriculation de l&apos;entreprise (SIRET) est en cours. Les champs marqués
              [À COMPLÉTER] seront renseignés dès sa délivrance ; aucune information d&apos;identité n&apos;est
              inventée en attendant. Le reste de cette page reflète la configuration réelle du service.
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Éditeur du site</h2>
              <p className="mt-2">
                Nom commercial : Constastra<br />
                Forme juridique : Entreprise individuelle (micro-entreprise), immatriculation en cours auprès
                du Guichet unique (INPI)<br />
                Nom et prénom de l&apos;exploitant : [À COMPLÉTER]<br />
                Adresse de l&apos;établissement : [À COMPLÉTER]<br />
                SIRET : [À COMPLÉTER — en cours d&apos;attribution]<br />
                Directeur de la publication : l&apos;exploitant nommé ci-dessus<br />
                Contact : [À COMPLÉTER — adresse e-mail de contact]
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Hébergement</h2>
              <p className="mt-2">
                Hébergeur applicatif : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
                Hébergeur de la base de données : Neon Inc. (service Neon Postgres), infrastructure exploitée
                depuis l&apos;Union européenne
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Nature du service</h2>
              <p className="mt-2">
                Astrologium propose des calculs et interprétations astrologiques à visée de <strong>divertissement
                et de réflexion personnelle</strong>, sans aucune visée scientifique. L&apos;astrologie n&apos;est
                pas une science : ses interprétations ne reposent sur aucune validation scientifique établie, et
                l&apos;éditeur ne prétend à aucun moment que les lectures fournies sont exactes, vérifiées ou
                prédictives.
              </p>
              <p className="mt-3">
                Ces contenus ne constituent en aucun cas un avis médical, psychologique, juridique ou financier,
                et ne remplacent pas l&apos;accompagnement d&apos;un professionnel de santé (médecin, psychologue,
                psychiatre, thérapeute) ni aucun autre professionnel qualifié. En cas de difficulté personnelle,
                émotionnelle ou psychologique, consultez un professionnel compétent plutôt que de vous appuyer sur
                les contenus de ce site.
              </p>
              <p className="mt-3">
                L&apos;éditeur ne saurait être tenu responsable des décisions prises sur la base des lectures
                fournies.
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

            <div>
              <h2 className="font-display text-xl text-foreground">Responsabilité</h2>
              <p className="mt-2">
                L&apos;éditeur met tout en œuvre pour assurer l&apos;exactitude technique des calculs
                astronomiques (éphémérides, systèmes de maisons) mais ne peut garantir une exactitude absolue,
                notamment lorsque l&apos;heure de naissance renseignée par l&apos;utilisateur est imprécise ou
                inconnue. L&apos;éditeur ne pourra être tenu responsable d&apos;une indisponibilité temporaire du
                service ni de dommages indirects résultant de son utilisation.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Droit applicable et juridiction</h2>
              <p className="mt-2">
                Le présent site et les présentes mentions sont soumis au droit français. À défaut de résolution
                amiable d&apos;un litige, les tribunaux français compétents seront saisis, sous réserve des
                règles impératives de protection du consommateur applicables aux utilisateurs résidant dans
                l&apos;Union européenne.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Médiation de la consommation</h2>
              <p className="mt-2">
                Conformément à l&apos;article L.616-1 du Code de la consommation, tout consommateur a le droit
                de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable
                d&apos;un litige. Le médiateur compétent sera précisé ici dès l&apos;immatriculation de
                l&apos;entreprise achevée. Vous pouvez par ailleurs recourir à la plateforme européenne de
                règlement en ligne des litiges :{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-strong hover:underline"
                >
                  ec.europa.eu/consumers/odr
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Cookies</h2>
              <p className="mt-2">
                Ce site utilise uniquement un cookie de session strictement nécessaire à l&apos;authentification.
                Aucun cookie publicitaire ou de mesure d&apos;audience tiers n&apos;est déposé. Détails dans notre{" "}
                <Link href="/confidentialite" className="text-gold-strong hover:underline">
                  politique de confidentialité
                </Link>
                .
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
