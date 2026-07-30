import { SIGN_META } from "@/lib/astro/interpretations/signs";
import type { ZodiacSign } from "@/lib/astro/types";

// Avatar pixel-art déterministe façon Habbo : chaque profil obtient un
// visage rétro chic (peau, cheveux, couleurs) tiré de son identifiant, et
// un badge du signe solaire — pratique pour repérer un profil au premier
// coup d'œil parmi plusieurs thèmes enregistrés.

const SKIN_TONES = ["#f2c9a0", "#e8b088", "#c98a5e", "#8a5a3a", "#5c3a24"];
const HAIR_COLORS = ["#2b2320", "#6b4226", "#caa14d", "#8c7fdb", "#c9524b", "#e9e4d8"];

const HAIR_MASKS = [
  ["11111111", "11111111", "10000001", "00000000"],
  ["00111100", "00111100", "00111100", "00000000"],
  ["11111100", "11110000", "10000000", "00000000"],
  ["11011011", "10110110", "01101100", "00000000"],
  ["00000000", "00000000", "11000011", "00000000"],
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
  const blush = rand() > 0.5;

  const grid = 12;
  const unit = size / grid;
  const bg = sunSign ? ELEMENT_BG[SIGN_META[sunSign].element] : "#1a1d2e";

  const hairCells: { x: number; y: number }[] = [];
  hairMask.forEach((row, rowIdx) => {
    row.split("").forEach((cell, colIdx) => {
      if (cell === "1") hairCells.push({ x: 2 + colIdx, y: 1 + rowIdx });
    });
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Avatar">
      <rect width={size} height={size} rx={size * 0.18} fill={bg} />
      {/* Tête */}
      <rect x={unit * 2.5} y={unit * 3} width={unit * 7} height={unit * 7} rx={unit * 1.6} fill={skin} />
      {/* Cheveux */}
      {hairCells.map((c, i) => (
        <rect key={i} x={c.x * unit} y={c.y * unit} width={unit} height={unit} fill={hairColor} />
      ))}
      {/* Yeux */}
      <rect x={unit * 4.3} y={unit * 6.4} width={unit * 0.9} height={unit * 0.9} fill="#241f1c" />
      <rect x={unit * 7} y={unit * 6.4} width={unit * 0.9} height={unit * 0.9} fill="#241f1c" />
      {/* Joues */}
      {blush && (
        <>
          <circle cx={unit * 4} cy={unit * 8} r={unit * 0.5} fill="#e08a7a" opacity={0.5} />
          <circle cx={unit * 8} cy={unit * 8} r={unit * 0.5} fill="#e08a7a" opacity={0.5} />
        </>
      )}
      {/* Bouche */}
      <rect x={unit * 5.4} y={unit * 8.6} width={unit * 1.4} height={unit * 0.5} rx={unit * 0.2} fill="#8a4a3a" />
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
