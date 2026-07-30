import { SIGN_META } from "@/lib/astro/interpretations/signs";
import type { ZodiacSign } from "@/lib/astro/types";

// Avatar pixel-art déterministe façon Habbo : chaque profil obtient un
// portrait rétro chic (peau, cheveux, tenue, accessoires) tiré de son
// identifiant, plus un badge du signe solaire — pratique pour repérer un
// profil au premier coup d'œil parmi plusieurs thèmes enregistrés.

const SKIN_TONES = ["#f2c9a0", "#e8b088", "#c98a5e", "#8a5a3a", "#5c3a24"];
const HAIR_COLORS = ["#2b2320", "#6b4226", "#caa14d", "#8c7fdb", "#c9524b", "#e9e4d8", "#3a3a3a"];
const CLOTHING_COLORS = ["#8c7fdb", "#c9524b", "#4a8f7a", "#d7b781", "#5a6fa8", "#a85a8f", "#3a4a5a"];

// Grille 10 colonnes × 5 lignes ; col 0 → x=1, col 9 → x=10 ; ligne 0 → y=1.
// La tête occupe x:2.5–9.5, y:3–10, donc les lignes 2–4 du masque
// recouvrent naturellement le haut du crâne (racine des cheveux).
const HAIR_MASKS = [
  // Classique
  ["0011111100", "0111111110", "1111111111", "1000000001", "0000000000"],
  // Mohawk
  ["0000110000", "0000110000", "0001111000", "0001111000", "0000000000"],
  // Raie sur le côté
  ["1111111000", "1111110000", "1111100000", "1000000000", "0000000000"],
  // Afro
  ["0011111100", "0111111110", "1111111111", "1111111111", "1100000011"],
  // Bouclé
  ["0110110000", "1011011000", "0110110110", "1011011011", "0000000000"],
  // Court / rasé
  ["0000000000", "0011111100", "1000000001", "0000000000", "0000000000"],
];

const ELEMENT_BG: Record<string, string> = {
  Feu: "#3a2420",
  Terre: "#243a2c",
  Air: "#2c2440",
  Eau: "#1f2c40",
};

function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function PixelAvatar({
  seed,
  sunSign,
  size = 64,
}: {
  seed: string;
  sunSign?: ZodiacSign;
  size?: number;
}) {
  const rand = mulberry32(hashString(seed));
  const skin = SKIN_TONES[Math.floor(rand() * SKIN_TONES.length)];
  const hairColor = HAIR_COLORS[Math.floor(rand() * HAIR_COLORS.length)];
  const hairMask = HAIR_MASKS[Math.floor(rand() * HAIR_MASKS.length)];
  const clothing = CLOTHING_COLORS[Math.floor(rand() * CLOTHING_COLORS.length)];
  const blush = rand() > 0.5;
  const smiling = rand() > 0.4;
  const raisedBrow = rand() > 0.5;
  const glasses = rand() > 0.75;

  const grid = 12;
  const unit = size / grid;
  const bg = sunSign ? ELEMENT_BG[SIGN_META[sunSign].element] : "#1a1d2e";
  const clipId = `avatar-clip-${hashString(seed)}`;

  const hairCells: { x: number; y: number }[] = [];
  hairMask.forEach((row, rowIdx) => {
    row.split("").forEach((cell, colIdx) => {
      if (cell === "1") hairCells.push({ x: 1 + colIdx, y: 1 + rowIdx });
    });
  });

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
          <circle cx={size - unit * 1.6} cy={size - unit * 1.6} r={unit * 1.7} fill="#0d1020" stroke="#d7b781" strokeWidth={1} />
          <text
            x={size - unit * 1.6}
            y={size - unit * 1.6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={unit * 1.7}
            fill="#e9cd9c"
          >
            {SIGN_META[sunSign].symbol}
          </text>
        </g>
      )}
    </svg>
  );
}
