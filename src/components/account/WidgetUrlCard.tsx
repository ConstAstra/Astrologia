"use client";

import { useState } from "react";

const TEXT = {
  fr: {
    description: "URL du widget iOS (écran d'accueil) — à coller dans la configuration du widget une fois l'app installée.",
    copied: "Copié !",
    copy: "Copier",
  },
  en: {
    description: "iOS widget URL (home screen) — paste into the widget's configuration once the app is installed.",
    copied: "Copied!",
    copy: "Copy",
  },
};

export function WidgetUrlCard({ widgetUrl, locale = "fr" }: { widgetUrl: string; locale?: "fr" | "en" }) {
  const [copied, setCopied] = useState(false);
  const t = TEXT[locale];

  async function copy() {
    try {
      await navigator.clipboard.writeText(widgetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: the user can still copy the link by hand.
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">{t.description}</p>
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
          {copied ? t.copied : t.copy}
        </button>
      </div>
    </div>
  );
}
