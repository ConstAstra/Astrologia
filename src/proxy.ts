import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/jwt";

const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Vérification "optimiste" (voir doc Next.js) : redirige rapidement les
 * visiteurs non connectés loin des pages protégées. La vérification
 * définitive (et les contrôles d'autorisation fins, ex. abonnement actif)
 * est refaite dans chaque route/API via `requireUserId()` — le Proxy ne
 * doit jamais être la seule barrière de sécurité.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = token ? await verifySession(token) : null;

  if (!payload) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
