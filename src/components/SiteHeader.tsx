import Link from "next/link";
import { Logo } from "./Logo";
import { ButtonLink } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";

export type Locale = "fr" | "en";

interface NavHrefs {
  home: string;
  horoscope: string;
  guides: string;
  method: string;
  compatibility: string;
  pricing: string;
  login: string;
  signup: string;
}

const HREFS: Record<Locale, NavHrefs> = {
  fr: {
    home: "/",
    horoscope: "/horoscope",
    guides: "/guides",
    method: "/methode",
    compatibility: "/compatibilite",
    pricing: "/tarifs",
    login: "/connexion",
    signup: "/inscription",
  },
  en: {
    home: "/en",
    horoscope: "/en/horoscope",
    guides: "/en/guides",
    method: "/en/method",
    compatibility: "/en/compatibility",
    pricing: "/en/pricing",
    login: "/en/login",
    signup: "/en/signup",
  },
};

const NAV_TEXT: Record<
  Locale,
  { horoscope: string; guides: string; method: string; compatibility: string; pricing: string; login: string; cta: string; switchTo: string }
> = {
  fr: {
    horoscope: "Horoscope",
    guides: "Guides",
    method: "La méthode",
    compatibility: "Compatibilité",
    pricing: "Tarifs",
    login: "Connexion",
    cta: "Créer mon thème",
    switchTo: "EN",
  },
  en: {
    horoscope: "Horoscope",
    guides: "Guides",
    method: "Our method",
    compatibility: "Compatibility",
    pricing: "Pricing",
    login: "Log in",
    cta: "Create my chart",
    switchTo: "FR",
  },
};

export function SiteHeader({ locale = "fr" }: { locale?: Locale }) {
  const t = NAV_TEXT[locale];
  const hrefs = HREFS[locale];
  const switchHref = locale === "en" ? HREFS.fr.home : HREFS.en.home;

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={hrefs.home}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted lg:flex">
          <Link href={hrefs.horoscope} className="hover:text-foreground">
            {t.horoscope}
          </Link>
          <Link href={hrefs.guides} className="hover:text-foreground">
            {t.guides}
          </Link>
          <Link href={hrefs.method} className="hover:text-foreground">
            {t.method}
          </Link>
          <Link href={hrefs.compatibility} className="hover:text-foreground">
            {t.compatibility}
          </Link>
          <Link href={hrefs.pricing} className="hover:text-foreground">
            {t.pricing}
          </Link>
          <Link href={hrefs.login} className="hover:text-foreground">
            {t.login}
          </Link>
          <Link href={switchHref} className="rounded-full border border-border-soft px-2.5 py-1 text-xs hover:text-foreground">
            {t.switchTo}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ButtonLink href={hrefs.signup} size="sm">
            {t.cta}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
