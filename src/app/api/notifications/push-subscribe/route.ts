import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

// Enregistre un abonnement Web Push et active dailyTransitPushOptIn. Un
// même endpoint peut se réabonner (ex: permission redonnée après un refus) :
// upsert plutôt qu'un create qui échouerait sur la contrainte unique.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { endpoint, keys } = parsed.data;

  await prisma.$transaction([
    prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { userId, p256dh: keys.p256dh, auth: keys.auth },
    }),
    prisma.user.update({ where: { id: userId }, data: { dailyTransitPushOptIn: true } }),
  ]);

  return NextResponse.json({ ok: true });
}

// Supprime l'abonnement (désinstallation locale côté navigateur) et, s'il
// ne reste plus aucun abonnement pour ce compte, désactive la préférence.
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint: parsed.data.endpoint } });

  const remaining = await prisma.pushSubscription.count({ where: { userId } });
  if (remaining === 0) {
    await prisma.user.update({ where: { id: userId }, data: { dailyTransitPushOptIn: false } });
  }

  return NextResponse.json({ ok: true });
}
