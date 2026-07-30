// Grille tarifaire (web / Stripe). Montants en centimes d'euro.
// À ajuster librement depuis ce seul fichier — aucune configuration
// préalable dans le tableau de bord Stripe n'est nécessaire : les prix sont
// envoyés dynamiquement (`price_data`) à la création de la session.

export type SubscriptionPlanId = "monthly" | "annual";
export type CreditPackId = "pack_1" | "pack_5" | "pack_12";

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanId,
  { label: string; amountCents: number; interval: "month" | "year"; trialDays: number }
> = {
  monthly: { label: "Mensuel", amountCents: 999, interval: "month", trialDays: 7 },
  annual: { label: "Annuel", amountCents: 7900, interval: "year", trialDays: 7 },
};

export const CREDIT_PACKS: Record<CreditPackId, { label: string; credits: number; amountCents: number }> = {
  pack_1: { label: "1 déblocage", credits: 1, amountCents: 299 },
  pack_5: { label: "5 déblocages", credits: 5, amountCents: 999 },
  pack_12: { label: "12 déblocages", credits: 12, amountCents: 1999 },
};

export const CURRENCY = "eur";

// --- Apple (App Store Connect) --------------------------------------------
// Identifiants de produits à créer dans App Store Connect (Achats intégrés).
// Doivent correspondre exactement aux Product ID configurés côté Apple.
export type AppleProductMapping =
  | { kind: "subscription"; plan: SubscriptionPlanId }
  | { kind: "credits"; pack: CreditPackId; credits: number };

export const APPLE_PRODUCT_MAP: Record<string, AppleProductMapping> = {
  "com.astrologia.app.sub.monthly": { kind: "subscription", plan: "monthly" },
  "com.astrologia.app.sub.annual": { kind: "subscription", plan: "annual" },
  "com.astrologia.app.credits.1": { kind: "credits", pack: "pack_1", credits: 1 },
  "com.astrologia.app.credits.5": { kind: "credits", pack: "pack_5", credits: 5 },
  "com.astrologia.app.credits.12": { kind: "credits", pack: "pack_12", credits: 12 },
};

export function appleProductIdForPlan(plan: SubscriptionPlanId): string {
  return `com.astrologia.app.sub.${plan}`;
}

export function appleProductIdForPack(pack: CreditPackId): string {
  return `com.astrologia.app.credits.${CREDIT_PACKS[pack].credits}`;
}
