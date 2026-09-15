// Petite étoile décorative qui clignote doucement — accent vivant à semer
// avec parcimonie près d'un titre ou d'un état vide, jamais dans un bloc de
// texte. Voir .twinkle dans globals.css (figée, semi-opaque, sous
// prefers-reduced-motion).
export function Twinkle({ className = "h-2.5 w-2.5", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`twinkle inline-block ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <path d="M12 2c.8 4 2.5 5.7 6.5 6.5-4 .8-5.7 2.5-6.5 6.5-.8-4-2.5-5.7-6.5-6.5C9.5 7.7 11.2 6 12 2Z" />
    </svg>
  );
}
