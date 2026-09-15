"use client";

import { useState } from "react";
import { playSoftChime } from "@/lib/sound";

type Locale = "fr" | "en";
type Format = "post" | "story";

const TEXT: Record<
  Locale,
  { post: string; story: string; sharing: string; label: string; text: string }
> = {
  fr: {
    post: "⤓ Carte",
    story: "⤓ Story",
    sharing: "…",
    label: "Carte d'identité astrale",
    text: "Ma carte d'identité astrale, générée sur Astrologium.",
  },
  en: {
    post: "⤓ Card",
    story: "⤓ Story",
    sharing: "…",
    label: "Astral ID card",
    text: "My astral ID card, generated on Astrologium.",
  },
};

/**
 * Deux boutons "carte à partager" : format post (4:5, feed) et story (9:16,
 * Instagram/TikTok/Snapchat). Chacun utilise le Web Share API natif (partage
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
  const [busy, setBusy] = useState<Format | null>(null);
  const t = TEXT[locale];

  async function handleClick(format: Format) {
    setBusy(format);
    try {
      const suffix = format === "story" ? "-story" : "";
      const namedFile = fileName.replace(/(\.[^.]+)$/, `${suffix}$1`);
      const res = await fetch(`/api/share/theme-natal/${profileId}?format=${format}`);
      const blob = await res.blob();
      const file = new File([blob], namedFile, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t.label, text: t.text });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = namedFile;
        a.click();
        URL.revokeObjectURL(url);
      }
      playSoftChime();
    } catch {
      // Annulation du partage natif (utilisateur) ou erreur réseau — silencieux, l'utilisateur peut réessayer.
    } finally {
      setBusy(null);
    }
  }

  return (
    <span className="inline-flex gap-1.5">
      <button
        type="button"
        onClick={() => handleClick("post")}
        disabled={busy !== null}
        className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
      >
        {busy === "post" ? t.sharing : t.post}
      </button>
      <button
        type="button"
        onClick={() => handleClick("story")}
        disabled={busy !== null}
        className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
      >
        {busy === "story" ? t.sharing : t.story}
      </button>
    </span>
  );
}
