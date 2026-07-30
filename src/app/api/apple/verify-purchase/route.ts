import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/session";
import { applyAppleTransaction, verifyAppleTransaction } from "@/lib/billing/apple";

const schema = z.object({ signedTransactionInfo: z.string().min(1) });

/**
 * Appelée par le pont natif StoreKit (voir ios/App/App/StoreKitPlugin.swift)
 * juste après qu'un achat Apple aboutit dans l'app, pendant que
 * l'utilisateur est connecté sur le site (la webview partage les cookies
 * de session). Vérifie la transaction auprès d'Apple avant de créditer quoi
 * que ce soit — ne jamais faire confiance à une valeur envoyée par le
 * client sans vérification serveur.
 */
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  try {
    const decoded = await verifyAppleTransaction(parsed.data.signedTransactionInfo);
    await applyAppleTransaction(decoded, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Vérification transaction Apple échouée:", error);
    return NextResponse.json({ error: "Transaction invalide" }, { status: 400 });
  }
}
