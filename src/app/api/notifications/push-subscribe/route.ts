import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { createRateLimiter } from "@/lib/rate-limit";

const pushSubscribeLimiter = createRateLimiter({ max: 20, windowMs: 5 * 60_000 });

const FEATURES = ["dailyTransit", "streakReminder", "friendActivity", "upcomingTransitAlert"] as const;
type Feature = (typeof FEATURES)[number];

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  // Quelle préférence ce clic d'activation concerne — le même endpoint sert
  // les quatre types de notification une fois créé, mais chaque toggle
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
  upcomingTransitAlert: "upcomingTransitAlertOptIn",
} as const satisfies Record<Feature, string>;

const ALL_OPT_IN_FALSE = {
  dailyTransitPushOptIn: false,
  streakReminderOptIn: false,
  friendActivityPushOptIn: false,
  upcomingTransitAlertOptIn: false,
} as const;

// Enregistre un abonnement Web Push et active la préférence correspondante.
// Un même endpoint peut se réabonner (ex: permission redonnée après un
// refus), ou être partagé par les quatre préférences : upsert plutôt qu'un
// create qui échouerait sur la contrainte unique.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (pushSubscribeLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { endpoint, keys, feature } = parsed.data;

  // Un endpoint Push est en pratique unique par navigateur/appareil : le
  // navigateur en émet un nouveau à chaque (ré)abonnement. Le voir associé à
  // un AUTRE compte que l'appelant n'arrive donc jamais en usage normal —
  // on refuse la réassignation silencieuse plutôt que d'écraser le
  // propriétaire existant (voir aussi le commentaire sur l'upsert).
  const existing = await prisma.pushSubscription.findUnique({ where: { endpoint }, select: { userId: true } });
  if (existing && existing.userId !== userId) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { p256dh: keys.p256dh, auth: keys.auth },
    }),
    prisma.user.update({ where: { id: userId }, data: { [OPT_IN_FIELD[feature]]: true } }),
  ]);

  return NextResponse.json({ ok: true });
}

// Désactive toujours la préférence appelante. Un même appareil ne peut
// détenir qu'un seul abonnement Push par service worker (contrainte du
// Push API), donc l'abonnement lui-même est partagé par les quatre
// préférences : on ne le supprime que si TOUTES les autres préférences sont
// déjà désactivées — sinon ce serait couper silencieusement une
// notification encore active. Le client se base sur `subscriptionRemoved`
// pour décider s'il doit lui-même désabonner le navigateur (PushManager).
export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (pushSubscribeLimiter.isLimited(userId)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { endpoint, feature } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dailyTransitPushOptIn: true,
      streakReminderOptIn: true,
      friendActivityPushOptIn: true,
      upcomingTransitAlertOptIn: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const otherFeaturesOptedIn = FEATURES.filter((f) => f !== feature).some((f) => user[OPT_IN_FIELD[f]]);
  const subscriptionRemoved = !otherFeaturesOptedIn;

  if (subscriptionRemoved) {
    await prisma.$transaction([
      prisma.pushSubscription.deleteMany({ where: { userId, endpoint } }),
      prisma.user.update({ where: { id: userId }, data: ALL_OPT_IN_FALSE }),
    ]);
  } else {
    await prisma.user.update({ where: { id: userId }, data: { [OPT_IN_FIELD[feature]]: false } });
  }

  return NextResponse.json({ ok: true, subscriptionRemoved });
}
