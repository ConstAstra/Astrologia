import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { computeNatalChart } from "@/lib/astro/chart";
import { composeDailyHoroscope } from "@/lib/astro/interpretations/daily-horoscope";
import type { BirthInput } from "@/lib/astro/types";
import type { Locale } from "@/lib/astro/interpretations/compose";
import { sendPushNotification, isGoneSubscriptionError } from "@/lib/push";

const TITLE: Record<Locale, string> = {
  fr: "🔮 Votre transit du jour",
  en: "🔮 Your transit for today",
};

function chartInputFor(profile: {
  birthDate: string;
  birthTime: string | null;
  tzName: string;
  latitude: number;
  longitude: number;
  timeUnknown: boolean;
}): BirthInput {
  return {
    date: profile.birthDate,
    time: profile.birthTime,
    tzName: profile.tzName,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timeUnknown: profile.timeUnknown,
  };
}

export const runtime = "nodejs";

// Pendant du cron horoscope quotidien (voir /api/cron/daily-horoscope), mais
// pour les utilisateurs abonnés à la notification push plutôt qu'à l'e-mail
// — les deux sont des préférences indépendantes, un utilisateur peut activer
// l'une, l'autre, les deux ou aucune. Réutilise le même contenu
// (composeDailyHoroscope) : titre = préfixe fixe, corps = la ligne de
// signature du jour, déjà pensée pour être courte.
async function runDailyTransitPush(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { dailyTransitPushOptIn: true, pushSubscriptions: { some: {} } },
    include: {
      profiles: { where: { isSelf: true }, take: 1 },
      pushSubscriptions: true,
    },
  });

  const now = new Date();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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

    const locale: Locale = user.locale === "en" ? "en" : "fr";
    const chart = computeNatalChart(chartInputFor(profile), "placidus");
    const horoscope = composeDailyHoroscope(chart, profile.label, now, locale);

    for (const sub of user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: TITLE[locale],
          body: horoscope.headline,
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

  return NextResponse.json({ sent, skipped, pruned, errors, siteUrl });
}

export async function GET(request: Request) {
  return runDailyTransitPush(request);
}

export async function POST(request: Request) {
  return runDailyTransitPush(request);
}
