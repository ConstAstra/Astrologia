"use client";

import { useState } from "react";

export function WidgetUrlCard({ widgetUrl }: { widgetUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(widgetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : l'utilisateur peut copier le lien à la main.
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">
        URL du widget iOS (écran d&apos;accueil) — à coller dans la configuration du widget une fois l&apos;app
        installée.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={widgetUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-border-soft bg-background-elevated px-3 py-2 text-xs text-muted"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full border border-gold/40 px-3 py-2 text-xs text-gold-strong hover:bg-gold/10"
        >
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
    </div>
  );
}
