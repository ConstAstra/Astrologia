// Icônes monolignes dédiées aux guides (même esprit que FeatureIcons/
// MethodDiagrams : SVG contrôlé, pas d'emoji). Une par concept illustré,
// pas une par article, deux guides qui parlent du même objet (les deux
// rétrogrades, les deux façons de calculer "le thème du couple") partagent
// volontairement la même icône plutôt que d'en inventer une par slug.
type IconProps = { className?: string };

export function RetrogradeLoopIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M18.5 12a6.5 6.5 0 1 1-2.1-4.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M18.5 4.5v3.5h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TwelveHousesIcon({ className = "" }: IconProps) {
  const spokes = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      {spokes.map((i) => {
        const angle = (i * 360) / 12;
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + 4 * Math.cos(rad);
        const y1 = 12 + 4 * Math.sin(rad);
        const x2 = 12 + 9 * Math.cos(rad);
        const y2 = 12 + 9 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.7" />;
      })}
    </svg>
  );
}

export function HorizonRiseIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 4v3M7 7l1.8 1.8M17 7l-1.8 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function OpenBookIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 6c-2-1.5-5.5-1.5-8-0.5v12c2.5-1 6-1 8 0.5 2-1.5 5.5-1.5 8-0.5v-12c-2.5-1-6-1-8 0.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function AspectAngleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 20 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 20 19 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 15a5.5 5.5 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="5" cy="6" r="1.3" fill="currentColor" />
      <circle cx="19" cy="6" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function SaturnGlyphIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="12" y1="4" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16c0 2.5 4 2.5 4 0s-4-2.5-4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LunarNodeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 17v-4a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ScaleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="12" y1="4" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="20" x2="18" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="7" x2="5" y2="11" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <line x1="19" y1="7" x2="19" y2="11" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <path d="M2 11a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 11a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function UnevenWheelIcon({ className = "" }: IconProps) {
  const angles = [0, 35, 75, 140, 180, 215, 255, 320];
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 12 + 3.5 * Math.cos(rad);
        const y1 = 12 + 3.5 * Math.sin(rad);
        const x2 = 12 + 9 * Math.cos(rad);
        const y2 = 12 + 9 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.7" />;
      })}
    </svg>
  );
}

export function MinorPointsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="12" y1="6" x2="6" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="12" y1="6" x2="18" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="6" y1="17" x2="18" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="12" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="17" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="17" r="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
