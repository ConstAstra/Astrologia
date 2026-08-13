"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
  news: string;
  planets: string;
  faq: string;
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
    news: "/actualites",
    planets: "/planetes",
    faq: "/faq",
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
    news: "/en/news",
    planets: "/en/planets",
    faq: "/en/faq",
    compatibility: "/en/compatibility",
    pricing: "/en/pricing",
    login: "/en/login",
    signup: "/en/signup",
  },
};

const NAV_TEXT: Record<
  Locale,
  {
    horoscope: string;
    guides: string;
    general: string;
    method: string;
    news: string;
    planets: string;
    faq: string;
    compatibility: string;
    pricing: string;
    login: string;
    cta: string;
    switchTo: string;
    openMenu: string;
    closeMenu: string;
  }
> = {
  fr: {
    horoscope: "Horoscope",
    guides: "Guides",
    general: "Général",
    method: "La méthode",
    news: "Actualités",
    planets: "Planètes en signe",
    faq: "FAQ",
    compatibility: "Compatibilité",
    pricing: "Tarifs",
    login: "Connexion",
    cta: "Créer mon thème",
    switchTo: "EN",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  en: {
    horoscope: "Horoscope",
    guides: "Guides",
    general: "General",
    method: "Our method",
    news: "News",
    planets: "Planets in sign",
    faq: "FAQ",
    compatibility: "Compatibility",
    pricing: "Pricing",
    login: "Log in",
    cta: "Create my chart",
    switchTo: "FR",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
};

export function SiteHeader({ locale = "fr" }: { locale?: Locale }) {
  const t = NAV_TEXT[locale];
  const hrefs = HREFS[locale];
  const switchHref = locale === "en" ? HREFS.fr.home : HREFS.en.home;
  const pathname = usePathname();
  const [generalOpen, setGeneralOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generalItems = [
    { href: hrefs.guides, label: t.guides },
    { href: hrefs.planets, label: t.planets },
    { href: hrefs.method, label: t.method },
    { href: hrefs.faq, label: t.faq },
    { href: hrefs.news, label: t.news },
  ];
  const generalActive = generalItems.some((item) => pathname?.startsWith(item.href));

  function openGeneral() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setGeneralOpen(true);
  }
  function scheduleCloseGeneral() {
    closeTimeout.current = setTimeout(() => setGeneralOpen(false), 150);
  }

  const mobileLinks = [
    { href: hrefs.horoscope, label: t.horoscope },
    { href: hrefs.compatibility, label: t.compatibility },
    ...generalItems,
    { href: hrefs.pricing, label: t.pricing },
    { href: hrefs.login, label: t.login },
  ];

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
          <Link href={hrefs.compatibility} className="hover:text-foreground">
            {t.compatibility}
          </Link>

          <div className="relative" onMouseEnter={openGeneral} onMouseLeave={scheduleCloseGeneral}>
            <button
              type="button"
              onClick={() => setGeneralOpen((v) => !v)}
              className={`inline-flex items-center gap-1 ${generalActive ? "text-gold-strong" : "hover:text-foreground"}`}
              aria-expanded={generalOpen}
            >
              {t.general}
              <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${generalOpen ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {generalOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border-soft bg-surface shadow-[0_12px_32px_-12px_#00000080]">
                {generalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 text-sm ${pathname?.startsWith(item.href) ? "text-gold-strong" : "text-muted hover:bg-gold/5 hover:text-foreground"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
          <span className="hidden sm:inline-flex">
            <ButtonLink href={hrefs.signup} size="sm">
              {t.cta}
            </ButtonLink>
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-foreground lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="site-mobile-menu" className="border-t border-border-soft bg-background px-6 py-4 lg:hidden">
          <ul className="space-y-1 text-sm">
            {mobileLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 ${
                    pathname?.startsWith(link.href) ? "bg-gold/10 text-gold-strong" : "text-muted hover:bg-gold/5 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 border-t border-border-soft pt-4">
            <div className="flex-1" onClick={() => setMobileOpen(false)}>
              <ButtonLink href={hrefs.signup} size="sm" className="w-full justify-center">
                {t.cta}
              </ButtonLink>
            </div>
            <Link
              href={switchHref}
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-border-soft px-3 py-2 text-xs text-muted hover:text-foreground"
            >
              {t.switchTo}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
