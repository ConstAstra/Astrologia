"use client";

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
    subscription: string;
    credit: string;
    credits: string;
    logout: string;
    streakDay: string;
    streakDays: string;
  }
> = {
  fr: {
    profiles: "Profils",
    friends: "Amis",
    synastry: "Synastrie",
    synastryHint: "Superpose deux thèmes pour lire la dynamique d'une relation : aspects croisés, forces et frictions.",
    composite: "Composite",
    compositeHint: "Le thème \"du couple\" lui-même, calculé par la méthode des points médians — une troisième entité, au-delà des deux personnes.",
    lifeMission: "Mission de vie",
    lifeMissionHint: "Lecture de l'axe des Nœuds lunaires : la direction d'évolution à apprivoiser et le terrain déjà acquis à ne pas surinvestir.",
    cartography: "Cartographie",
    cartographyHint: "Vos lignes planétaires projetées sur la carte du monde — cliquez un pays pour voir ce qui s'y passerait.",
    subscription: "Abonnement",
    credit: "crédit",
    credits: "crédits",
    logout: "Déconnexion",
    streakDay: "jour",
    streakDays: "jours",
  },
  en: {
    profiles: "Profiles",
    friends: "Friends",
    synastry: "Synastry",
    synastryHint: "Overlay two charts to read a relationship's dynamics: cross-aspects, strengths and friction points.",
    composite: "Composite",
    compositeHint: "The chart \"of the couple\" itself, calculated with the midpoint method — a third entity, beyond the two individuals.",
    lifeMission: "Life mission",
    lifeMissionHint: "A reading of the lunar Nodes axis: the direction of growth to embrace, and the already-familiar ground not to over-invest in.",
    cartography: "Cartography",
    cartographyHint: "Your planetary lines projected on the world map — tap a country to see what would happen there.",
    subscription: "Subscription",
    credit: "credit",
    credits: "credits",
    logout: "Log out",
    streakDay: "day",
    streakDays: "days",
  },
};

export function DashboardNav({
  email,
  credits,
  isPremium,
  locale = "fr",
  streak = 0,
  streakMilestone = false,
}: {
  email: string;
  credits: number;
  isPremium: boolean;
  locale?: Locale;
  streak?: number;
  streakMilestone?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = TEXT[locale];

  const links = [
    { href: "/dashboard/profils", label: t.profiles, hint: undefined },
    { href: "/dashboard/mission-de-vie", label: t.lifeMission, hint: t.lifeMissionHint },
    { href: "/dashboard/cartographie", label: t.cartography, hint: t.cartographyHint },
    { href: "/dashboard/amis", label: t.friends, hint: undefined },
    { href: "/dashboard/synastrie", label: t.synastry, hint: t.synastryHint },
    { href: "/dashboard/composite", label: t.composite, hint: t.compositeHint },
    { href: "/dashboard/abonnement", label: t.subscription, hint: undefined },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard/profils">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.hint}
              className={pathname.startsWith(link.href) ? "text-gold-strong" : "hover:text-foreground"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5 text-sm sm:gap-3">
          <StreakBadge streak={streak} isNewMilestone={streakMilestone} label={streak > 1 ? t.streakDays : t.streakDay} />
          {isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>{credits} {credits > 1 ? t.credits : t.credit}</Badge>}
          <span className="hidden max-w-[14ch] truncate text-muted 2xl:inline">{email}</span>
          <ThemeToggle />
          <LocaleToggle locale={locale} />
          <button onClick={logout} className="whitespace-nowrap text-muted hover:text-foreground">
            {t.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
