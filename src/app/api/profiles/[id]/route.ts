import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { createRateLimiter } from "@/lib/rate-limit";
import { profileInputSchema } from "@/lib/validation/profile";
import { invalidateDeepSynthesisForProfile } from "@/lib/ai/deep-synthesis-cache";

const shareSchema = z.object({ shareWithFriends: z.boolean() });

// Même raisonnement que createProfileLimiter (POST /api/profiles) : une
// modification de profil n'a normalement jamais besoin d'être répétée aussi
// vite, même par un compte Premium.
const updateProfileLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId, archivedAt: null } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId, archivedAt: null } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  await prisma.profile.update({ where: { id }, data: { shareWithFriends: parsed.data.shareWithFriends } });
  return NextResponse.json({ ok: true });
}

// Modification complète des informations de naissance d'un profil existant
// (date, heure, lieu, fuseau, nom, "c'est moi") — jusqu'ici la seule façon de
// corriger une heure de naissance saisie approximativement était de
// supprimer le profil et d'en recréer un, perdant au passage son historique
// (check-ins de transits, avatar personnalisé, partage avec des amis).
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId, archivedAt: null } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  if (updateProfileLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
  }

  const data = parsed.data;
  const birthTime = data.timeUnknown ? null : (data.birthTime ?? null);

  // Un thème profond déjà généré par IA (voir deep-synthesis-cache.ts) décrit
  // la naissance qu'il avait au moment de sa génération : il faut le purger
  // dès que l'un des champs qui changent réellement le calcul du thème
  // bouge, pas seulement le nom affiché ou "c'est moi".
  const birthRelevantChanged =
    profile.birthDate !== data.birthDate ||
    profile.birthTime !== birthTime ||
    profile.timeUnknown !== data.timeUnknown ||
    profile.latitude !== data.latitude ||
    profile.longitude !== data.longitude ||
    profile.tzName !== data.tzName;

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      label: data.label,
      isSelf: data.isSelf,
      birthDate: data.birthDate,
      birthTime,
      timeUnknown: data.timeUnknown,
      locationName: data.locationName,
      latitude: data.latitude,
      longitude: data.longitude,
      tzName: data.tzName,
    },
  });

  if (birthRelevantChanged) {
    await invalidateDeepSynthesisForProfile(id);
  }

  return NextResponse.json({ profile: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const profile = await prisma.profile.findFirst({ where: { id, userId } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
