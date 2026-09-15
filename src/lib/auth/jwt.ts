import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  /** Horodatage d'émission du jeton (secondes epoch), posé par setIssuedAt() — sert à détecter un jeton émis avant un changement de mot de passe (voir getCurrentUserId). */
  iat?: number;
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

// `issuedAtSeconds` permet de forcer un `iat` précis plutôt que "maintenant"
// — utilisé quand on réémet un jeton juste après avoir posé
// passwordChangedAt, pour garantir qu'il tombe strictement après le seuil
// d'invalidation même si les deux opérations se produisent dans la même
// seconde (voir createSessionCookie et le commentaire dans getCurrentUserId).
export async function signSession(payload: SessionPayload, issuedAtSeconds?: number): Promise<string> {
  const iat = issuedAtSeconds ?? Math.floor(Date.now() / 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(iat + SESSION_DURATION_SECONDS)
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
