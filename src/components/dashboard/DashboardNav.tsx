"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/Card";

const LINKS = [
  { href: "/dashboard/profils", label: "Profils" },
  { href: "/dashboard/synastrie", label: "Synastrie" },
  { href: "/dashboard/composite", label: "Composite" },
  { href: "/dashboard/abonnement", label: "Abonnement" },
];

export function DashboardNav({
  email,
  credits,
  isPremium,
}: {
  email: string;
  credits: number;
  isPremium: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
          {LINKS.map((link) => (
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
          {isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>{credits} crédit{credits > 1 ? "s" : ""}</Badge>}
          <span className="hidden text-muted sm:inline">{email}</span>
          <button onClick={logout} className="text-muted hover:text-foreground">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
