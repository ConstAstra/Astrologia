import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeComposite } from "@/lib/astro/composite";
import { composeDailyHoroscope } from "@/lib/astro/interpretations/daily-horoscope";
import { composeCompositeTransitSection, composeSynastryTransitSection } from "@/lib/astro/interpretations/synastry-transit";
import type { BirthInput } from "@/lib/astro/types";
import type { Locale } from "@/lib/astro/interpretations/compose";
import { sendEmail } from "@/lib/email";

const EMAIL_TEXT: Record<Locale, { viewTransits: string; footer: string; unsubscribe: string }> = {
  fr: {
    viewTransits: "Voir le détail des transits du jour",
    footer: "Vous recevez cet e-mail car vous êtes inscrit(e) sur Astrologium.",
    unsubscribe: "Se désabonner de l'horoscope quotidien",
  },
  en: {
    viewTransits: "See today's full transit details",
    footer: "You are receiving this email because you are registered on Astrologium.",
    unsubscribe: "Unsubscribe from the daily horoscope",
  },
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

// Déclenchée quotidiennement par un scheduler externe (Vercel Cron, cron OS,
// GitHub Actions…) — voir README ("Horoscope quotidien"). Vercel Cron envoie
// des requêtes GET avec l'en-tête `Authorization: Bearer $CRON_SECRET`, d'où
// la prise en charge de GET et POST.
async function runDailyHoroscope(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { dailyHoroscopeOptIn: true },
    include: { profiles: { where: { isSelf: true }, take: 1 } },
  });

  const now = new Date();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of users) {
    const profile = user.profiles[0];
    if (!profile) {
      skipped += 1;
      continue;
    }

    try {
      const locale: Locale = user.locale === "en" ? "en" : "fr";
      const t = EMAIL_TEXT[locale];
      const chart = computeNatalChart(chartInputFor(profile), "placidus");
      const horoscope = composeDailyHoroscope(chart, profile.label, now, locale);
      const unsubscribeUrl = `${siteUrl}/api/notifications/unsubscribe?token=${user.unsubscribeToken}`;

      // Paires "synastrie" et "composite" déverrouillées par cet utilisateur :
      // deux techniques distinctes, chacune réservée à la fonctionnalité
      // payante correspondante — on n'ajoute jamais l'une en bonus de
      // l'autre. Les deux sections possibles viennent enrichir le même
      // e-mail plutôt qu'un envoi séparé par couple.
      const relationshipUnlocks = await prisma.unlock.findMany({
        where: { userId: user.id, feature: { in: ["synastry", "composite"] }, secondaryProfileId: { not: null } },
        distinct: ["feature", "primaryProfileId", "secondaryProfileId"],
        include: { primaryProfile: true, secondaryProfile: true },
      });

      const relationshipSections = relationshipUnlocks
        .filter((u) => u.secondaryProfile)
        .map((u) => {
          const profileA = u.primaryProfile;
          const profileB = u.secondaryProfile!;
          const chartA = profileA.id === profile.id ? chart : computeNatalChart(chartInputFor(profileA), "placidus");
          const chartB = profileB.id === profile.id ? chart : computeNatalChart(chartInputFor(profileB), "placidus");

          if (u.feature === "composite") {
            const composite = computeComposite(chartA, chartB);
            return composeCompositeTransitSection(composite, profileA.label, profileB.label, now, locale);
          }
          return composeSynastryTransitSection(chartA, chartB, profileA.label, profileB.label, now, locale);
        });

      await sendEmail({
        to: user.email,
        subject: horoscope.subject,
        html: `
          ${horoscope.highlights
            .map((h) => `<p style="background:#fdf1e8;border-left:3px solid #e8935f;padding:8px 12px;"><strong>${h}</strong></p>`)
            .join("\n")}
          <p><strong>${horoscope.headline}</strong></p>
          ${horoscope.paragraphs.map((p) => `<p>${p}</p>`).join("\n")}
          <p><a href="${siteUrl}/dashboard/transits/${profile.id}">${t.viewTransits}</a></p>
          ${relationshipSections
            .map(
              (s) => `
            <hr/>
            <p><strong>${s.heading}</strong></p>
            <p>${s.paragraph}</p>
          `
            )
            .join("\n")}
          <hr/>
          <p style="font-size:12px;color:#888;">
            ${t.footer}
            <a href="${unsubscribeUrl}">${t.unsubscribe}</a>.
          </p>
        `,
      });
      sent += 1;
    } catch (err) {
      errors.push(`${user.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ sent, skipped, errors });
}

export async function GET(request: Request) {
  return runDailyHoroscope(request);
}

export async function POST(request: Request) {
  return runDailyHoroscope(request);
}
