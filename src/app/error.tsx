"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";

const TEXT = {
  fr: {
    eyebrow: "Éclipse imprévue",
    title: "Une erreur est survenue.",
    body: "Ce n'est pas votre thème qui a un problème, c'est nous : l'équipe (ou plutôt, la seule personne) derrière Astrologium en a été informée.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  en: {
    eyebrow: "Unexpected eclipse",
    title: "Something went wrong.",
    body: "It's not your chart that has a problem, it's us: the team (well, the one person) behind Astrologium has been notified.",
    retry: "Try again",
    home: "Back to home",
  },
};

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en") ? "en" : "fr";
  const t = TEXT[locale];
  const homeHref = locale === "en" ? "/en" : "/";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Link href={homeHref} className="mb-8">
        <Logo />
      </Link>
      <p className="text-xs uppercase tracking-[0.2em] text-terracotta">{t.eyebrow}</p>
      <h1 className="font-display mt-3 max-w-md text-2xl sm:text-3xl">{t.title}</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>{t.retry}</Button>
        <ButtonLink href={homeHref} variant="secondary">
          {t.home}
        </ButtonLink>
      </div>
    </main>
  );
}
