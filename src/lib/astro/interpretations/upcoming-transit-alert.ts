import type { NatalChart } from "../types";
import { computeTransitAspects, type TransitAspect } from "../transits";
import { describeTransitAspect, type Locale } from "./compose";

// Points natals "personnels" au sens de cette alerte : ceux dont l'activation
// se ressent concrètement au quotidien (contrairement à un transit sur
// Jupiter ou le MC, plus diffus). L'Ascendant y figure car il conditionne la
// façon dont les événements se présentent extérieurement.
const PERSONAL_POINTS = new Set(["sun", "moon", "venus", "mars", "asc"]);

// Écart (en degrés) en-deçà duquel on considère l'aspect comme "sur le point
// de devenir exact" dans les jours qui viennent — assez serré pour ne
// signaler qu'un vrai pic, pas toute la fenêtre d'orbe du transit.
const NEAR_EXACT_THRESHOLD = 0.5;

// Nombre de jours à l'avance auquel ce cron tourne : prévenir "3 jours avant"
// suppose de calculer les transits sur la date cible (aujourd'hui + 3), pas
// sur aujourd'hui.
const DAYS_AHEAD = 3;

export interface UpcomingTransitAlert {
  aspect: TransitAspect;
  targetDate: Date;
  title: string;
  body: string;
}

const TITLE: Record<Locale, string> = {
  fr: "🌌 Un transit fort approche",
  en: "🌌 A strong transit is coming",
};

function daysFromNow(today: Date, days: number): Date {
  const target = new Date(today);
  target.setUTCDate(target.getUTCDate() + days);
  return target;
}

// Repère, pour un thème donné, si un aspect majeur touchant une planète
// personnelle natale va devenir exact dans DAYS_AHEAD jours. Conçu pour
// tourner une fois par jour (voir /api/cron/upcoming-transit-alert) : sans
// état "déjà notifié" en base, le seuil serré (NEAR_EXACT_THRESHOLD) suffit à
// éviter les doublons puisqu'un même aspect ne repasse sous ce seuil qu'une
// fois par cycle de transit.
export function findUpcomingTransitAlert(
  chart: NatalChart,
  today: Date = new Date(),
  locale: Locale = "fr"
): UpcomingTransitAlert | null {
  const targetDate = daysFromNow(today, DAYS_AHEAD);
  const transitAspects = computeTransitAspects(chart, targetDate);

  const candidate = transitAspects.find(
    (a) => a.major && PERSONAL_POINTS.has(a.natalPoint) && Math.abs(a.exact) < NEAR_EXACT_THRESHOLD
  );
  if (!candidate) return null;

  return {
    aspect: candidate,
    targetDate,
    title: TITLE[locale],
    body: describeTransitAspect(candidate, locale, true),
  };
}
