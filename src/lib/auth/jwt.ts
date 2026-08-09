import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  [key: string]: unknown;
}

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 jours

// Résolu paresseusement (pas au chargement du module) : `next build`
// importe les route handlers pour collecter leurs métadonnées sans jamais
// signer/vérifier de session, et ne doit donc pas échouer si la variable
// n'est pas encore présente à cette étape.
function getSecret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    // Le secret par défaut n'est acceptable que sur une vraie machine de dev
    // locale (NODE_ENV="development" explicite) — jamais en staging/preview/
    // test ni dans un environnement où NODE_ENV serait simplement absent ou
    // mal configuré. Un simple `NODE_ENV !== "production"` laissait passer
    // silencieusement ce secret public et codé en dur sur tout déploiement
    // dont NODE_ENV ne vaut pas exactement "production".
    if (process.env.NODE_ENV === "development") {
      return new TextEncoder().encode("dev-only-insecure-secret-astrologium");
    }
    throw new Error("AUTH_SECRET manquant : définissez une valeur secrète pour cet environnement.");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string") return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "astrologium_session";
export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
