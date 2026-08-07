import { NextResponse } from "next/server";
import { computeNatalChart } from "@/lib/astro/chart";
import { computeBigThree, computeDominance } from "@/lib/astro/dominance";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

// Point d'entrée public le plus léger de l'app : calcule uniquement le Big
// 3 + l'élément dominant, sans astrocartographie ni maisons complètes —
// pensé pour être le premier "wahou" avant tout compte, en quelques
// secondes. Débit plus permissif que /api/public/astrocartography (calcul
// nettement moins coûteux).
const publicBigThreeLimiter = createRateLimiter({ max: 15, windowMs: 10 * 60_000 });

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear();

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

export async function POST(request: Request) {
  if (publicBigThreeLimiter.isLimited(clientIp(request))) {
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

  const { birthDate, birthTime, timeUnknown, latitude, longitude, tzName } = (body ?? {}) as Record<string, unknown>;

  if (!isValidDate(birthDate)) {
    return NextResponse.json({ error: "Date de naissance requise." }, { status: 400 });
  }
  const year = Number(birthDate.slice(0, 4));
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return NextResponse.json({ error: "Date de naissance hors plage acceptée." }, { status: 400 });
  }
  const knownTime = timeUnknown !== true;
  if (knownTime && !isValidTime(birthTime)) {
    return NextResponse.json({ error: "Heure de naissance invalide." }, { status: 400 });
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

  try {
    const chart = computeNatalChart(
      {
        date: birthDate,
        time: knownTime ? (birthTime as string) : null,
        tzName,
        latitude,
        longitude,
        timeUnknown: !knownTime,
      },
      "placidus"
    );
    const big3 = computeBigThree(chart.points, chart.hasReliableHouses);
    const dominance = computeDominance(chart.points, chart.hasReliableHouses);

    // Rien n'est persisté : calcul à la volée, jamais écrit en base.
    return NextResponse.json({ big3, dominantElement: dominance.dominantElements[0] ?? null });
  } catch (error) {
    console.error("Public big-three error:", error);
    return NextResponse.json({ error: "Impossible de calculer ce thème." }, { status: 500 });
  }
}
