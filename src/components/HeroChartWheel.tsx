// Illustration décorative pour le hero : évoque une roue de thème astral
// (cercle zodiacal + lignes d'aspects) sans être une vraie roue de thème
// (voir src/components/chart/ pour le vrai composant, basé sur un thème
// calculé). Purement ornemental — aria-hidden, jamais lu comme contenu.
// Rotation lente en CSS uniquement (pas de JS), désactivée si l'utilisateur
// préfère moins de mouvement.
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

// Cordes reliant des points du cercle, à la manière des lignes d'aspects
// d'un vrai thème — angles choisis pour rester lisibles (pas de fouillis),
// couleurs reprises des tokens de marque existants (gold/violet/sage).
const CHORDS: { from: number; to: number; color: string }[] = [
  { from: 20, to: 140, color: "var(--gold-strong)" },
  { from: 80, to: 260, color: "var(--violet)" },
  { from: 160, to: 320, color: "var(--sage)" },
  { from: 0, to: 200, color: "var(--gold-strong)" },
];

function pointOnCircle(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function HeroChartWheel({ className = "" }: { className?: string }) {
  const size = 440;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR - 28;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`hero-chart-wheel ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="var(--border-soft)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--border-soft)" strokeWidth="1" opacity="0.7" />

      {TICKS.map((angle) => {
        const outer = pointOnCircle(cx, cy, outerR, angle);
        const inner = pointOnCircle(cx, cy, outerR - (angle % 90 === 0 ? 16 : 9), angle);
        return (
          <line
            key={angle}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke="var(--gold-strong)"
            strokeWidth={angle % 90 === 0 ? 1.5 : 1}
            opacity={angle % 90 === 0 ? 0.6 : 0.35}
          />
        );
      })}

      <g opacity="0.55">
        {CHORDS.map((chord, i) => {
          const a = pointOnCircle(cx, cy, innerR, chord.from);
          const b = pointOnCircle(cx, cy, innerR, chord.to);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={chord.color} strokeWidth="1" />;
        })}
      </g>

      {TICKS.map((angle) => {
        const p = pointOnCircle(cx, cy, innerR, angle);
        return <circle key={angle} cx={p.x} cy={p.y} r={angle % 90 === 0 ? 3.5 : 2} fill="var(--gold-strong)" opacity="0.8" />;
      })}

      <circle cx={cx} cy={cy} r={3} fill="var(--gold-strong)" />
    </svg>
  );
}
