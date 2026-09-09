import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, signSession, verifySession } from "./jwt";

export async function createSessionCookie(userId: string) {
  const token = await signSession({ userId });
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;

  // Un JWT est valide de façon purement stateless jusqu'à son expiration
  // (30 jours) : sans ce contrôle, changer son mot de passe (ou le
  // réinitialiser suite à un vol) ne révoque aucun jeton déjà émis ailleurs.
  // On compare donc l'émission du jeton (`iat`, en secondes) au dernier
  // changement de mot de passe connu en base ; un jeton émis avant reste
  // volontairement valide (comparaison à la seconde près) pour ne pas
  // invalider la session tout juste recréée par change-password/reset-password.
  if (typeof payload.iat === "number") {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { passwordChangedAt: true },
    });
    if (!user) return null;
    if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      return null;
    }
  }

  return payload.userId;
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new AuthError("Non authentifié");
  return userId;
}

export class AuthError extends Error {}
