import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/session";
import { archiveExcessProfiles, FREE_PROFILE_LIMIT, needsProfileSelection } from "@/lib/billing/entitlements";

const schema = z.object({
  keepProfileIds: z.array(z.string()).length(FREE_PROFILE_LIMIT),
});

// Résout la sélection obligatoire de profils déclenchée par la perte de
// l'abonnement Premium avec plus de profils actifs que la limite gratuite
// (voir needsProfileSelection dans entitlements.ts et la page
// /dashboard/profils/choisir). N'archive que si la sélection est encore
// réellement nécessaire, pour ne jamais agir sur un état déjà résolu
// entre-temps (ex. reprise d'abonnement pendant que l'écran était ouvert).
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (!(await needsProfileSelection(userId))) {
    return NextResponse.json({ ok: true, alreadyResolved: true });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
  }

  try {
    await archiveExcessProfiles(userId, parsed.data.keepProfileIds);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inattendue";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
