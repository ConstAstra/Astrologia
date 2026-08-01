import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { computeAvatarTraits } from "./avatarTraits";
import type { AvatarOverrides } from "./avatarTraits";
import type { ZodiacSign } from "@/lib/astro/types";

// Avatar pixel-art déterministe façon Habbo : chaque profil obtient un
// portrait rétro chic (peau, cheveux, tenue, accessoires) tiré de son
// identifiant, plus un badge du signe solaire — pratique pour repérer un
// profil au premier coup d'œil parmi plusieurs thèmes enregistrés.
// La génération des traits est partagée avec `renderAvatarDataUri` (utilisé
// pour la carte de partage) via `avatarTraits.ts`. Quand la Lune/l'Ascendant
// sont connus, ils biaisent (sans jamais toucher la peau) la couleur de
// cheveux/tenue générée — et `overrides` (éditeur manuel) a toujours le
// dernier mot, champ par champ.

export function PixelAvatar({
  seed,
  sunSign,
  moonSign,
  ascSign,
  overrides,
  size = 64,
}: {
  seed: string;
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  ascSign?: ZodiacSign;
  overrides?: AvatarOverrides;
  size?: number;
}) {
  const { skin, hairColor, hairCells, clothing, blush, smiling, raisedBrow, glasses, bg, clipId } =
    computeAvatarTraits(seed, sunSign, moonSign, ascSign, overrides);

  const grid = 12;
  const unit = size / grid;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Avatar">
      <defs>
        <clipPath id={clipId}>
          <rect width={size} height={size} rx={size * 0.18} />
        </clipPath>
      </defs>
      <rect width={size} height={size} rx={size * 0.18} fill={bg} />

      <g clipPath={`url(#${clipId})`}>
        {/* Épaules / tenue */}
        <rect x={unit * 0.5} y={unit * 9.6} width={unit * 11} height={unit * 3.5} rx={unit * 2.2} fill={clothing} />

        {/* Tête */}
        <rect x={unit * 2.5} y={unit * 3} width={unit * 7} height={unit * 7} rx={unit * 1.8} fill={skin} />

        {/* Cheveux */}
        {hairCells.map((c, i) => (
          <rect key={i} x={c.x * unit} y={c.y * unit} width={unit} height={unit} fill={hairColor} />
        ))}

        {/* Sourcils */}
        <rect x={unit * 4.2} y={unit * (raisedBrow ? 5.6 : 5.85)} width={unit * 1.1} height={unit * 0.35} rx={unit * 0.15} fill={hairColor} />
        <rect x={unit * 6.9} y={unit * 5.85} width={unit * 1.1} height={unit * 0.35} rx={unit * 0.15} fill={hairColor} />

        {/* Yeux */}
        <rect x={unit * 4.3} y={unit * 6.4} width={unit * 0.9} height={unit * 0.9} fill="#241f1c" />
        <rect x={unit * 7} y={unit * 6.4} width={unit * 0.9} height={unit * 0.9} fill="#241f1c" />

        {/* Lunettes (parfois) */}
        {glasses && (
          <g stroke="#20242e" strokeWidth={unit * 0.18} fill="none" opacity={0.85}>
            <rect x={unit * 3.9} y={unit * 6.05} width={unit * 1.7} height={unit * 1.6} rx={unit * 0.3} />
            <rect x={unit * 6.6} y={unit * 6.05} width={unit * 1.7} height={unit * 1.6} rx={unit * 0.3} />
            <line x1={unit * 5.6} y1={unit * 6.7} x2={unit * 6.6} y2={unit * 6.7} />
          </g>
        )}

        {/* Joues */}
        {blush && (
          <>
            <circle cx={unit * 4} cy={unit * 8} r={unit * 0.5} fill="#e08a7a" opacity={0.5} />
            <circle cx={unit * 8} cy={unit * 8} r={unit * 0.5} fill="#e08a7a" opacity={0.5} />
          </>
        )}

        {/* Bouche */}
        {smiling ? (
          <path
            d={`M ${unit * 5.3} ${unit * 8.7} Q ${unit * 6} ${unit * 9.3} ${unit * 6.7} ${unit * 8.7}`}
            stroke="#8a4a3a"
            strokeWidth={unit * 0.35}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <rect x={unit * 5.4} y={unit * 8.6} width={unit * 1.4} height={unit * 0.5} rx={unit * 0.2} fill="#8a4a3a" />
        )}
      </g>

      {/* Badge signe solaire */}
      {sunSign && (
        <g>
          <circle cx={size - unit * 1.6} cy={size - unit * 1.6} r={unit * 1.7} fill="#1f1420" stroke="#e8935f" strokeWidth={1} />
          <text
            x={size - unit * 1.6}
            y={size - unit * 1.6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={unit * 1.7}
            fill="#f2b799"
          >
            {SIGN_META[sunSign].symbol}
          </text>
        </g>
      )}
    </svg>
  );
}
