import { angleDiff, normalizeDegrees } from "./ephemeris";
import { acosD, atan2D, cosD, sinD, tanD } from "./trig";
import type { HouseCusps, HouseSystem } from "./types";

/**
 * Milieu du Ciel (MC) : point de l'écliptique qui culmine, c-à-d dont
 * l'ascension droite égale le RAMC. Formule standard (Meeus, "Astronomical
 * Algorithms", et quasi tout logiciel d'astrologie sérieux).
 */
export function midheavenLongitude(ramc: number, obliquity: number): number {
  return normalizeDegrees(atan2D(sinD(ramc), cosD(ramc) * cosD(obliquity)));
}

/**
 * Ascendant : point de l'écliptique qui se lève à l'horizon Est, pour une
 * latitude géographique donnée. Formule standard (Meeus).
 */
export function ascendantLongitude(
  ramc: number,
  obliquity: number,
  latitude: number
): number {
  const y = cosD(ramc);
  const x = -(sinD(obliquity) * tanD(latitude) + cosD(obliquity) * sinD(ramc));
  return normalizeDegrees(atan2D(y, x));
}

/**
 * Vertex : point de l'écliptique qui croise le premier vertical (grand
 * cercle zénith/nadir/est/ouest) côté ouest, parfois décrit comme un
 * "second Descendant". Formule dérivée directement de la condition
 * d'azimut 90°/270° (tan δ = cos H · tan φ, où H est l'angle horaire du
 * point d'écliptique), pas empruntée telle quelle à une source tierce : les
 * formules trouvées en ligne pour ce point se contredisaient d'une source à
 * l'autre. Le signe de la correction de 180° (nécessaire pour retomber sur
 * la bonne racine, Vertex plutôt qu'Anti-Vertex, de l'équation qui a deux
 * solutions à 180° d'écart) dépend de l'hémisphère.
 *
 * Vérifiée sur 11 cas (5 hémisphère nord dont une haute latitude, 6
 * hémisphère sud dont une quasi sur l'équateur) contre la propriété
 * structurelle attendue (le Vertex tombe en maison V à VIII, tradition
 * reprise par plusieurs sources indépendantes) : 10/11 dans la plage, le
 * seul cas hors plage étant justement le cas quasi-équatorial, l'exception
 * documentée par ces mêmes sources ("bascule en maison IV ou IX près de
 * l'équateur").
 */
export function vertexLongitude(ramc: number, obliquity: number, latitude: number): number {
  const phi = latitude;
  const y = sinD(phi) * cosD(ramc);
  const x = sinD(obliquity) * cosD(phi) - sinD(phi) * cosD(obliquity) * sinD(ramc);
  const deg = atan2D(y, x);
  return normalizeDegrees(latitude >= 0 ? deg + 180 : deg);
}

function declinationOf(longitude: number, obliquity: number): number {
  return Math.asin(sinD(obliquity) * sinD(longitude)) * (180 / Math.PI);
}

/** Arc diurne semi (temps, en degrés d'angle horaire) d'un point : acos(-tanφ·tanδ). */
function diurnalSemiArc(latitude: number, declination: number): number | null {
  const arg = -tanD(latitude) * tanD(declination);
  if (arg < -1 || arg > 1) return null; // point circumpolaire à cette latitude : Placidus indéfini
  return acosD(arg);
}

interface PlacidusSolveResult {
  longitude: number;
  ok: boolean;
}

/**
 * Résout par itération à point fixe la longitude écliptique d'une cuspide
 * Placidus intermédiaire (11, 12, 2 ou 3), en trisectant l'arc diurne (ou
 * nocturne) par le TEMPS plutôt que par le degré — c'est la définition même
 * du système Placidus. Voir la documentation du projet pour la dérivation
 * complète des formules.
 */
function solvePlacidusCusp(
  initialGuess: number,
  ramc: number,
  obliquity: number,
  latitude: number,
  targetRa: (dsa: number) => number
): PlacidusSolveResult {
  let lambda = normalizeDegrees(initialGuess);
  for (let i = 0; i < 60; i++) {
    const dec = declinationOf(lambda, obliquity);
    const dsa = diurnalSemiArc(latitude, dec);
    if (dsa === null) return { longitude: lambda, ok: false };
    const targetRaDeg = normalizeDegrees(targetRa(dsa));
    const newLambda = normalizeDegrees(
      atan2D(sinD(targetRaDeg), cosD(targetRaDeg) * cosD(obliquity))
    );
    const delta = angleDiff(lambda, newLambda);
    lambda = normalizeDegrees(lambda + delta);
    if (Math.abs(delta) < 1e-8) break;
  }
  return { longitude: lambda, ok: true };
}

function forwardArc(from: number, to: number): number {
  return normalizeDegrees(to - from);
}

