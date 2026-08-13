import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Verrou d'accès au site entier, indépendant des comptes utilisateurs — un
// simple mot de passe partagé pour empêcher les visiteurs anonymes de voir
// le site avant le lancement commercial (SIRET manquant), en attendant
// mieux que la protection Vercel Authentication (qui ne semblait pas
// bloquer les visiteurs anonymes sur le domaine .vercel.app malgré son
// activation). Désactivé automatiquement si SITE_PASSWORD n'est pas défini,
// pour ne jamais bloquer le développement local par erreur.
export const SITE_ACCESS_COOKIE = "site_access";

export function isSiteAccessGateEnabled(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

/** Valeur de cookie attendue une fois le mot de passe validé — dérivée par HMAC plutôt que le mot de passe en clair, pour ne jamais l'exposer dans le navigateur. */
export function expectedSiteAccessCookieValue(): string | null {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("site-access-unlocked").digest("hex");
}

export function isValidSiteAccessCookie(cookieValue: string | undefined | null): boolean {
  const expected = expectedSiteAccessCookieValue();
  if (!expected || !cookieValue) return false;
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkSitePassword(candidate: string): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * À appeler depuis les route handlers /api/auth/* qui créent des comptes,
 * vérifient des identifiants, ou envoient un e-mail — ces routes n'ont pas
 * d'authentification propre (c'est tout leur rôle d'être accessibles avant
 * d'avoir un compte) et échappent au verrou du site via le Proxy, qui laisse
 * délibérément passer tout /api pour les webhooks/cron/widget externes (voir
 * proxy.ts). Sans ce contrôle explicite, n'importe qui peut appeler
 * /api/auth/register en direct sans jamais avoir vu la page /acces.
 */
export async function hasSiteAccess(): Promise<boolean> {
  if (!isSiteAccessGateEnabled()) return true;
  const store = await cookies();
  return isValidSiteAccessCookie(store.get(SITE_ACCESS_COOKIE)?.value);
}
