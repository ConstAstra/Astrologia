import * as Astronomy from "astronomy-engine";
import type { EclipticPoint, PlanetKey } from "./types";

const BODY_MAP: Record<
  Exclude<PlanetKey, "northNode">,
  Astronomy.Body
> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Différence angulaire signée la plus courte b-a, dans [-180, 180). */
export function angleDiff(a: number, b: number): number {
  let d = (b - a) % 360;
  if (d < -180) d += 360;
  if (d >= 180) d -= 360;
  return d;
}

/** Longitude/latitude écliptique géocentrique apparente "de la date" (tropicale). */
function eclipticOf(body: Astronomy.Body, time: Astronomy.AstroTime) {
  if (body === Astronomy.Body.Sun) {
    const s = Astronomy.SunPosition(time);
    return { longitude: normalizeDegrees(s.elon), latitude: s.elat };
  }
  const vec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(vec);
  return { longitude: normalizeDegrees(ecl.elon), latitude: ecl.elat };
}

/** Obliquité vraie de l'écliptique à la date donnée, en degrés. */
export function trueObliquity(time: Astronomy.AstroTime): number {
  return Astronomy.e_tilt(time).tobl;
}

/** Temps sidéral apparent de Greenwich, en degrés [0, 360). */
export function greenwichSiderealDegrees(time: Astronomy.AstroTime): number {
  return normalizeDegrees(Astronomy.SiderealTime(time) * 15);
}

/** RAMC (ascension droite du Milieu du Ciel) = temps sidéral local, en degrés. */
export function computeRamc(time: Astronomy.AstroTime, longitudeEast: number): number {
  return normalizeDegrees(greenwichSiderealDegrees(time) + longitudeEast);
}

/**
 * Nœud lunaire moyen (formule de Meeus, "Astronomical Algorithms" ch. 47).
 * On utilise le nœud moyen plutôt que le nœud vrai : c'est la convention la
 * plus répandue en astrologie occidentale, et elle évite les oscillations
 * à court terme du nœud vrai qui n'ont pas de sens interprétatif reconnu.
 */
export function meanLunarNode(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525;
  const omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;
  return normalizeDegrees(omega);
}

const SPEED_DELTA_DAYS = 0.5;

export function computePlanetPoint(
  key: Exclude<PlanetKey, "northNode">,
  time: Astronomy.AstroTime
): EclipticPoint {
  const body = BODY_MAP[key];
  const here = eclipticOf(body, time);

  const before = eclipticOf(body, new Astronomy.AstroTime(time.ut - SPEED_DELTA_DAYS));
  const after = eclipticOf(body, new Astronomy.AstroTime(time.ut + SPEED_DELTA_DAYS));
  const speed = angleDiff(before.longitude, after.longitude) / (2 * SPEED_DELTA_DAYS);

  return {
    key,
    longitude: here.longitude,
    latitude: here.latitude,
    speed,
    retrograde: speed < 0,
  };
}

export function computeNorthNodePoint(time: Astronomy.AstroTime): EclipticPoint {
  const longitude = meanLunarNode(time);
  // Le nœud moyen recule toujours (~ -0.053°/jour) : jamais "rétrograde" au
  // sens usuel, on ne calcule donc pas de vitesse instantanée ici.
  return { key: "northNode", longitude, latitude: 0, speed: -0.0529539, retrograde: true };
}

/**
 * Convertit des coordonnées écliptiques (longitude, latitude) en coordonnées
 * équatoriales (ascension droite, déclinaison), en tenant compte de la
 * latitude écliptique β — utile pour les planètes (Mercure et Mars peuvent
 * s'écarter de plusieurs degrés de l'écliptique), contrairement aux points
 * de maisons qui sont par définition sur l'écliptique (β=0).
 * Formules standards (Meeus, "Astronomical Algorithms", ch. 13).
 */
export function eclipticToEquatorial(
  lonDeg: number,
  latDeg: number,
  obliquityDeg: number
): { ra: number; dec: number } {
  const lon = lonDeg * (Math.PI / 180);
  const lat = latDeg * (Math.PI / 180);
  const eps = obliquityDeg * (Math.PI / 180);

  const sinDec = Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec))) * (180 / Math.PI);

  const y = Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps);
  const x = Math.cos(lon);
  const ra = normalizeDegrees(Math.atan2(y, x) * (180 / Math.PI));

  return { ra, dec };
}

export { Astronomy };
