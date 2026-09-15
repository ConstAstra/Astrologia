"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ping anonyme "cette page a été chargée" pour le compteur de trafic admin
 * (voir /dashboard/admin). Côté client plutôt que côté serveur : une bonne
 * partie des pages publiques sont statiquement générées (SEO), donc un
 * compteur posé dans le rendu serveur ne verrait jamais les vrais visiteurs
 * après le build. Aucun cookie, aucun localStorage — un simple comptage
 * agrégé par jour, pas de suivi individuel.
 */
export function PageViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
