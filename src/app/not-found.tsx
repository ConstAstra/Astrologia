"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Twinkle } from "@/components/ui/Twinkle";

const TEXT = {
  fr: {
    eyebrow: "404",
    title: "Cette page a dérivé hors de l'orbite.",
    body: "Le lien est cassé ou la page n'existe plus. Le thème, lui, est toujours là.",
    home: "Retour à l'accueil",
    dashboard: "Aller à mon tableau de bord",
  },
  en: {
    eyebrow: "404",
    title: "This page drifted out of orbit.",
    body: "The link is broken or the page no longer exists. Your chart, on the other hand, is still right where you left it.",
    home: "Back to home",
    dashboard: "Go to my dashboard",
  },
};

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en") ? "en" : "fr";
  const t = TEXT[locale];
  const homeHref = locale === "en" ? "/en" : "/";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Link href={homeHref} className="mb-8">
        <Logo />
      </Link>
      <div className="relative">
        <Twinkle className="absolute -left-6 -top-3 h-3 w-3" />
        <Twinkle className="absolute -right-5 top-1 h-2 w-2" delay={700} />
        <p className="font-display text-7xl text-gold-strong/80">{t.eyebrow}</p>
      </div>
      <h1 className="font-display mt-4 max-w-md text-2xl sm:text-3xl">{t.title}</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={homeHref}>{t.home}</ButtonLink>
        <ButtonLink href="/dashboard" variant="secondary">
          {t.dashboard}
        </ButtonLink>
      </div>
    </main>
  );
}
