"use client";

import { useEffect, useState } from "react";
import { Card, Eyebrow } from "@/components/ui/Card";
import { GrimoireReveal } from "./GrimoireReveal";
import { GrimoireBookIntro } from "./GrimoireBookIntro";
import type { ChartDomains } from "@/lib/astro/interpretations/chart-domains";

type Locale = "fr" | "en";
type Phase = "pending" | "intro" | "reveal";

/**
 * Porte d'entrée du grimoire : la toute première fois qu'un utilisateur
 * consulte CETTE lecture précise (clé mémorisée en localStorage), la
 * couverture s'ouvre en 3D (voir GrimoireBookIntro). Ensuite, et dès la
 * deuxième visite, on retombe directement sur le grimoire habituel à
 * onglets (GrimoireReveal) : la cérémonie d'ouverture ne doit pas se
 * répéter à chaque consultation d'une fonctionnalité qu'on revisite souvent.
 *
 * L'état part de "pending" côté serveur ET lors du premier rendu client
 * (avant que l'effet n'ait pu lire le localStorage) pour ne jamais produire
 * un HTML différent de celui du serveur — une lecture de fenêtre/stockage
 * pendant le rendu lui-même provoquerait un mismatch d'hydratation.
 */
export function GrimoireOpeningReveal({
  storageKey,
  domains,
  title,
  subtitle,
  aspectsNote,
  locale = "fr",
}: {
  storageKey: string;
  domains: ChartDomains;
  title: string;
  subtitle: string;
  aspectsNote: string;
  locale?: Locale;
}) {
  const [phase, setPhase] = useState<Phase>("pending");

  useEffect(() => {
    let seen = true;
    try {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      seen = reducedMotion || Boolean(window.localStorage.getItem(storageKey));
    } catch {
      seen = true;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase(seen ? "reveal" : "intro");
  }, [storageKey]);

  function handleOpened() {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // Stockage indisponible (navigation privée...) : tant pis, l'ouverture rejouera la prochaine fois.
    }
    setPhase("reveal");
  }

  if (phase === "pending") {
    return (
      <Card className="overflow-hidden p-6">
        <Eyebrow>{title}</Eyebrow>
        <p className="mt-1 text-xs text-muted/70">{subtitle}</p>
      </Card>
    );
  }

  if (phase === "intro") {
    return <GrimoireBookIntro title={title} subtitle={subtitle} locale={locale} onOpened={handleOpened} />;
  }

  return <GrimoireReveal domains={domains} title={title} subtitle={subtitle} aspectsNote={aspectsNote} locale={locale} />;
}
