"use client";

import { useState } from "react";
import { playSoftChime } from "@/lib/sound";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { share: string; copied: string; shareTitle: string }> = {
  fr: { share: "↗ Partager", copied: "Copié !", shareTitle: "Mon horoscope du jour — Astrologium" },
  en: { share: "↗ Share", copied: "Copied!", shareTitle: "My daily horoscope — Astrologium" },
};

// Partage texte simple (pas d'image à générer, contrairement à
// ShareCardButton) : Web Share API native sur mobile, repli sur la copie
// presse-papiers ailleurs — jamais de partage cassé selon la plateforme.
export function SharePunchlineButton({ text, url, locale = "fr" }: { text: string; url: string; locale?: Locale }) {
  const t = TEXT[locale];
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: t.shareTitle, text, url });
        playSoftChime();
      } catch {
        // Partage annulé par l'utilisateur — rien à faire.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      playSoftChime();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible — pas grave, l'utilisateur peut copier à la main.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-gold/60 hover:text-gold-strong"
    >
      {copied ? t.copied : t.share}
    </button>
  );
}
