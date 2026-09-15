import * as Astronomy from "astronomy-engine";
import type { AsteroidKey, EclipticPoint, PlanetKey } from "./types";

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

// ---------------------------------------------------------------------------
// Astéroïdes : astronomy-engine ne couvre que le Soleil, la Lune et les 8
// planètes (pas de corps mineurs). Leur position est donc calculée ici par
// propagation képlérienne à deux corps à partir d'éléments orbitaux osculateurs
// (JPL Small-Body Database) plutôt que lue dans une éphéméride réelle.
//
// Limite à avoir en tête : ces éléments ne sont exacts qu'à leur date
// d'origine ; l'orbite réelle est perturbée par Jupiter notamment, donc plus
// une naissance est éloignée de cette date, plus l'écart théorique grandit
// (de l'ordre de quelques dixièmes de degré à quelques degrés selon l'écart
// en années). Suffisant pour situer le signe et, dans la plupart des cas, la
// maison ; pas une éphéméride de précision scientifique. Un futur passage
// pourra rafraîchir les éléments ou ajouter une correction séculaire si le
// besoin de précision augmente.
export interface KeplerianElements {
  /** Jour julien (TT) de l'époque des éléments osculateurs. */
  epochJd: number;
  /** Demi-grand axe, en unités astronomiques. */
  a: number;
  /** Excentricité. */
  e: number;
  /** Inclinaison sur l'écliptique J2000, en degrés. */
  i: number;
  /** Longitude du nœud ascendant (Ω), en degrés. */
  node: number;
  /** Argument du périhélie (ω), en degrés. */
  peri: number;
  /** Anomalie moyenne à l'époque (M₀), en degrés. */
  meanAnomalyAtEpoch: number;
}

// Éléments osculateurs de 3 Junon, JPL Small-Body Database, époque JD
// 2460200.5 (13 septembre 2023 TT), et de 2060 Chiron, époque JD 2459396.5
// (1er juillet 2021). Chiron est un centaure à l'orbite très excentrique
// (périhélie ~8,5 UA, à l'intérieur de celle de Saturne ; aphélie ~18,9 UA),
// ce qui le rend plus sensible aux perturbations de Saturne et d'Uranus que
// Junon : l'approximation à deux corps (voir note en tête de section) se
// dégrade donc un peu plus vite avec l'écart à l'époque de référence.
export const ASTEROID_ELEMENTS: Record<AsteroidKey, KeplerianElements> = {
  juno: {
    epochJd: 2460200.5,
    a: 2.669,
    e: 0.2562,
    i: 12.99,
    node: 169.84,
    peri: 247.74,
    meanAnomalyAtEpoch: 37.02,
  },
  chiron: {
    epochJd: 2459396.5,
    a: 13.70,
    e: 0.3772,
    i: 6.9299,
    node: 209.27,
    peri: 339.71,
    meanAnomalyAtEpoch: 180.70,
  },
};

const J2000_JD = 2451545.0;
const GAUSSIAN_DEG_PER_DAY = 0.9856076686; // k (constante gravitationnelle de Gauss), convertie en °/jour pour a=1 UA
const GENERAL_PRECESSION_DEG_PER_YEAR = 50.29 / 3600; // précession générale en longitude (IAU), correction J2000 -> écliptique de la date

/** Résout l'équation de Kepler M = E - e·sin(E) par Newton-Raphson (converge vite pour e < 0.9). */
function solveEccentricAnomaly(meanAnomalyRad: number, e: number): number {
  let E = meanAnomalyRad;
  for (let i = 0; i < 15; i++) {
    const delta = (E - e * Math.sin(E) - meanAnomalyRad) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return E;
}

/**
 * Position héliocentrique (écliptique J2000, UA) d'un corps à partir de ses
 * éléments képlériens osculateurs, par propagation à deux corps (pas de
 * perturbation par les autres planètes, voir la note en tête de section).
 */
function keplerianHeliocentricEcliptic(elements: KeplerianElements, time: Astronomy.AstroTime): { x: number; y: number; z: number } {
  const daysSinceEpoch = time.tt - (elements.epochJd - J2000_JD);
  const n = GAUSSIAN_DEG_PER_DAY / Math.pow(elements.a, 1.5); // mouvement moyen, °/jour (3e loi de Kepler)
  const M = normalizeDegrees(elements.meanAnomalyAtEpoch + n * daysSinceEpoch) * (Math.PI / 180);

  const E = solveEccentricAnomaly(M, elements.e);
  const xOrb = elements.a * (Math.cos(E) - elements.e);
  const yOrb = elements.a * Math.sqrt(1 - elements.e * elements.e) * Math.sin(E);

  const i = elements.i * (Math.PI / 180);
  const node = elements.node * (Math.PI / 180);
  const peri = elements.peri * (Math.PI / 180);
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosPeri = Math.cos(peri);
  const sinPeri = Math.sin(peri);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  return {
    x: xOrb * (cosNode * cosPeri - sinNode * sinPeri * cosI) - yOrb * (cosNode * sinPeri + sinNode * cosPeri * cosI),
    y: xOrb * (sinNode * cosPeri + cosNode * sinPeri * cosI) - yOrb * (sinNode * sinPeri - cosNode * cosPeri * cosI),
    z: xOrb * (sinPeri * sinI) + yOrb * (cosPeri * sinI),
  };
}

/** Longitude/latitude écliptique géocentrique d'un astéroïde à partir de ses éléments képlériens (voir note en tête de section). */
function asteroidEclipticOf(elements: KeplerianElements, time: Astronomy.AstroTime): { longitude: number; latitude: number } {
  const bodyHelio = keplerianHeliocentricEcliptic(elements, time);
  const earthHelioEqj = Astronomy.HelioVector(Astronomy.Body.Earth, time);
  const earthHelioEcl = Astronomy.RotateVector(Astronomy.Rotation_EQJ_ECL(), earthHelioEqj);

  const x = bodyHelio.x - earthHelioEcl.x;
  const y = bodyHelio.y - earthHelioEcl.y;
  const z = bodyHelio.z - earthHelioEcl.z;
  const r = Math.sqrt(x * x + y * y + z * z);

  const yearsSinceJ2000 = (time.tt - 0) / 365.25;
  const precession = GENERAL_PRECESSION_DEG_PER_YEAR * yearsSinceJ2000;
  const longitude = normalizeDegrees(Math.atan2(y, x) * (180 / Math.PI) + precession);
  const latitude = Math.asin(Math.max(-1, Math.min(1, z / r))) * (180 / Math.PI);

  return { longitude, latitude };
}

export function computeAsteroidPoint(key: AsteroidKey, time: Astronomy.AstroTime): EclipticPoint {
  const elements = ASTEROID_ELEMENTS[key];
  const here = asteroidEclipticOf(elements, time);

  const before = asteroidEclipticOf(elements, new Astronomy.AstroTime(time.ut - SPEED_DELTA_DAYS));
  const after = asteroidEclipticOf(elements, new Astronomy.AstroTime(time.ut + SPEED_DELTA_DAYS));
  const speed = angleDiff(before.longitude, after.longitude) / (2 * SPEED_DELTA_DAYS);

  return {
    key,
    longitude: here.longitude,
    latitude: here.latitude,
    speed,
    retrograde: speed < 0,
  };
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
