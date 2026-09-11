import { NextResponse } from "next/server";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeAspects } from "@/lib/astro/aspects";
import { composeChartHighlights } from "@/lib/astro/interpretations/chart-highlights";
import { PLANET_KEYS } from "@/lib/astro/types";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import { isNonexistentLocalTime } from "@/lib/astro/time";

// Même seuil que /api/public/astrocartography : un calcul de thème complet
// (éphémérides + maisons + aspects) coûte nettement plus qu'un simple
// géocodage, et il n'y a pas d'intérêt légitime à en refaire beaucoup dans
// une même session.
const publicChartLimiter = createRateLimiter({ max: 8, windowMs: 10 * 60_000 });

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear();

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

const WHEEL_KEYS = [...PLANET_KEYS, "fortune"] as const;

/**
 * Calcule un thème natal complet sans compte ni persistance — voir
 * NatalChartTeaserForm : la personne voit son thème (roue interactive,
 * Soleil/Lune/Ascendant, éléments dominants) avant qu'on lui demande quoi
 * que ce soit, et ne crée un compte que pour le sauvegarder. Contrairement à
 * /api/public/astrocartography, l'heure de naissance reste optionnelle ici :
 * un thème sans heure connue (pas d'Ascendant/maisons fiables) reste honnête
 * et utile, exactement comme pour un profil enregistré classique.
 */
export async function POST(request: Request) {
  if (publicChartLimiter.isLimited(clientIp(request))) {
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

  const { birthDate, birthTime, timeUnknown, latitude, longitude, tzName, locale } = (body ?? {}) as Record<string, unknown>;

  if (!isValidDate(birthDate)) {
    return NextResponse.json({ error: "Date de naissance requise." }, { status: 400 });
  }
  const year = Number(birthDate.slice(0, 4));
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return NextResponse.json({ error: "Date de naissance hors plage acceptée." }, { status: 400 });
  }
  const isTimeUnknown = timeUnknown === true;
  if (!isTimeUnknown && !isValidTime(birthTime)) {
    return NextResponse.json({ error: "Heure de naissance requise, ou cochez \"heure inconnue\"." }, { status: 400 });
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
  const time = isTimeUnknown ? null : (birthTime as string);
  if (time && isNonexistentLocalTime({ date: birthDate, time, tzName, latitude, longitude })) {
    return NextResponse.json(
      { error: "Cette heure n'existe pas à cet endroit ce jour-là (passage à l'heure d'été). Vérifiez l'heure de naissance." },
      { status: 400 }
    );
  }
  const chartLocale = locale === "en" ? "en" : "fr";

  try {
    const chart = computeNatalChart(
      { date: birthDate, time, tzName, latitude, longitude, timeUnknown: isTimeUnknown },
      "placidus"
    );

    const aspectKeys = chart.hasReliableHouses ? [...WHEEL_KEYS, "asc" as const] : [...PLANET_KEYS];
    const aspects = computeAspects(chart.points, aspectKeys);
    const chartHighlights = composeChartHighlights(chart, chartLocale);

    const wheelPoints = WHEEL_KEYS.filter((k) => chart.points[k]).map((k) => ({
      key: k,
      longitude: chart.points[k]!.longitude,
      house: chart.points[k]!.house,
    }));

    // Rien n'est persisté : calcul à la volée, jamais écrit en base — comme
    // /api/public/astrocartography, cet outil ne collecte aucune donnée de
    // naissance tant que la personne n'a pas choisi de créer un compte.
    return NextResponse.json({
      points: chart.points,
      hasReliableHouses: chart.hasReliableHouses,
      ascendant: chart.hasReliableHouses ? chart.houses.ascendant : 0,
      houseCusps: chart.hasReliableHouses ? chart.houses.cusps : Array.from({ length: 12 }, (_, i) => i * 30),
      wheelPoints,
      aspects,
      chartHighlights,
    });
  } catch (error) {
    console.error("Public natal chart error:", error);
    return NextResponse.json({ error: "Impossible de calculer ce thème." }, { status: 500 });
  }
}
