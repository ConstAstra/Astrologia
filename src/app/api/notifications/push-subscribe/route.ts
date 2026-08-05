import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";

const FEATURES = ["dailyTransit", "streakReminder", "friendActivity"] as const;
type Feature = (typeof FEATURES)[number];

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  // Quelle préférence ce clic d'activation concerne — le même endpoint sert
  // les trois types de notification une fois créé, mais chaque toggle
  // n'active que sa propre préférence (consentement séparé par contenu).
  feature: z.enum(FEATURES).default("dailyTransit"),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
  feature: z.enum(FEATURES).default("dailyTransit"),
});

const OPT_IN_FIELD = {
  dailyTransit: "dailyTransitPushOptIn",
  streakReminder: "streakReminderOptIn",
  friendActivity: "friendActivityPushOptIn",
} as const satisfies Record<Feature, string>;

// Enregistre un abonnement Web Push et active la préférence correspondante.
// Un même endpoint peut se réabonner (ex: permission redonnée après un
// refus), ou être partagé par les trois préférences : upsert plutôt qu'un
// create qui échouerait sur la contrainte unique.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { endpoint, keys, feature } = parsed.data;

  await prisma.$transaction([
    prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { userId, p256dh: keys.p256dh, auth: keys.auth },
    }),
    prisma.user.update({ where: { id: userId }, data: { [OPT_IN_FIELD[feature]]: true } }),
  ]);

  return NextResponse.json({ ok: true });
}

// Désactive toujours la préférence appelante. Un même appareil ne peut
// détenir qu'un seul abonnement Push par service worker (contrainte du
// Push API), donc l'abonnement lui-même est partagé par les trois
// préférences : on ne le supprime que si TOUTES les autres préférences sont
// déjà désactivées — sinon ce serait couper silencieusement une
// notification encore active. Le client se base sur `subscriptionRemoved`
// pour décider s'il doit lui-même désabonner le navigateur (PushManager).
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { endpoint, feature } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyTransitPushOptIn: true, streakReminderOptIn: true, friendActivityPushOptIn: true },
  });
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const otherFeaturesOptedIn = FEATURES.filter((f) => f !== feature).some((f) => user[OPT_IN_FIELD[f]]);
  const subscriptionRemoved = !otherFeaturesOptedIn;

  if (subscriptionRemoved) {
    await prisma.$transaction([
      prisma.pushSubscription.deleteMany({ where: { userId, endpoint } }),
      prisma.user.update({
        where: { id: userId },
        data: { dailyTransitPushOptIn: false, streakReminderOptIn: false, friendActivityPushOptIn: false },
      }),
    ]);
  } else {
    await prisma.user.update({ where: { id: userId }, data: { [OPT_IN_FIELD[feature]]: false } });
  }

  return NextResponse.json({ ok: true, subscriptionRemoved });
}
