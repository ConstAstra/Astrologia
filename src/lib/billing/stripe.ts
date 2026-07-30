import Stripe from "stripe";

let client: Stripe | null = null;

/** Instancié paresseusement pour ne jamais faire planter le build si la clé n'est pas encore configurée. */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY manquant : ajoutez votre clé secrète Stripe dans .env pour activer les paiements."
      );
    }
    client = new Stripe(key);
  }
  return client;
}
