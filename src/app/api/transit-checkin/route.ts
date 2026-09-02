import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";

const REACTIONS = ["vrai", "partiellement", "pas_du_tout"] as const;

const checkInSchema = z.object({
  profileId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reaction: z.enum(REACTIONS),
});

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// Retour subjectif de l'utilisateur sur une lecture de transits passée
// ("cette journée-là, la lecture vous a semblé... confirmée / partielle /
// pas vraiment"). Upsert sur (profileId, date) : on corrige un avis en le
// réécrivant plutôt qu'en empilant plusieurs entrées pour le même jour.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { profileId, date, reaction } = parsed.data;

  // Une lecture ne peut être jugée qu'une fois vécue, jamais par anticipation.
  if (date > todayUTC()) {
    return NextResponse.json({ error: "Impossible pour une date future." }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: profileId, archivedAt: null }, select: { userId: true } });
  if (!profile || profile.userId !== userId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  await prisma.transitCheckIn.upsert({
    where: { profileId_date: { profileId, date } },
    create: { profileId, date, reaction },
    update: { reaction },
  });

  return NextResponse.json({ ok: true });
}
