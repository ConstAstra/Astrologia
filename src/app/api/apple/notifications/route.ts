import { NextResponse } from "next/server";
import { applyAppleTransaction, verifyAppleNotification, verifyAppleTransaction } from "@/lib/billing/apple";

/**
 * Webhook "App Store Server Notifications V2" — à configurer dans App Store
 * Connect (URL de production ET URL sandbox) pour que les renouvellements,
 * annulations et remboursements restent synchronisés même quand l'app n'est
 * pas ouverte.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const signedPayload = body?.signedPayload;
  if (typeof signedPayload !== "string") {
    return NextResponse.json({ error: "Payload manquant" }, { status: 400 });
  }

  try {
    const notification = await verifyAppleNotification(signedPayload);
    const signedTransactionInfo = notification.data?.signedTransactionInfo;
    if (signedTransactionInfo) {
      const decoded = await verifyAppleTransaction(signedTransactionInfo);
      await applyAppleTransaction(decoded);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Apple notification invalide:", error);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }
}
