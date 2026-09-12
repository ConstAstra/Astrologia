import webPush from "web-push";

// Abstraction d'envoi de notification Web Push (API standard du navigateur,
// PushManager — pas de dépendance à un service tiers type Firebase). En
// développement (ou si les clés VAPID ne sont pas configurées), on se
// contente de logguer dans la console, comme pour sendEmail().

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface SendPushInput {
  title: string;
  body: string;
  url: string;
}

let configured = false;

function ensureConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;

  if (!configured) {
    webPush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return true;
}

/**
 * Envoie une notification à un abonnement. Sur une erreur 404/410 (le
 * navigateur a lui-même invalidé l'abonnement — désinstallation, expiration),
 * l'erreur porte un `statusCode` : l'appelant doit alors supprimer
 * l'abonnement en base plutôt que de retenter.
 */
export async function sendPushNotification(sub: PushSubscriptionRecord, input: SendPushInput): Promise<void> {
  if (!ensureConfigured()) {
    if (process.env.NODE_ENV === "production") {
      // Ne pas logguer l'endpoint (identifiant unique de l'appareil de
      // l'utilisateur) en clair si les clés VAPID manquent en production.
      console.warn(`[push] Clés VAPID manquantes en production — notification "${input.title}" non envoyée.`);
      return;
    }
    console.log(`[push:dev] ${input.title} — ${input.body} (${input.url}) → ${sub.endpoint}`);
    return;
  }

  await webPush.sendNotification(
    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    JSON.stringify({ title: input.title, body: input.body, url: input.url })
  );
}

export function isGoneSubscriptionError(err: unknown): boolean {
  const statusCode = (err as { statusCode?: number } | null)?.statusCode;
  return statusCode === 404 || statusCode === 410;
}
