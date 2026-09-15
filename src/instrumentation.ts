import * as Sentry from "@sentry/nextjs";

// Convention Next.js : ce fichier est chargé une fois au démarrage du
// serveur, avant toute requête. On y charge la config Sentry propre au
// runtime réellement utilisé (Node.js pour les route handlers/pages
// serveur classiques, Edge pour proxy.ts et les routes déclarées en edge).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
