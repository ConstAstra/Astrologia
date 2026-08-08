"use client";

import { useState } from "react";
import { playSoftChime } from "@/lib/sound";

type Reaction = "vrai" | "partiellement" | "pas_du_tout";
type Locale = "fr" | "en";

const OPTIONS: Reaction[] = ["vrai", "partiellement", "pas_du_tout"];

const TEXT: Record<Locale, { prompt: string; vrai: string; partiellement: string; pas_du_tout: string; error: string }> = {
  fr: {
    prompt: "Avec le recul, cette lecture s'est révélée…",
    vrai: "✓ Confirmée",
    partiellement: "🤏 En partie",
    pas_du_tout: "✕ Pas vraiment",
    error: "Réessayez.",
  },
  en: {
    prompt: "Looking back, this reading turned out to be…",
    vrai: "✓ Accurate",
    partiellement: "🤏 Partly",
    pas_du_tout: "✕ Not really",
    error: "Please try again.",
  },
};

// Ferme la boucle contenu à sens unique (astro → utilisateur) : un avis
// rétrospectif rapide sur une lecture déjà vécue, jamais sur un jour futur
// (la route refuse la date de toute façon). Mise à jour optimiste, un seul
// avis par jour et par profil — cliquer une autre option corrige l'avis
// précédent plutôt que d'en ajouter un nouveau.
export function TransitCheckIn({
  profileId,
  date,
  initialReaction,
  locale = "fr",
}: {
  profileId: string;
  date: string;
  initialReaction: Reaction | null;
  locale?: Locale;
}) {
  const t = TEXT[locale];
  const [reaction, setReaction] = useState<Reaction | null>(initialReaction);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function react(next: Reaction) {
    if (busy || next === reaction) return;
    const previous = reaction;
    setBusy(true);
    setError(false);
    setReaction(next);
    try {
      const res = await fetch("/api/transit-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, date, reaction: next }),
      });
      if (!res.ok) throw new Error("check-in failed");
      playSoftChime();
    } catch {
      setReaction(previous);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-border-soft pt-4">
      <p className="text-xs text-muted">{t.prompt}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => react(opt)}
            disabled={busy}
            className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-60 ${
              reaction === opt ? "border-gold-strong bg-gold/10 text-gold-strong" : "border-border-soft text-muted hover:text-foreground"
            }`}
          >
            {t[opt]}
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-terracotta">{t.error}</p>}
    </div>
  );
}
