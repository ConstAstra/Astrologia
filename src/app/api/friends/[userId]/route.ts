import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { removeFriendship } from "@/lib/friends";
import { createRateLimiter } from "@/lib/rate-limit";

const removeLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

/** Retire une amitié — utilisable par les deux côtés, sans confirmation de l'autre (comme se désabonner). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (removeLimiter.isLimited(currentUserId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const { userId: friendUserId } = await params;
  await removeFriendship(currentUserId, friendUserId);

  return NextResponse.json({ ok: true });
}
