"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StreakBadge } from "./StreakBadge";
import { LocaleToggle } from "./LocaleToggle";

type Locale = "fr" | "en";

const TEXT: Record<
  Locale,
  {
    natalChart: string;
    compatibility: string;
    profiles: string;
    friends: string;
    synastry: string;
    synastryHint: string;
    composite: string;
    compositeHint: string;
    lifeMission: string;
    lifeMissionHint: string;
    cartography: string;
    cartographyHint: string;
    horoscope: string;
    subscription: string;
    credit: string;
    credits: string;
    logout: string;
    streakDay: string;
    streakDays: string;
    addProfile: string;
    openMenu: string;
    closeMenu: string;
  }
> = {
  fr: {
    natalChart: "Thème astral",
    compatibility: "Compatibilité astrale",
    profiles: "Profils",
    addProfile: "Ajouter un profil",
    friends: "Amis",
    synastry: "Synastrie",
    synastryHint: "Superpose deux thèmes pour lire la dynamique d'une relation : aspects croisés, forces et frictions.",
    composite: "Thème composite",
    compositeHint: "Le thème \"du couple\" lui-même, calculé par la méthode des points médians — une troisième entité, au-delà des deux personnes.",
    lifeMission: "Mission de vie",
    lifeMissionHint: "Lecture de l'axe des Nœuds lunaires : la direction d'évolution à apprivoiser et le terrain déjà acquis à ne pas surinvestir.",
    cartography: "Cartographie",
    cartographyHint: "Vos lignes planétaires projetées sur la carte du monde — cliquez un pays pour voir ce qui s'y passerait.",
    horoscope: "Horoscope",
    subscription: "Abonnement",
    credit: "crédit",
    credits: "crédits",
    logout: "Déconnexion",
    streakDay: "jour",
    streakDays: "jours",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  en: {
    natalChart: "Natal chart",
    compatibility: "Astral compatibility",
    profiles: "Profiles",
    friends: "Friends",
    synastry: "Synastry",
    synastryHint: "Overlay two charts to read a relationship's dynamics: cross-aspects, strengths and friction points.",
    composite: "Composite chart",
    compositeHint: "The chart \"of the couple\" itself, calculated with the midpoint method — a third entity, beyond the two individuals.",
    lifeMission: "Life mission",
    lifeMissionHint: "A reading of the lunar Nodes axis: the direction of growth to embrace, and the already-familiar ground not to over-invest in.",
    cartography: "Cartography",
    cartographyHint: "Your planetary lines projected on the world map — tap a country to see what would happen there.",
    horoscope: "Horoscope",
    subscription: "Subscription",
    credit: "credit",
    credits: "credits",
    logout: "Log out",
    streakDay: "day",
    streakDays: "days",
    addProfile: "Add a profile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
};

export function DashboardNav({
  email,
  credits,
  isPremium,
  locale = "fr",
  streak = 0,
  streakMilestone = false,
  isAdmin = false,
}: {
  email: string;
  credits: number;
  isPremium: boolean;
  locale?: Locale;
  streak?: number;
  streakMilestone?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = TEXT[locale];
  const [compatOpen, setCompatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const horoscopeHref = locale === "en" ? "/en/horoscope" : "/horoscope";

  const compatItems = [
    { href: "/dashboard/synastrie", label: t.synastry, hint: t.synastryHint },
    { href: "/dashboard/composite", label: t.composite, hint: t.compositeHint },
  ];
  const compatActive = compatItems.some((item) => pathname.startsWith(item.href));

  const mainLinks = [
    { href: "/dashboard/theme-natal", label: t.natalChart, hint: undefined },
    { href: "/dashboard/mission-de-vie", label: t.lifeMission, hint: t.lifeMissionHint },
    { href: "/dashboard/cartographie", label: t.cartography, hint: t.cartographyHint },
    { href: horoscopeHref, label: t.horoscope, hint: undefined },
  ];

  const secondaryLinks: { href: string; label: string; hint?: undefined }[] = [
    { href: "/dashboard/amis", label: t.friends },
    { href: "/dashboard/abonnement", label: t.subscription },
  ];

  // Menu mobile : les mêmes liens que la nav desktop (repliée sous xl), mais
  // à plat plutôt qu'en sous-menu déroulant — plus simple à parcourir au
  // doigt qu'un survol de souris qui n'existe pas sur tactile.
  const mobileLinks = [
    { href: "/dashboard/profils", label: t.profiles, hint: undefined },
    mainLinks[0],
    ...compatItems,
    ...mainLinks.slice(1),
    ...secondaryLinks,
  ];

  function openCompat() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setCompatOpen(true);
  }
  function scheduleCloseCompat() {
    closeTimeout.current = setTimeout(() => setCompatOpen(false), 150);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-4 sm:px-6">
        <Link href="/dashboard/profils">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted xl:flex">
          <Link
            href={mainLinks[0].href}
            className={pathname.startsWith(mainLinks[0].href) ? "text-gold-strong" : "hover:text-foreground"}
          >
            {mainLinks[0].label}
          </Link>

          <div className="relative" onMouseEnter={openCompat} onMouseLeave={scheduleCloseCompat}>
            <button
              type="button"
              onClick={() => setCompatOpen((v) => !v)}
              className={`inline-flex items-center gap-1 ${compatActive ? "text-gold-strong" : "hover:text-foreground"}`}
              aria-expanded={compatOpen}
            >
              {t.compatibility}
              <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${compatOpen ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {compatOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border-soft bg-surface shadow-[0_12px_32px_-12px_#00000080]">
                {compatItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.hint}
                    className={`block px-4 py-2.5 text-sm ${pathname.startsWith(item.href) ? "text-gold-strong" : "text-muted hover:bg-gold/5 hover:text-foreground"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {mainLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.hint}
              className={pathname.startsWith(link.href) ? "text-gold-strong" : "hover:text-foreground"}
            >
              {link.label}
            </Link>
          ))}

          <span className="h-4 w-px bg-border-soft" aria-hidden="true" />

          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "text-gold-strong" : "hover:text-foreground"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-3">
          <Link
            href="/dashboard/profils/nouveau"
            title={t.addProfile}
            aria-label={t.addProfile}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold-strong hover:bg-gold/10"
          >
            <span aria-hidden="true" className="text-lg leading-none">+</span>
          </Link>
          <StreakBadge streak={streak} isNewMilestone={streakMilestone} label={streak > 1 ? t.streakDays : t.streakDay} />
          {isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>{credits} {credits > 1 ? t.credits : t.credit}</Badge>}
          {isAdmin && (
            <Link href="/dashboard/admin" className="text-xs text-muted/70 hover:text-gold-strong">
              Admin
            </Link>
          )}
          <span className="hidden max-w-[14ch] truncate text-muted 2xl:inline">{email}</span>
          <ThemeToggle />
          <LocaleToggle locale={locale} />
          <button onClick={logout} className="hidden whitespace-nowrap text-muted hover:text-foreground sm:inline">
            {t.logout}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="dashboard-mobile-menu"
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-soft text-foreground xl:hidden"
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
        <nav id="dashboard-mobile-menu" className="border-t border-border-soft bg-background px-4 py-4 sm:px-6 xl:hidden">
          <ul className="space-y-1 text-sm">
            {mobileLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={link.hint}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 ${
                    pathname.startsWith(link.href) ? "bg-gold/10 text-gold-strong" : "text-muted hover:bg-gold/5 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className="mt-3 block w-full rounded-lg border-t border-border-soft px-3 pt-4 text-left text-sm text-muted hover:text-foreground sm:hidden"
          >
            {t.logout}
          </button>
        </nav>
      )}
    </header>
  );
}
