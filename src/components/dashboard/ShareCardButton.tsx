"use client";

import { useState } from "react";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { share: string; sharing: string; label: string; text: string }> = {
  fr: {
    share: "⤓ Carte à partager",
    sharing: "Préparation…",
    label: "Carte d'identité astrale",
    text: "Ma carte d'identité astrale, générée sur Astrologium.",
  },
  en: {
    share: "⤓ Shareable card",
    sharing: "Preparing…",
    label: "Astral ID card",
    text: "My astral ID card, generated on Astrologium.",
  },
};

/**
 * Bouton "carte à partager" : utilise le Web Share API natif (partage
 * direct vers Instagram/WhatsApp/etc. sur mobile) quand disponible, sinon
 * retombe sur un téléchargement classique de l'image — jamais de partage
 * cassé, quelle que soit la plateforme.
 */
export function ShareCardButton({
  profileId,
  fileName,
  locale = "fr",
}: {
  profileId: string;
  fileName: string;
  locale?: Locale;
}) {
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const t = TEXT[locale];

  async function handleClick() {
    setStatus("busy");
    try {
      const res = await fetch(`/api/share/theme-natal/${profileId}`);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t.label, text: t.text });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Annulation du partage natif (utilisateur) ou erreur réseau — silencieux, l'utilisateur peut réessayer.
    } finally {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "busy"}
      className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
    >
      {status === "busy" ? t.sharing : t.share}
    </button>
  );
}
