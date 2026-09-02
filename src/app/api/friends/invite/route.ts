import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOrCreateFriendInvite } from "@/lib/friends";

// Récupère (ou crée) le lien d'invitation ami réutilisable de l'utilisateur.
export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const invite = await getOrCreateFriendInvite(userId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return NextResponse.json({ token: invite.token, url: `${siteUrl}/amis/${invite.token}` });
}
