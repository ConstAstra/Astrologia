// Petits schémas explicatifs pour la page /méthode, un cran au-dessus des
// icônes purement décoratives de FeatureIcons : ceux-ci portent un vrai
// contenu (comment le zodiaque tropical est ancré, pourquoi les systèmes de
// maisons ne découpent pas le ciel pareil, pourquoi certaines lignes de
// cartographie sont droites et d'autres courbes) plutôt que de juste
// illustrer le thème de la section.
type DiagramProps = { className?: string };

export function ZodiacSeasonDiagram({ className = "" }: DiagramProps) {
  const spokes = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg viewBox="0 0 140 140" className="h-28 w-28">
        <circle cx="70" cy="70" r="52" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border-soft" />
        {spokes.map((i) => {
          const angle = (i * 360) / 12 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = 70 + 40 * Math.cos(rad);
          const y1 = 70 + 40 * Math.sin(rad);
          const x2 = 70 + 52 * Math.cos(rad);
          const y2 = 70 + 52 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={i === 0 ? 2.5 : 1}
              className={i === 0 ? "text-gold-strong" : "text-border-soft"}
            />
          );
        })}
        <line x1="70" y1="70" x2="70" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" className="text-gold-strong" opacity="0.7" />
        <circle cx="70" cy="12" r="4" fill="currentColor" className="text-gold-strong" />
      </svg>
      <p className="max-w-[11rem] text-center text-[11px] leading-snug text-muted">
        0° Bélier pointe toujours vers l&apos;équinoxe de printemps, pas vers une étoile fixe.
      </p>
    </div>
  );
}

function HouseWheel({ cusps }: { cusps: number[] }) {
  return (
    <svg viewBox="0 0 110 110" className="h-20 w-20">
      <circle cx="55" cy="55" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border-soft" />
      {cusps.map((deg, i) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const x = 55 + 42 * Math.cos(rad);
        const y = 55 + 42 * Math.sin(rad);
        return (
          <line
            key={i}
            x1="55"
            y1="55"
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? 2 : 1.25}
            className={i % 3 === 0 ? "text-violet" : "text-muted"}
          />
        );
      })}
    </svg>
  );
}

export function HouseSystemsDiagram({ className = "" }: DiagramProps) {
  const equalCusps = Array.from({ length: 12 }, (_, i) => i * 30);
  const placidusCusps = [0, 20, 55, 90, 110, 145, 180, 200, 235, 270, 290, 325];

  return (
    <div className={`flex items-start justify-center gap-3 ${className}`}>
      <div className="flex w-24 flex-col items-center gap-1.5">
        <HouseWheel cusps={equalCusps} />
        <p className="text-center text-[10px] leading-snug text-muted">Signes entiers / maisons égales : 12 parts identiques</p>
      </div>
      <div className="flex w-24 flex-col items-center gap-1.5">
        <HouseWheel cusps={placidusCusps} />
        <p className="text-center text-[10px] leading-snug text-muted">Placidus : des maisons plus ou moins larges selon la latitude</p>
      </div>
    </div>
  );
}

export function CartographyLinesDiagram({ className = "" }: DiagramProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg viewBox="0 0 160 100" className="h-20 w-32">
        <rect x="4" y="4" width="152" height="92" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border-soft" />
        <line x1="55" y1="4" x2="55" y2="96" stroke="currentColor" strokeWidth="1.5" className="text-gold-strong" />
        <line x1="105" y1="4" x2="105" y2="96" stroke="currentColor" strokeWidth="1.5" className="text-gold-strong" opacity="0.6" />
        <path d="M 20 4 Q 45 50 20 96" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet" />
        <path d="M 140 4 Q 115 50 140 96" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet" opacity="0.6" />
      </svg>
      <p className="max-w-[14rem] text-center text-[11px] leading-snug text-muted">
        Milieu du Ciel / Fond du Ciel (méridiens droits) contre Ascendant / Descendant (courbes qui dépendent de la latitude).
      </p>
    </div>
  );
}
