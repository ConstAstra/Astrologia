import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { canCreateProfile } from "@/lib/billing/entitlements";
import { createRateLimiter } from "@/lib/rate-limit";

// Défense en profondeur au-delà du quota gratuit (canCreateProfile) : un
// compte Premium n'a normalement jamais besoin de créer autant de profils
// en si peu de temps.
const createProfileLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

const schema = z.object({
  label: z.string().trim().min(1, "Nom requis").max(80),
  isSelf: z.boolean().optional().default(false),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Heure invalide")
    .nullable()
    .optional(),
  timeUnknown: z.boolean().optional().default(false),
  locationName: z.string().trim().min(1, "Lieu requis").max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  // Un fuseau non reconnu par l'ICU du runtime plantait plus loin, au calcul
  // du thème (birthInputToUtc dans lib/astro/time.ts lève une Error brute) :
  // autant le refuser ici avec un message clair plutôt que de laisser
  // remonter une 500 la première fois que ce profil sert à un calcul.
  tzName: z
    .string()
    .trim()
    .min(1, "Fuseau horaire requis")
    .refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), "Fuseau horaire invalide"),
});

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
  const parsed = schema.safeParse(body);
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

  return NextResponse.json({ profile });
}
