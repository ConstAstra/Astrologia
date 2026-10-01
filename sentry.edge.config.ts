import * as Sentry from "@sentry/nextjs";

// Runtime Edge (proxy.ts, routes déclarées `export const runtime = "edge"`) —
// même configuration que sentry.server.config.ts, séparée uniquement parce
// que Next.js exige deux fichiers distincts par runtime.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
