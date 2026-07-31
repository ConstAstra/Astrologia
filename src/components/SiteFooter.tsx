import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted">
              Thème astral, synastrie, thème composite et cartographie — calculés avec rigueur, expliqués
              clairement. Un outil de réflexion et d&apos;introspection, pas une prédiction.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-medium text-foreground">Produit</p>
              <ul className="space-y-2 text-muted">
                <li><Link href="/methode" className="hover:text-foreground">La méthode</Link></li>
                <li><Link href="/compatibilite" className="hover:text-foreground">Compatibilité</Link></li>
                <li><Link href="/tarifs" className="hover:text-foreground">Tarifs</Link></li>
                <li><Link href="/inscription" className="hover:text-foreground">Créer un compte</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-foreground">Légal</p>
              <ul className="space-y-2 text-muted">
                <li><Link href="/mentions-legales" className="hover:text-foreground">Mentions légales</Link></li>
                <li><Link href="/confidentialite" className="hover:text-foreground">Confidentialité</Link></li>
                <li><Link href="/conditions-generales" className="hover:text-foreground">CGV / CGU</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted/70">
          © {new Date().getFullYear()} Astrologia. Contenus à visée d&apos;introspection et de divertissement,
          sans valeur prédictive garantie.
        </p>
      </div>
    </footer>
  );
}
