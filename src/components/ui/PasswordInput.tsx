"use client";

import { useState, type InputHTMLAttributes } from "react";

const LABEL = {
  fr: { show: "Afficher le mot de passe", hide: "Masquer le mot de passe" },
  en: { show: "Show password", hide: "Hide password" },
};

// Remplace un <input type="password"> nu : bascule affiché/masqué, pour que
// l'utilisateur puisse vérifier ce qu'il a tapé plutôt que de le deviner
// derrière des points — absent jusqu'ici sur tous les champs mot de passe du
// site (inscription, connexion, changement, réinitialisation, suppression).
export function PasswordInput({
  className = "",
  locale = "fr",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { locale?: "fr" | "en" }) {
  const [visible, setVisible] = useState(false);
  const t = LABEL[locale];

  return (
    <div className={`relative ${className}`}>
      <input
        type={visible ? "text" : "password"}
        className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 pr-11 text-sm outline-none focus:border-gold/60"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t.hide : t.show}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path
              d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M6.5 6.7C4.4 8.1 2.9 10 2 12c1.6 3.6 5.4 7 10 7 1.7 0 3.3-.4 4.7-1.1M9.9 4.2A10.8 10.8 0 0 1 12 4c4.6 0 8.4 3.4 10 7-.5 1.1-1.1 2.2-1.9 3.1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path
              d="M2 12c1.6-3.6 5.4-7 10-7s8.4 3.4 10 7c-1.6 3.6-5.4 7-10 7s-8.4-3.4-10-7Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </div>
  );
}
