import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sendPushNotification, isGoneSubscriptionError } from "@/lib/push";

const TITLE: Record<"fr" | "en", string> = {
  fr: "🔥 Ta série est en jeu ce soir",
  en: "🔥 Your streak is on the line tonight",
};

function body(streak: number, locale: "fr" | "en"): string {
  if (locale === "en") {
    return `${streak} day${streak > 1 ? "s" : ""} in a row — check today's chart before midnight to keep it going.`;
  }
  return `${streak} jour${streak > 1 ? "s" : ""} d'affilée — consultez votre thème du jour avant minuit pour la garder.`;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export const runtime = "nodejs";

// Pendant du cron transit du jour (voir /api/cron/daily-transit-push), mais
// pour une préférence distincte : prévient les utilisateurs dont la série de
// connexions (src/lib/streak.ts) est sur le point de se rompre faute de
// visite aujourd'hui. Ciblage : currentStreak > 0 (rien à perdre sinon) et
// lastActiveDate !== aujourd'hui (déjà passés aujourd'hui = rien à envoyer).
async function runStreakReminder(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const today = todayUTC();

  const users = await prisma.user.findMany({
    where: {
      streakReminderOptIn: true,
      currentStreak: { gt: 0 },
      lastActiveDate: { not: today },
      pushSubscriptions: { some: {} },
    },
    include: {
      profiles: { where: { isSelf: true }, take: 1 },
      pushSubscriptions: true,
    },
  });

  let sent = 0;
  let skipped = 0;
  let pruned = 0;
  const errors: string[] = [];

  for (const user of users) {
    const profile = user.profiles[0];
    if (!profile) {
      skipped += 1;
      continue;
    }

    const locale: "fr" | "en" = user.locale === "en" ? "en" : "fr";

    for (const sub of user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: TITLE[locale],
          body: body(user.currentStreak, locale),
          url: `/dashboard/transits/${profile.id}`,
        });
        sent += 1;
      } catch (err) {
        if (isGoneSubscriptionError(err)) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          pruned += 1;
          continue;
        }
        errors.push(`${user.id}/${sub.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  return NextResponse.json({ sent, skipped, pruned, errors });
}

export async function GET(request: Request) {
  return runStreakReminder(request);
}

export async function POST(request: Request) {
  return runStreakReminder(request);
}
