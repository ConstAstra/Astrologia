import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { acceptFriendInvite } from "@/lib/friends";
import { createRateLimiter } from "@/lib/rate-limit";

const acceptLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

const REASON_STATUS: Record<"invalid" | "self", number> = { invalid: 404, self: 400 };
const REASON_MESSAGE: Record<"invalid" | "self", string> = {
  invalid: "Invitation invalide ou expirée.",
  self: "Vous ne pouvez pas vous ajouter vous-même en ami.",
};

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (acceptLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const { token } = await params;
  const result = await acceptFriendInvite(token, userId);
  if (!result.ok) {
    return NextResponse.json({ error: REASON_MESSAGE[result.reason] }, { status: REASON_STATUS[result.reason] });
  }

  return NextResponse.json({ ok: true });
}
