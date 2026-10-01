import { Astronomy, computePlanetPoint } from "./ephemeris";
import { computeNatalChart } from "./chart";
import type { BirthInput, NatalChart } from "./types";

function angularDiff(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function sunLongitudeAt(date: Date): number {
  return computePlanetPoint("sun", new Astronomy.AstroTime(date)).longitude;
}

/**
 * Trouve l'instant exact (UTC) où le Soleil en transit revient sur sa
 * longitude natale, pour l'anniversaire tombant dans `targetYear`. Recherche
 * par bissection sur une fenêtre de ±10 jours autour de la date anniversaire
 * (le Soleil avance d'environ 1°/jour et ne rétrograde jamais, donc la
 * fenêtre encadre toujours le passage une seule fois).
 */
export function findSolarReturnMoment(
  natalSunLongitude: number,
  targetYear: number,
  birthMonth: number,
  birthDay: number
): Date {
  let lo = new Date(Date.UTC(targetYear, birthMonth - 1, birthDay - 10));
  let hi = new Date(Date.UTC(targetYear, birthMonth - 1, birthDay + 10));

  const f = (d: Date) => angularDiff(sunLongitudeAt(d), natalSunLongitude);
  let flo = f(lo);

  for (let i = 0; i < 50; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const fm = f(mid);
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }
  return new Date((lo.getTime() + hi.getTime()) / 2);
}

export interface SolarReturnWindow {
  /** Année d'anniversaire à laquelle appartient le retour solaire actif (ex: 2026 pour l'anniversaire 2026). */
  year: number;
  start: Date;
  end: Date;
}

/**
 * Détermine quel "cycle" de révolution solaire est actif à l'instant `now` :
 * celui ouvert par le dernier retour exact (à ou juste avant aujourd'hui),
 * qui reste valide jusqu'au retour suivant, un an plus tard.
 */
export function computeActiveSolarReturnWindow(
  natalSunLongitude: number,
  birthMonth: number,
  birthDay: number,
  now: Date = new Date()
): SolarReturnWindow {
  const thisYearGuess = findSolarReturnMoment(natalSunLongitude, now.getUTCFullYear(), birthMonth, birthDay);
  const year = thisYearGuess.getTime() <= now.getTime() ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const start = findSolarReturnMoment(natalSunLongitude, year, birthMonth, birthDay);
  const end = findSolarReturnMoment(natalSunLongitude, year + 1, birthMonth, birthDay);
  return { year, start, end };
}

/**
 * Comme `computeActiveSolarReturnWindow`, mais pour une année d'anniversaire
 * choisie explicitement plutôt que "celle en cours" — utilisé par le
 * sélecteur d'année de la page révolution solaire, pour consulter aussi bien
 * une année passée qu'une année future.
 */
export function computeSolarReturnWindowForYear(
  natalSunLongitude: number,
  birthMonth: number,
  birthDay: number,
  year: number
): SolarReturnWindow {
  const start = findSolarReturnMoment(natalSunLongitude, year, birthMonth, birthDay);
  const end = findSolarReturnMoment(natalSunLongitude, year + 1, birthMonth, birthDay);
  return { year, start, end };
}

/**
 * Calcule le thème de révolution solaire : un thème "natal" recalculé pour
 * l'instant exact du retour, au lieu de naissance (simplification standard
 * en l'absence d'un lieu de résidence actuel connu — voir avertissement
 * affiché à l'utilisateur).
 */
export function computeSolarReturnChart(birthInput: BirthInput, returnMoment: Date): NatalChart {
  // On réutilise le fuseau et les coordonnées de naissance ; seule la date/heure change.
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: birthInput.tzName,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(returnMoment);
  const get = (type: string) => local.find((p) => p.type === type)?.value ?? "00";

  const returnInput: BirthInput = {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
    tzName: birthInput.tzName,
    latitude: birthInput.latitude,
    longitude: birthInput.longitude,
    timeUnknown: false,
  };

  return computeNatalChart(returnInput, "placidus");
}
