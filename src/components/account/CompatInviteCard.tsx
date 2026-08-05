"use client";

import { useState } from "react";
import { playSoftChime } from "@/lib/sound";

const TEXT = {
  fr: {
    invite:
      "Un lien plus léger à partager largement : la personne voit ton signe, choisit le sien, et obtient une carte de compatibilité instantanée — sans devenir ton ami sur l'app.",
    copy: "Copier",
    copied: "Copié !",
  },
  en: {
    invite:
      "A lighter link to share widely: they see your sign, pick theirs, and get an instant compatibility card — without becoming your friend on the app.",
    copy: "Copy",
    copied: "Copied!",
  },
};

export function CompatInviteCard({ inviteUrl, locale = "fr" }: { inviteUrl: string; locale?: "fr" | "en" }) {
  const t = TEXT[locale];
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      playSoftChime();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible — rien de grave, l'utilisateur peut copier le lien à la main.
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">{t.invite}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={inviteUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-border-soft bg-background-elevated px-3 py-2 text-xs text-muted"
        />
        <button
          type="button"
          onClick={copy}
          className={`shrink-0 rounded-full border px-3 py-2 text-xs transition-all duration-300 ${
            copied ? "scale-105 border-sage/60 bg-sage/10 text-sage" : "border-gold/40 text-gold-strong hover:bg-gold/10"
          }`}
        >
          {copied ? `✓ ${t.copied}` : t.copy}
        </button>
      </div>
    </div>
  );
}
