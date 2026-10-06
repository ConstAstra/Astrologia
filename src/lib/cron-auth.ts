import { timingSafeEqual } from "crypto";

// Authentification partagée par les routes /api/cron/* : un secret partagé
// envoyé en en-tête `Authorization: Bearer $CRON_SECRET` par le scheduler
// externe (Vercel Cron, cron OS...). Comparaison en temps constant pour ne
// pas exposer d'oracle de timing sur le secret.
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
