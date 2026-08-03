import { NextResponse } from "next/server";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAstrocartography } from "@/lib/astro/astrocartography";
import { computeCountryLineMatches } from "@/lib/astro/astrocartography-countries";
import { computeBigThree } from "@/lib/astro/dominance";
import { projectAstroCartoLines } from "@/components/map/ProjectedLine";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

// Calcul de thème + astrocartographie complet (éphémérides + maisons), bien
// plus coûteux qu'un simple géocodage : seuil nettement plus bas que
// /api/geocode, et sans intérêt légitime à en refaire beaucoup dans une même
// session (on ne recalcule pas son propre thème dix fois de suite).
const publicMapLimiter = createRateLimiter({ max: 8, windowMs: 10 * 60_000 });

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear();

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

export async function POST(request: Request) {
  if (publicMapLimiter.isLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Trop de calculs, merci de patienter quelques minutes." },
      { status: 429, headers: { "Retry-After": "300" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { birthDate, birthTime, latitude, longitude, tzName, locale } = (body ?? {}) as Record<string, unknown>;

  // L'astrocartographie repose entièrement sur l'heure exacte de naissance
  // (elle détermine l'Ascendant/Milieu du Ciel dont dépendent toutes les
  // lignes) — contrairement au thème natal seul, il n'existe pas de version
  // "heure inconnue" honnête de cet outil : on la refuse plutôt que de
  // produire une carte trompeuse.
  if (!isValidDate(birthDate) || !isValidTime(birthTime)) {
    return NextResponse.json({ error: "Date et heure de naissance requises (heure exacte)." }, { status: 400 });
  }
  const year = Number(birthDate.slice(0, 4));
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return NextResponse.json({ error: "Date de naissance hors plage acceptée." }, { status: 400 });
  }
  if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
    return NextResponse.json({ error: "Latitude invalide." }, { status: 400 });
  }
  if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Longitude invalide." }, { status: 400 });
  }
  if (typeof tzName !== "string" || !tzName.includes("/")) {
    return NextResponse.json({ error: "Fuseau horaire invalide." }, { status: 400 });
  }
  const mapLocale = locale === "en" ? "en" : "fr";

  try {
    const chart = computeNatalChart(
      { date: birthDate, time: birthTime, tzName, latitude, longitude, timeUnknown: false },
      "placidus"
    );
    const lines = computeAstrocartography(chart);
    const mapData = projectAstroCartoLines(lines, undefined, undefined, mapLocale);
    const countryMatches = computeCountryLineMatches(lines);
    const big3 = computeBigThree(chart.points, chart.hasReliableHouses);

    // Rien n'est persisté : calcul à la volée, jamais écrit en base — cet
    // outil public ne collecte aucune donnée de naissance.
    return NextResponse.json({ mapData, countryMatches, big3 });
  } catch (error) {
    console.error("Public astrocartography error:", error);
    return NextResponse.json({ error: "Impossible de calculer ce thème." }, { status: 500 });
  }
}
