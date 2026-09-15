import * as Sentry from "@sentry/nextjs";

// Erreurs et perf côté navigateur (composants "use client", clics, formulaires).
// NEXT_PUBLIC_SENTRY_DSN est publique par nature (comme
// NEXT_PUBLIC_VAPID_PUBLIC_KEY) : elle identifie où envoyer les événements,
// elle n'autorise aucune lecture des données du projet Sentry.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

// Suivi des navigations App Router (requis par le SDK depuis qu'il ne
// s'appuie plus sur l'historique du navigateur pour ça).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
