"use client";

import { playSoftChime } from "@/lib/sound";

const STORAGE_KEY = "astrologium-theme";

// Pas d'état React pour savoir quelle icône afficher : ça obligerait à lire
// le DOM après coup dans un effet (mismatch d'hydratation possible, le
// thème réel étant déjà posé par le script inline de layout.tsx avant que
// React ne s'hydrate). Les deux icônes sont toujours rendues, et le CSS
// (voir globals.css) affiche la bonne selon l'attribut data-theme du <html>.
function toggle() {
  const html = document.documentElement;
  const next = html.dataset.theme === "light" ? "dark" : "light";
  if (next === "light") html.dataset.theme = "light";
  else delete html.dataset.theme;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Stockage indisponible (navigation privée...) — le thème reste actif pour la session.
  }
  playSoftChime();
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Basculer entre mode jour et mode nuit"
      title="Jour / nuit"
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-soft text-muted transition-colors hover:text-foreground ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        className="theme-icon-dark h-3.5 w-3.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <path
          strokeLinecap="round"
          d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5"
        />
      </svg>
      <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon-light h-3.5 w-3.5" aria-hidden="true">
        <path d="M20.4 14.7A8.5 8.5 0 0 1 9.3 3.6a.7.7 0 0 0-.9-.9 9.9 9.9 0 1 0 12.9 12.9.7.7 0 0 0-.9-.9Z" />
      </svg>
    </button>
  );
}
