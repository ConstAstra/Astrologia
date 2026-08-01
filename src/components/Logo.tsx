export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl tracking-wide ${className}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2 L13.8 9.2 L21 11 L13.8 12.8 L12 20 L10.2 12.8 L3 11 L10.2 9.2 Z"
          fill="url(#astrologia-star-gradient)"
        />
        <defs>
          <linearGradient id="astrologia-star-gradient" x1="3" y1="2" x2="21" y2="20">
            <stop offset="0" stopColor="#f2b799" />
            <stop offset="1" stopColor="#c77b8a" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-foreground">Astrolog</span>
      <span className="text-gold-strong">ia</span>
    </span>
  );
}
