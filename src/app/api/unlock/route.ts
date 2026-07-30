import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { PaywallError, canonicalPair, unlockFeature } from "@/lib/billing/entitlements";

const schema = z.object({
  feature: z.enum(["synastry", "composite", "astrocartography"]),
  profileIdA: z.string(),
  profileIdB: z.string().optional(),
});

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const { feature, profileIdA, profileIdB } = parsed.data;

  const ids = [profileIdA, profileIdB].filter(Boolean) as string[];
  const owned = await prisma.profile.count({ where: { id: { in: ids }, userId } });
  if (owned !== ids.length) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const [primaryProfileId, secondaryProfileId] = canonicalPair(profileIdA, profileIdB);

  try {
    const result = await unlockFeature(userId, { feature, primaryProfileId, secondaryProfileId });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PaywallError) {
      return NextResponse.json({ error: "Crédit insuffisant. Achetez un pack ou passez Premium." }, { status: 402 });
    }
    throw error;
  }
}
