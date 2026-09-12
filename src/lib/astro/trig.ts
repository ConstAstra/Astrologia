// Petites fonctions trigonométriques en degrés, pour garder houses.ts lisible.

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export const sinD = (deg: number) => Math.sin(deg * D2R);
export const cosD = (deg: number) => Math.cos(deg * D2R);
export const tanD = (deg: number) => Math.tan(deg * D2R);
export const asinD = (x: number) => Math.asin(Math.max(-1, Math.min(1, x))) * R2D;
export const acosD = (x: number) => Math.acos(Math.max(-1, Math.min(1, x))) * R2D;
export const atan2D = (y: number, x: number) => Math.atan2(y, x) * R2D;
