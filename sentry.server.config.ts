import * as Sentry from "@sentry/nextjs";

// Sentry.init() avec dsn vide/absent est un no-op silencieux côté SDK — donc
// rien à faire de spécial en développement local ou tant que SENTRY_DSN
// n'est pas configuré, comme les autres intégrations optionnelles du projet
// (RESEND_API_KEY, ANTHROPIC_API_KEY...).
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Échantillonnage des traces de performance — 10% suffit pour repérer des
  // tendances (lenteurs récurrentes) sans faire exploser le volume/coût dès
  // les premiers utilisateurs.
  tracesSampleRate: 0.1,
});
