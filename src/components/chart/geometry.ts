import { normalizeDegrees } from "@/lib/astro/ephemeris";

/**
 * Convertit une longitude écliptique en angle SVG (degrés), de sorte que
 * l'Ascendant soit à gauche (9h) et que les longitudes croissantes tournent
 * dans le sens anti-horaire — la convention visuelle standard d'une roue
 * astrologique.
 */
export function longitudeToSvgAngleDeg(longitude: number, ascendant: number): number {
  return normalizeDegrees(180 - (longitude - ascendant));
}

export function polarToXY(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function describeArcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number
): string {
  // startAngle > endAngle typiquement puisque nos angles décroissent quand
  // la longitude augmente (sens anti-horaire) ; on gère les deux sens.
  const large = Math.abs(endAngle - startAngle) % 360 > 180 ? 1 : 0;
  const sweepOuter = endAngle < startAngle ? 0 : 1;
  const p1 = polarToXY(cx, cy, rOuter, startAngle);
  const p2 = polarToXY(cx, cy, rOuter, endAngle);
  const p3 = polarToXY(cx, cy, rInner, endAngle);
  const p4 = polarToXY(cx, cy, rInner, startAngle);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} ${sweepOuter} ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} ${1 - sweepOuter} ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}
