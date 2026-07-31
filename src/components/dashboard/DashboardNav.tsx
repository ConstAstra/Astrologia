"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/Card";
import { LocaleToggle } from "./LocaleToggle";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { profiles: string; synastry: string; composite: string; subscription: string; credit: string; credits: string; logout: string }> = {
  fr: {
    profiles: "Profils",
    synastry: "Synastrie",
    composite: "Composite",
    subscription: "Abonnement",
    credit: "crédit",
    credits: "crédits",
    logout: "Déconnexion",
  },
  en: {
    profiles: "Profiles",
    synastry: "Synastry",
    composite: "Composite",
    subscription: "Subscription",
    credit: "credit",
    credits: "credits",
    logout: "Log out",
  },
};

export function DashboardNav({
  email,
  credits,
  isPremium,
  locale = "fr",
}: {
  email: string;
  credits: number;
  isPremium: boolean;
  locale?: Locale;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = TEXT[locale];

  const links = [
    { href: "/dashboard/profils", label: t.profiles },
    { href: "/dashboard/synastrie", label: t.synastry },
    { href: "/dashboard/composite", label: t.composite },
    { href: "/dashboard/abonnement", label: t.subscription },
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
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "text-gold-strong" : "hover:text-foreground"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>{credits} {credits > 1 ? t.credits : t.credit}</Badge>}
          <span className="hidden text-muted sm:inline">{email}</span>
          <LocaleToggle locale={locale} />
          <button onClick={logout} className="text-muted hover:text-foreground">
            {t.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
