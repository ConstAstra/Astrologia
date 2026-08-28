// Petites icônes monolignes maison (SVG contrôlé, pas d'emoji/police externe
// — voir la leçon des symboles zodiacaux qui héritent parfois d'un rendu
// emoji coloré selon la police système). Utilisées sur la page d'accueil
// (grille d'outils + section "engagement").
type IconProps = { className?: string };

export function SunIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 360) / 8;
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + 8 * Math.cos(rad);
        const y1 = 12 + 8 * Math.sin(rad);
        const x2 = 12 + 10.5 * Math.cos(rad);
        const y2 = 12 + 10.5 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />;
      })}
    </svg>
  );
}

export function CrescentMoonIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.4 14.7A8.5 8.5 0 0 1 9.3 3.6a.7.7 0 0 0-.9-.9 9.9 9.9 0 1 0 12.9 12.9.7.7 0 0 0-.9-.9Z" />
    </svg>
  );
}

export function OverlapIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9.5" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.5" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function MergeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="16.5" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function MapPinIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function OrbitIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="20.3" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function WheelIcon({ className = "" }: IconProps) {
  // Rayons partant du centre plutôt que des diamètres traversants : à cette
  // taille, 4 diamètres se lisent comme un X (signe d'interdiction) plutôt
  // que comme une roue. Des rayons non traversants + un moyeu central lèvent
  // l'ambiguïté.
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 360) / 8;
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + 3.5 * Math.cos(rad);
        const y1 = 12 + 3.5 * Math.sin(rad);
        const x2 = 12 + 9 * Math.cos(rad);
        const y2 = 12 + 9 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.6" />;
      })}
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function EyeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
