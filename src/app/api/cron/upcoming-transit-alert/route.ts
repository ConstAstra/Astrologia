import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { computeNatalChart } from "@/lib/astro/chart";
import { findUpcomingTransitAlert } from "@/lib/astro/interpretations/upcoming-transit-alert";
import type { BirthInput } from "@/lib/astro/types";
import type { Locale } from "@/lib/astro/interpretations/compose";
import { sendPushNotification, isGoneSubscriptionError } from "@/lib/push";

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

// Pendant des autres cron de notification push, pour la préférence
// upcomingTransitAlertOptIn : prévient 3 jours à l'avance qu'un aspect majeur
// va toucher une planète personnelle (voir upcoming-transit-alert.ts pour le
// détail du seuil). Sans thème natal fiable (heure inconnue → pas
// d'Ascendant), la détection reste possible sur les planètes ; c'est
// findUpcomingTransitAlert qui gère cette nuance via hasReliableHouses.
async function runUpcomingTransitAlert(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { upcomingTransitAlertOptIn: true, pushSubscriptions: { some: {} } },
    include: {
      profiles: { where: { isSelf: true }, take: 1 },
      pushSubscriptions: true,
    },
  });

  const today = new Date();

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
    const alert = findUpcomingTransitAlert(chart, today, locale);
    if (!alert) {
      skipped += 1;
      continue;
    }

    for (const sub of user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: alert.title,
          body: alert.body,
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
  return runUpcomingTransitAlert(request);
}

export async function POST(request: Request) {
  return runUpcomingTransitAlert(request);
}
