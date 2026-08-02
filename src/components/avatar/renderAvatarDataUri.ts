import { computeAvatarTraits, COMPANION_SHAPES } from "./avatarTraits";
import type { AvatarOverrides, CompanionShape } from "./avatarTraits";
import type { ZodiacSign } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";

function companionShapeSvg(shape: CompanionShape, color: string): string {
  return shape.type === "circle"
    ? `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${color}"/>`
    : `<path d="${shape.d}" fill="${color}"/>`;
}

/**
 * Sérialise l'avatar pixel-art en data URI SVG via une chaîne de caractères
 * (pas de rendu React) — utilisé côté serveur pour l'incruster dans la
 * carte de partage générée par `next/og` (Satori), où `react-dom/server`
 * ne peut pas être importé depuis une route handler.
 */
export function renderAvatarDataUri(
  seed: string,
  sunSign: ZodiacSign,
  size = 256,
  moonSign?: ZodiacSign,
  ascSign?: ZodiacSign,
  overrides?: AvatarOverrides,
  /** Halo doré : abonnement Premium actif ou série de connexions ≥ 7 jours — jamais un choix, toujours gagné. */
  glowing = false
): string {
  const { skin, hairColor, hairCells, clothing, blush, smiling, raisedBrow, glasses, bg, clipId, companion } =
    computeAvatarTraits(seed, sunSign, moonSign, ascSign, overrides);
  const grid = 12;
  const unit = size / grid;

  const hairRects = hairCells
    .map((c) => `<rect x="${c.x * unit}" y="${c.y * unit}" width="${unit}" height="${unit}" fill="${hairColor}"/>`)
    .join("");

  const glassesSvg = glasses
    ? `<g stroke="#20242e" stroke-width="${unit * 0.18}" fill="none" opacity="0.85">
        <rect x="${unit * 3.9}" y="${unit * 6.05}" width="${unit * 1.7}" height="${unit * 1.6}" rx="${unit * 0.3}"/>
        <rect x="${unit * 6.6}" y="${unit * 6.05}" width="${unit * 1.7}" height="${unit * 1.6}" rx="${unit * 0.3}"/>
        <line x1="${unit * 5.6}" y1="${unit * 6.7}" x2="${unit * 6.6}" y2="${unit * 6.7}"/>
      </g>`
    : "";

  const blushSvg = blush
    ? `<circle cx="${unit * 4}" cy="${unit * 8}" r="${unit * 0.5}" fill="#e08a7a" opacity="0.5"/>
       <circle cx="${unit * 8}" cy="${unit * 8}" r="${unit * 0.5}" fill="#e08a7a" opacity="0.5"/>`
    : "";

  const mouthSvg = smiling
    ? `<path d="M ${unit * 5.3} ${unit * 8.7} Q ${unit * 6} ${unit * 9.3} ${unit * 6.7} ${unit * 8.7}" stroke="#8a4a3a" stroke-width="${unit * 0.35}" stroke-linecap="round" fill="none"/>`
    : `<rect x="${unit * 5.4}" y="${unit * 8.6}" width="${unit * 1.4}" height="${unit * 0.5}" rx="${unit * 0.2}" fill="#8a4a3a"/>`;

  // Abréviation texte plutôt que le glyphe unicode ♊ etc. : ce SVG est
  // rastérisé côté serveur (pipeline next/og) par un moteur qui ne dispose
  // pas des glyphes astrologiques dans sa police, contrairement au rendu
  // navigateur utilisé par PixelAvatar.
  const badgeLabel = SIGN_META[sunSign].name.slice(0, 3).toUpperCase();
  const badgeSvg = `<g>
    <circle cx="${size - unit * 1.6}" cy="${size - unit * 1.6}" r="${unit * 1.7}" fill="#1f1420" stroke="#e8935f" stroke-width="1"/>
    <text x="${size - unit * 1.6}" y="${size - unit * 1.6}" text-anchor="middle" dominant-baseline="central" font-size="${unit * 1.05}" fill="#f2b799">${badgeLabel}</text>
  </g>`;

  const companionSvg = companion
    ? `<g>
    <circle cx="${unit * 1.6}" cy="${size - unit * 1.6}" r="${unit * 1.4}" fill="#1f1420" stroke="#e8935f" stroke-width="1"/>
    <g transform="translate(${unit * 1.6} ${size - unit * 1.6}) scale(${unit * 0.9})">
      ${COMPANION_SHAPES[companion.element].map((shape) => companionShapeSvg(shape, companion.color)).join("")}
    </g>
  </g>`
    : "";

  const glowStrokeWidth = glowing ? Math.max(2, size * 0.035) : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><clipPath id="${clipId}"><rect width="${size}" height="${size}" rx="${size * 0.18}"/></clipPath></defs>
    <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${bg}" ${glowing ? `stroke="#f2b799" stroke-width="${glowStrokeWidth}"` : ""}/>
    <g clip-path="url(#${clipId})">
      <rect x="${unit * 0.5}" y="${unit * 9.6}" width="${unit * 11}" height="${unit * 3.5}" rx="${unit * 2.2}" fill="${clothing}"/>
      <rect x="${unit * 2.5}" y="${unit * 3}" width="${unit * 7}" height="${unit * 7}" rx="${unit * 1.8}" fill="${skin}"/>
      ${hairRects}
      <rect x="${unit * 4.2}" y="${unit * (raisedBrow ? 5.6 : 5.85)}" width="${unit * 1.1}" height="${unit * 0.35}" rx="${unit * 0.15}" fill="${hairColor}"/>
      <rect x="${unit * 6.9}" y="${unit * 5.85}" width="${unit * 1.1}" height="${unit * 0.35}" rx="${unit * 0.15}" fill="${hairColor}"/>
      <rect x="${unit * 4.3}" y="${unit * 6.4}" width="${unit * 0.9}" height="${unit * 0.9}" fill="#241f1c"/>
      <rect x="${unit * 7}" y="${unit * 6.4}" width="${unit * 0.9}" height="${unit * 0.9}" fill="#241f1c"/>
      ${glassesSvg}
      ${blushSvg}
      ${mouthSvg}
    </g>
    ${badgeSvg}
    ${companionSvg}
  </svg>`;

  const base64 = Buffer.from(svg, "utf-8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
