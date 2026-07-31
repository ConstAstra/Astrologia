import fs from "node:fs";
import path from "node:path";
import {
  AppStoreServerAPIClient,
  Environment,
  SignedDataVerifier,
  type JWSTransactionDecodedPayload,
  type ResponseBodyV2DecodedPayload,
} from "@apple/app-store-server-library";

/**
 * Intégration Apple App Store (achats intégrés iOS). Utilise la bibliothèque
 * officielle Apple plutôt qu'une vérification JWS "maison" — la validation
 * de signature de paiements ne doit jamais être réinventée.
 *
 * Config requise (voir .env.example) :
 * - APPLE_BUNDLE_ID : identifiant de bundle de l'app iOS
 * - APPLE_ENVIRONMENT : "Sandbox" ou "Production"
 * - APPLE_ROOT_CERTS_DIR : dossier contenant les certificats racine Apple
 *   (.cer, encodage DER) téléchargés depuis
 *   https://www.apple.com/certificateauthority/ — nécessaires pour vérifier
 *   la chaîne de confiance des reçus. Non fournis avec le code : à
 *   télécharger et déposer par vous-même (fichiers binaires, non générables
 *   ici).
 * - APPLE_KEY_ID / APPLE_ISSUER_ID / APPLE_PRIVATE_KEY : pour appeler
 *   l'App Store Server API (clé générée dans App Store Connect > Users and
 *   Access > Integrations).
 */

function getEnvironment(): Environment {
  return process.env.APPLE_ENVIRONMENT === "Production" ? Environment.PRODUCTION : Environment.SANDBOX;
}

function loadRootCertificates(): Buffer[] {
  const dir = process.env.APPLE_ROOT_CERTS_DIR;
  if (!dir || !fs.existsSync(dir)) {
    throw new Error(
      "APPLE_ROOT_CERTS_DIR manquant ou introuvable : téléchargez les certificats racine Apple " +
        "(https://www.apple.com/certificateauthority/) et placez-les dans ce dossier."
    );
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".cer"))
    .map((f) => fs.readFileSync(path.join(dir, f)));
}

let verifier: SignedDataVerifier | null = null;

export function getAppleVerifier(): SignedDataVerifier {
  if (!verifier) {
    const bundleId = process.env.APPLE_BUNDLE_ID;
    if (!bundleId) throw new Error("APPLE_BUNDLE_ID manquant.");
    verifier = new SignedDataVerifier(loadRootCertificates(), true, getEnvironment(), bundleId);
  }
  return verifier;
}

let apiClient: AppStoreServerAPIClient | null = null;

/** Client pour appeler l'App Store Server API (ex: relire l'historique des transactions). */
export function getAppleApiClient(): AppStoreServerAPIClient {
  if (!apiClient) {
    const { APPLE_PRIVATE_KEY, APPLE_KEY_ID, APPLE_ISSUER_ID, APPLE_BUNDLE_ID } = process.env;
    if (!APPLE_PRIVATE_KEY || !APPLE_KEY_ID || !APPLE_ISSUER_ID || !APPLE_BUNDLE_ID) {
      throw new Error("Configuration Apple API incomplète (clé, keyId, issuerId ou bundleId manquant).");
    }
    apiClient = new AppStoreServerAPIClient(
      APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      APPLE_KEY_ID,
      APPLE_ISSUER_ID,
      APPLE_BUNDLE_ID,
      getEnvironment()
    );
  }
  return apiClient;
}

export async function verifyAppleNotification(signedPayload: string): Promise<ResponseBodyV2DecodedPayload> {
  return getAppleVerifier().verifyAndDecodeNotification(signedPayload);
}

export async function verifyAppleTransaction(signedTransactionInfo: string): Promise<JWSTransactionDecodedPayload> {
  return getAppleVerifier().verifyAndDecodeTransaction(signedTransactionInfo);
}

import { prisma } from "@/lib/db";
import { APPLE_PRODUCT_MAP } from "./plans";
import { grantReferralRewardOnce } from "./entitlements";

/**
 * Applique une transaction Apple vérifiée à un utilisateur : abonnement ou
 * crédits selon le Product ID. `userId` n'est nécessaire que pour la toute
 * première liaison (achat initial, utilisateur connecté) ; les événements
 * suivants (renouvellement, etc.) retrouvent l'utilisateur via
 * `appleOriginalTransactionId`.
 */
export async function applyAppleTransaction(decoded: JWSTransactionDecodedPayload, userId?: string) {
  const productId = decoded.productId;
  const originalTransactionId = decoded.originalTransactionId;
  const transactionId = decoded.transactionId;
  if (!productId || !originalTransactionId || !transactionId) return;

  const mapping = APPLE_PRODUCT_MAP[productId];
  if (!mapping) {
    console.error("Apple: Product ID inconnu", productId);
    return;
  }

  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findUnique({ where: { appleOriginalTransactionId: originalTransactionId } });

  if (!user) {
    console.error("Apple: utilisateur introuvable pour la transaction", originalTransactionId);
    return;
  }

  if (mapping.kind === "subscription") {
    const revoked = Boolean(decoded.revocationDate);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        appleOriginalTransactionId: originalTransactionId,
        entitlementSource: "apple",
        subscriptionPlan: mapping.plan,
        subscriptionStatus: revoked ? "canceled" : "active",
        currentPeriodEnd: decoded.expiresDate ? new Date(decoded.expiresDate) : null,
      },
    });
    // Comme côté Stripe, le parrainage n'est récompensé qu'au premier
    // paiement réel — jamais sur une révocation/remboursement.
    if (!revoked) await grantReferralRewardOnce(user.id);
    return;
  }

  // Achat consommable (pack de crédits) : idempotent via transactionId.
  const existing = await prisma.creditGrant.findUnique({ where: { externalId: transactionId } });
  if (existing) return;

  await prisma.$transaction([
    prisma.creditGrant.create({
      data: {
        userId: user.id,
        source: "apple",
        externalId: transactionId,
        creditsAdded: mapping.credits,
        amountCents: decoded.price ? Math.round(decoded.price / 10) : null, // price est en milliunités
        currency: decoded.currency ?? null,
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { credits: { increment: mapping.credits } } }),
  ]);
  await grantReferralRewardOnce(user.id);
}
