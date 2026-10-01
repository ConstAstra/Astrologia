import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { canCreateProfile } from "@/lib/billing/entitlements";
import { createRateLimiter } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";
import { profileInputSchema } from "@/lib/validation/profile";

// Défense en profondeur au-delà du quota gratuit (canCreateProfile) : un
// compte Premium n'a normalement jamais besoin de créer autant de profils
// en si peu de temps.
const createProfileLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const profiles = await prisma.profile.findMany({
    where: { userId, archivedAt: null },
    orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (createProfileLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  if (!(await canCreateProfile(userId))) {
    return NextResponse.json(
      { error: "Limite de profils atteinte sur l'offre gratuite. Passez Premium pour en ajouter davantage." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
  }

  const data = parsed.data;
  const profile = await prisma.profile.create({
    data: {
      userId,
      label: data.label,
      isSelf: data.isSelf,
      birthDate: data.birthDate,
      birthTime: data.timeUnknown ? null : (data.birthTime ?? null),
      timeUnknown: data.timeUnknown,
      locationName: data.locationName,
      latitude: data.latitude,
      longitude: data.longitude,
      tzName: data.tzName,
    },
  });
  await trackEvent("profile_created", userId, { isSelf: data.isSelf });

  return NextResponse.json({ profile });
}
