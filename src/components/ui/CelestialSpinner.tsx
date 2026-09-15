// Petit indicateur de chargement "céleste" (soleil ou lune qui tourne
// doucement) pour remplacer les points de suspension nus sur les boutons en
// cours de calcul — voir .celestial-spin dans globals.css (désactivé sous
// prefers-reduced-motion, l'icône reste alors simplement statique).
export function CelestialSpinner({
  variant = "sun",
  className = "h-4 w-4",
}: {
  variant?: "sun" | "moon";
  className?: string;
}) {
  if (variant === "moon") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`celestial-spin ${className}`} aria-hidden="true">
        <path d="M20.4 14.7A8.5 8.5 0 0 1 9.3 3.6a.7.7 0 0 0-.9-.9 9.9 9.9 0 1 0 12.9 12.9.7.7 0 0 0-.9-.9Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`celestial-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 360) / 8;
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + 6.5 * Math.cos(rad);
        const y1 = 12 + 6.5 * Math.sin(rad);
        const x2 = 12 + 9.5 * Math.cos(rad);
        const y2 = 12 + 9.5 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />;
      })}
    </svg>
  );
}
