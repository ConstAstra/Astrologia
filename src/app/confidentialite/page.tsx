import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Confidentialité — Astrologium" };

export default function ConfidentialitePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-4xl">Politique de confidentialité</h1>
          <Card className="mt-8 space-y-6 p-8 text-sm leading-relaxed text-muted">
            <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-4 text-terracotta">
              Cette page décrit le traitement réel de vos données par Astrologium. L&apos;immatriculation de
              l&apos;entreprise (SIRET) est en cours ; seuls l&apos;identité de l&apos;exploitant et l&apos;adresse
              de contact restent à compléter, sans que cela affecte les engagements décrits ici.
            </p>

            <div>
              <h2 className="font-display text-xl text-foreground">Données collectées</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Compte : e-mail, mot de passe (haché avec bcrypt, jamais stocké ni transmis en clair), nom optionnel, langue préférée.</li>
                <li>
                  Profils astrologiques : date, heure et lieu de naissance, ainsi que les coordonnées
                  géographiques qui en sont dérivées — une donnée que nous traitons avec vigilance car elle peut
                  indirectement révéler des informations personnelles, même si le RGPD ne la qualifie pas
                  formellement de donnée « sensible » au sens de son article 9.
                </li>
                <li>Personnalisation : choix visuels d&apos;avatar enregistrés à votre initiative ; aucune nouvelle information n&apos;est déduite au-delà de ce que vous avez sélectionné.</li>
                <li>Usage du service : séries de connexion (« streak »), horodatage des dernières lectures consultées, à des fins de suivi de votre propre progression.</li>
                <li>Parrainage : code de parrainage associé à votre compte et lien avec les comptes parrainés, pour l&apos;attribution des crédits offerts.</li>
                <li>Notifications (si activées par vous) : point de terminaison (endpoint) et clés de chiffrement de votre abonnement aux notifications push de votre navigateur ; adresse e-mail pour l&apos;envoi de l&apos;horoscope quotidien.</li>
                <li>Facturation : gérée par Stripe et/ou Apple, qui traitent directement les moyens de paiement — nous ne stockons aucune donnée de carte bancaire.</li>
                <li>Technique : adresse IP, utilisée brièvement pour la limitation de débit (anti-abus) sur certains points d&apos;API sensibles, jamais à des fins de profilage publicitaire.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Finalités et base légale</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Fournir les calculs et interprétations demandés, gérer vos profils — exécution du contrat qui vous lie à Astrologium.</li>
                <li>Gérer l&apos;abonnement, les crédits et la facturation — exécution du contrat.</li>
                <li>Sécuriser votre compte (hachage du mot de passe, limitation de débit, jetons de session) — intérêt légitime à protéger le service et ses utilisateurs.</li>
                <li>Vous envoyer l&apos;horoscope du jour ou des notifications push — uniquement sur la base de votre consentement explicite (activation volontaire, désabonnement possible à tout moment en un clic).</li>
                <li>Programme de parrainage — exécution du contrat et intérêt légitime à faire connaître le service.</li>
                <li>Générer une lecture personnalisée par intelligence artificielle lors d&apos;un événement astrologique marquant, ainsi que la synthèse approfondie de votre thème (natal, synastrie, composite, révolution solaire, mission de vie) — exécution du contrat, sur la base des seules données astrologiques calculées de votre thème (positions, maisons, aspects, degrés). Aucune donnée d&apos;identification (nom, e-mail, identifiant de compte) n&apos;est transmise à ce sous-traitant.</li>
              </ul>
              <p className="mt-2">Aucune donnée n&apos;est vendue à des tiers, ni utilisée à des fins publicitaires.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Sous-traitants</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Vercel Inc. — hébergement de l&apos;application (États-Unis).</li>
                <li>Neon Inc. — hébergement de la base de données PostgreSQL, infrastructure exploitée depuis l&apos;Union européenne.</li>
                <li>Stripe — traitement des paiements web.</li>
                <li>Apple — traitement des achats intégrés sur iOS.</li>
                <li>Resend — envoi des e-mails transactionnels (réinitialisation de mot de passe, horoscope quotidien), lorsque ce service est configuré en production.</li>
                <li>Anthropic — génération du texte des lectures personnalisées d&apos;événements astrologiques et de la synthèse approfondie du thème, à partir des seules données astrologiques calculées, sans donnée d&apos;identification. Cette synthèse est mise en cache après sa première génération : elle n&apos;est pas régénérée à chaque consultation.</li>
                <li>OpenStreetMap / Nominatim — conversion du lieu de naissance saisi en coordonnées géographiques.</li>
              </ul>
              <p className="mt-2">
                Certains de ces sous-traitants sont établis aux États-Unis. Ces transferts hors Union européenne
                sont encadrés par les clauses contractuelles types (CCT) de la Commission européenne ou un
                mécanisme équivalent proposé par chaque sous-traitant.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Sécurité</h2>
              <p className="mt-2">
                Les mots de passe sont hachés avec bcrypt et ne sont jamais stockés ni transmis en clair. Les
                échanges entre votre navigateur et nos serveurs sont chiffrés (HTTPS/TLS). Le cookie de session
                est marqué <code>httpOnly</code> (inaccessible en JavaScript) et <code>secure</code> en
                production (transmis uniquement en HTTPS), afin de limiter les risques de vol de session.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Cookies et traceurs</h2>
              <p className="mt-2">
                Astrologium utilise uniquement un cookie de session strictement nécessaire à l&apos;authentification.
                Aucun cookie publicitaire, aucun traceur de mesure d&apos;audience tiers n&apos;est déposé sur ce
                site.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Vos droits</h2>
              <p className="mt-2">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement
                et de portabilité de vos données. Vous pouvez exercer la plupart de ces droits directement et
                immédiatement depuis votre tableau de bord : modifier vos informations de compte, supprimer un
                profil astrologique, ou supprimer intégralement votre compte. Pour toute autre demande, écrivez
                à [À COMPLÉTER — adresse e-mail de contact].
              </p>
              <p className="mt-2">
                Vous disposez également du droit d&apos;introduire une réclamation auprès de la Commission
                nationale de l&apos;informatique et des libertés (CNIL — www.cnil.fr) si vous estimez que le
                traitement de vos données n&apos;est pas conforme au RGPD.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Conservation</h2>
              <p className="mt-2">
                Les données de compte et les profils sont conservés tant que votre compte reste actif. La
                suppression du compte entraîne la suppression immédiate et irréversible des profils associés,
                de l&apos;historique de lecture et de vos préférences. Les données de facturation peuvent être
                conservées plus longtemps par nos sous-traitants de paiement pour leurs propres obligations
                légales (comptabilité, lutte contre la fraude), indépendamment d&apos;Astrologium. Les journaux
                techniques utilisés pour la sécurité et la limitation de débit sont conservés pour une durée
                limitée avant suppression automatique.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground">Mineurs</h2>
              <p className="mt-2">
                Astrologium ne s&apos;adresse pas spécifiquement aux mineurs de moins de 15 ans. Conformément au
                droit français, la création d&apos;un compte par un mineur de moins de 15 ans nécessite le
                consentement conjoint d&apos;un titulaire de l&apos;autorité parentale.
              </p>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
