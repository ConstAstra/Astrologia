import Link from "next/link";
import { Logo } from "./Logo";
import { ButtonLink } from "./ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/methode" className="hover:text-foreground">
            La méthode
          </Link>
          <Link href="/tarifs" className="hover:text-foreground">
            Tarifs
          </Link>
          <Link href="/connexion" className="hover:text-foreground">
            Connexion
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink href="/inscription" size="sm">
            Créer mon thème
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
