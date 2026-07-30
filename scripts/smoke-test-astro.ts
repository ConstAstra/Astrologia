import * as Astronomy from "astronomy-engine";
import { computeNatalChart } from "../src/lib/astro/chart";
import { computeAspects } from "../src/lib/astro/aspects";
import { computeSynastry } from "../src/lib/astro/synastry";
import { circularMidpoint, computeComposite } from "../src/lib/astro/composite";
import { computeAstrocartography } from "../src/lib/astro/astrocartography";
import { formatLongitude, signOf } from "../src/lib/astro/signs";
import { PLANET_KEYS } from "../src/lib/astro/types";
import {
  describeAspect,
  describeAstroCartoLine,
  describeHouseSystem,
  describePlanetInHouse,
  describePlanetInSign,
} from "../src/lib/astro/interpretations/compose";
import { METHODOLOGY } from "../src/lib/astro/interpretations/methodology";

function assertClose(label: string, val: number, expected: number, tol: number) {
  const diff = Math.abs(((val - expected + 540) % 360) - 180);
  const ok = diff <= tol;
  console.log(`${ok ? "OK " : "FAIL"} ${label}: got ${val.toFixed(3)}, expected ~${expected} (tol ${tol})`);
}

const eqMar = new Astronomy.AstroTime(new Date("2024-03-20T03:06:00Z"));
const solJun = new Astronomy.AstroTime(new Date("2024-06-20T20:51:00Z"));
const eqSep = new Astronomy.AstroTime(new Date("2024-09-22T12:44:00Z"));
const solDec = new Astronomy.AstroTime(new Date("2024-12-21T09:20:00Z"));

assertClose("Sun @ mar equinox", Astronomy.SunPosition(eqMar).elon, 0, 0.5);
assertClose("Sun @ jun solstice", Astronomy.SunPosition(solJun).elon, 90, 0.5);
assertClose("Sun @ sep equinox", Astronomy.SunPosition(eqSep).elon, 180, 0.5);
assertClose("Sun @ dec solstice", Astronomy.SunPosition(solDec).elon, 270, 0.5);

console.log("midpoint(10,20) =", circularMidpoint(10, 20), "expected 15");
console.log("midpoint(350,10) =", circularMidpoint(350, 10), "expected 0");

const chart = computeNatalChart(
  {
    date: "1990-06-15",
    time: "14:30",
    tzName: "Europe/Paris",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  "placidus"
);

console.log("\n--- Chart 1990-06-15 14:30 Paris ---");
console.log("UTC:", chart.utcIso, "obliquity:", chart.obliquity.toFixed(4), "RAMC:", chart.ramc.toFixed(3));
console.log("ASC:", formatLongitude(chart.houses.ascendant), signOf(chart.houses.ascendant));
console.log("MC :", formatLongitude(chart.houses.midheaven), signOf(chart.houses.midheaven));
console.log("House system fell back to whole sign?", chart.houses.fellBackToWholeSign ?? false);
console.log("Cusps:", chart.houses.cusps.map((c) => c.toFixed(2)).join(", "));

for (const key of [...PLANET_KEYS, "asc", "mc"] as const) {
  const p = chart.points[key as keyof typeof chart.points];
  if (!p) continue;
  console.log(
    `${key.padEnd(10)} ${formatLongitude(p.longitude).padEnd(8)} ${signOf(p.longitude).padEnd(10)} house=${p.house} speed=${p.speed?.toFixed(3) ?? "-"} retro=${p.retrograde ?? false}`
  );
}

let sum = 0;
for (let i = 0; i < 12; i++) {
  const a = chart.houses.cusps[i];
  const b = chart.houses.cusps[(i + 1) % 12];
  const span = (b - a + 360) % 360;
  sum += span;
}
console.log("Sum of house spans (expect 360):", sum.toFixed(4));
console.log("cusps[9] vs MC (expect equal):", chart.houses.cusps[9].toFixed(4), chart.houses.midheaven.toFixed(4));
console.log("cusps[0] vs ASC (expect equal):", chart.houses.cusps[0].toFixed(4), chart.houses.ascendant.toFixed(4));

const aspects = computeAspects(chart.points, [...PLANET_KEYS, "asc", "mc"]);
console.log("\nAspects found:", aspects.length);
for (const a of aspects.slice(0, 8)) {
  console.log(`${a.a} ${a.aspect} ${a.b} (orb ${a.exact.toFixed(2)}, applying=${a.applying})`);
}

const chartEq = computeNatalChart(
  { date: "2000-01-01", time: "00:00", tzName: "UTC", latitude: 0, longitude: 0 },
  "placidus"
);
console.log("\n--- Equator chart, fellback:", chartEq.houses.fellBackToWholeSign ?? false, "---");
console.log("cusps:", chartEq.houses.cusps.map((c) => c.toFixed(2)).join(", "));

const chartPolar = computeNatalChart(
  { date: "2000-06-21", time: "12:00", tzName: "UTC", latitude: 70, longitude: 0 },
  "placidus"
);
console.log("\n--- Polar chart (lat 70), fellback:", chartPolar.houses.fellBackToWholeSign ?? false, "---");

// --- Synastry ---
const chartB = computeNatalChart(
  { date: "1988-11-02", time: "08:15", tzName: "Europe/Paris", latitude: 45.75, longitude: 4.85 },
  "placidus"
);
const synastry = computeSynastry(chart, chartB);
console.log("\n--- Synastry ---");
console.log("Aspects:", synastry.aspects.length);
for (const a of synastry.aspects.slice(0, 5)) {
  console.log(`A.${a.personA} ${a.aspect} B.${a.personB} (exact ${a.exact.toFixed(2)})`);
}
console.log("B planets in A houses (sample):", synastry.bPlanetsInAHouses.slice(0, 3));

// --- Composite ---
const composite = computeComposite(chart, chartB);
console.log("\n--- Composite ---");
console.log("Composite ASC:", formatLongitude(composite.houses.ascendant), signOf(composite.houses.ascendant));
console.log("Composite Sun:", formatLongitude(composite.points.sun.longitude), signOf(composite.points.sun.longitude));

// --- Astrocartography ---
const lines = computeAstrocartography(chart);
console.log("\n--- Astrocartography ---");
console.log("Total lines:", lines.length);
const sunMc = lines.find((l) => l.planet === "sun" && l.type === "MC");
console.log("Sun MC longitude:", sunMc?.longitude?.toFixed(2));
const marsAc = lines.find((l) => l.planet === "mars" && l.type === "AC");
console.log("Mars AC path points:", marsAc?.path?.length, "sample:", marsAc?.path?.slice(0, 3));

// --- Interpretation content sanity ---
console.log("\n--- Interpretations ---");
console.log(describePlanetInSign("sun", signOf(chart.points.sun.longitude)));
console.log(describePlanetInHouse("moon", chart.points.moon.house ?? 1));
console.log(describeAspect(aspects[0]));
console.log(describeAstroCartoLine("venus", "AC"));
console.log(describeHouseSystem(chart.houses));
console.log("Methodology sections:", METHODOLOGY.length);
