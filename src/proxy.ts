import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/jwt";
import { SITE_ACCESS_COOKIE, isSiteAccessGateEnabled, isValidSiteAccessCookie } from "@/lib/site-access";

const GATE_PATH = "/acces";
const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Deux vérifications indépendantes, dans cet ordre :
 * 1. Verrou d'accès au site entier (voir lib/site-access.ts) — actif
 *    seulement si SITE_PASSWORD est défini, pour ne jamais bloquer un
 *    visiteur avant le lancement public sans configuration explicite.
 * 2. Vérification "optimiste" (voir doc Next.js) de la session utilisateur
 *    pour les pages /dashboard — redirige rapidement les visiteurs non
 *    connectés. La vérification définitive (et les contrôles fins, ex.
 *    abonnement actif) est refaite dans chaque route/page via
 *    `requireUserId()` — le Proxy ne doit jamais être la seule barrière.
 */
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isSiteAccessGateEnabled() && pathname !== GATE_PATH) {
    const gateCookie = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
    if (!isValidSiteAccessCookie(gateCookie)) {
      const url = request.nextUrl.clone();
      url.pathname = GATE_PATH;
      url.search = "";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const payload = token ? await verifySession(token) : null;
    if (!payload) {
      const loginUrl = new URL("/connexion", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Ne s'applique qu'aux pages : les routes API ont déjà leur propre
// authentification (session JWT, jeton widget, signature Stripe,
// CRON_SECRET) et doivent rester joignables par des services externes
// (webhook Stripe, planificateur de cron, widget iOS) même quand le
// verrou du site est actif.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon.svg|sw.js).*)"],
};
