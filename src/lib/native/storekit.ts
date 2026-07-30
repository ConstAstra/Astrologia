"use client";

import { Capacitor, registerPlugin } from "@capacitor/core";

export interface StoreKitProduct {
  id: string;
  displayName: string;
  description: string;
  displayPrice: string;
  isSubscription: boolean;
}

interface PurchaseResult {
  productId: string;
  transactionId: string;
  signedTransactionInfo: string;
}

interface StoreKitPlugin {
  getProducts(options: { productIds: string[] }): Promise<{ products: StoreKitProduct[] }>;
  purchase(options: { productId: string }): Promise<PurchaseResult>;
  restorePurchases(): Promise<{ transactions: { productId: string; signedTransactionInfo: string }[] }>;
}

const StoreKit = registerPlugin<StoreKitPlugin>("StoreKit");

/** true uniquement dans la coque iOS (Capacitor) — false dans un navigateur classique. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

async function sendToServerForVerification(signedTransactionInfo: string) {
  const res = await fetch("/api/apple/verify-purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedTransactionInfo }),
  });
  if (!res.ok) {
    throw new Error("La vérification du paiement Apple a échoué côté serveur.");
  }
}

export async function purchaseAppleProduct(productId: string): Promise<void> {
  const result = await StoreKit.purchase({ productId });
  await sendToServerForVerification(result.signedTransactionInfo);
}

export async function restoreApplePurchases(): Promise<number> {
  const { transactions } = await StoreKit.restorePurchases();
  for (const t of transactions) {
    await sendToServerForVerification(t.signedTransactionInfo);
  }
  return transactions.length;
}

export async function fetchAppleProducts(productIds: string[]): Promise<StoreKitProduct[]> {
  const { products } = await StoreKit.getProducts({ productIds });
  return products;
}