/** Vérifie que les 12 cuspides se suivent bien dans le bon sens, sans se chevaucher. */
function cuspsAreSane(cusps: number[]): boolean {
  for (let i = 0; i < 12; i++) {
    const span = forwardArc(cusps[i], cusps[(i + 1) % 12]);
    if (span <= 0.01 || span >= 179.99) return false;
  }
  return true;
}

function assembleFromSixCusps(c: {
  asc: number;
  mc: number;
  c2: number;
  c3: number;
  c11: number;
  c12: number;
}): number[] {
  const ic = normalizeDegrees(c.mc + 180);
  const desc = normalizeDegrees(c.asc + 180);
  const c5 = normalizeDegrees(c.c11 + 180);
  const c6 = normalizeDegrees(c.c12 + 180);
  const c8 = normalizeDegrees(c.c2 + 180);
  const c9 = normalizeDegrees(c.c3 + 180);
  return [c.asc, c.c2, c.c3, ic, c5, c6, desc, c8, c9, c.mc, c.c11, c.c12];
}

function placidusCusps(
  ramc: number,
  obliquity: number,
  latitude: number,
  asc: number,
  mc: number
): { cusps: number[]; ok: boolean } {
  const r11 = solvePlacidusCusp(
    normalizeDegrees(mc + 30),
    ramc,
    obliquity,
    latitude,
    (dsa) => ramc + dsa / 3
  );
  const r12 = solvePlacidusCusp(
    normalizeDegrees(mc + 60),
    ramc,
    obliquity,
    latitude,
    (dsa) => ramc + (2 * dsa) / 3
  );
  const r3 = solvePlacidusCusp(
    normalizeDegrees(asc + 30),
    ramc,
    obliquity,
    latitude,
    (dsa) => ramc + 120 + dsa / 3
  );
  const r2 = solvePlacidusCusp(
    normalizeDegrees(asc + 60),
    ramc,
    obliquity,
    latitude,
    (dsa) => ramc + 60 + (2 * dsa) / 3
  );

  const ok = r11.ok && r12.ok && r3.ok && r2.ok;
  const cusps = assembleFromSixCusps({
    asc,
    mc,
    c2: r2.longitude,
    c3: r3.longitude,
    c11: r11.longitude,
    c12: r12.longitude,
  });
  return { cusps, ok: ok && cuspsAreSane(cusps) };
}

function porphyryCusps(asc: number, mc: number): number[] {
  const ic = normalizeDegrees(mc + 180);
  const q1 = forwardArc(mc, asc); // maisons 10 -> 11 -> 12 -> 1
  const q2 = forwardArc(asc, ic); // maisons 1 -> 2 -> 3 -> 4
  const c11 = normalizeDegrees(mc + q1 / 3);
  const c12 = normalizeDegrees(mc + (2 * q1) / 3);
  const c2 = normalizeDegrees(asc + q2 / 3);
  const c3 = normalizeDegrees(asc + (2 * q2) / 3);
  return assembleFromSixCusps({ asc, mc, c2, c3, c11, c12 });
}

function equalCusps(asc: number): number[] {
  return Array.from({ length: 12 }, (_, i) => normalizeDegrees(asc + i * 30));
}

function wholeSignCusps(asc: number): number[] {
  const start = Math.floor(asc / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => normalizeDegrees(start + i * 30));
}

export function computeHouses(
  system: HouseSystem,
  ramc: number,
  obliquity: number,
  latitude: number
): HouseCusps {
  const asc = ascendantLongitude(ramc, obliquity, latitude);
  const mc = midheavenLongitude(ramc, obliquity);

  if (system === "whole-sign") {
    return { system, cusps: wholeSignCusps(asc), ascendant: asc, midheaven: mc };
  }
  if (system === "equal") {
    return { system, cusps: equalCusps(asc), ascendant: asc, midheaven: mc };
  }
  if (system === "porphyry") {
    return { system, cusps: porphyryCusps(asc, mc), ascendant: asc, midheaven: mc };
  }

  // Placidus : peut être indéfini très près des cercles polaires. On bascule
  // alors sur le système des signes entiers plutôt que d'afficher un thème
  // faux — la transparence prime sur la fausse précision.
  const { cusps, ok } = placidusCusps(ramc, obliquity, latitude, asc, mc);
  if (!ok) {
    return {
      system: "placidus",
      cusps: wholeSignCusps(asc),
      ascendant: asc,
      midheaven: mc,
      fellBackToWholeSign: true,
    };
  }
  return { system: "placidus", cusps, ascendant: asc, midheaven: mc };
}

/** Détermine dans quelle maison (1-12) tombe une longitude donnée. */
export function houseOfLongitude(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const span = forwardArc(cusps[i], cusps[(i + 1) % 12]) || 360;
    const pos = forwardArc(cusps[i], longitude);
    if (pos < span) return i + 1;
  }
  return 12;
}
