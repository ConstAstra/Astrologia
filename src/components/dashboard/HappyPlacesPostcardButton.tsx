"use client";

import { useState } from "react";
import { playSoftChime } from "@/lib/sound";

type Locale = "fr" | "en";
type Format = "post" | "story";

const TEXT: Record<
  Locale,
  { post: string; story: string; sharing: string; label: string; text: string; error: string }
> = {
  fr: {
    post: "⤓ Carte postale",
    story: "⤓ Story",
    sharing: "…",
    label: "Mes 3 endroits les plus heureux",
    text: "Mes 3 endroits les plus heureux selon mon astrocartographie, généré sur Astrologium.",
    error: "Impossible de générer la carte pour le moment.",
  },
  en: {
    post: "⤓ Postcard",
    story: "⤓ Story",
    sharing: "…",
    label: "My 3 happiest places",
    text: "My 3 happiest places according to my astrocartography, generated on Astrologium.",
    error: "Couldn't generate the card right now.",
  },
};

/**
 * Carte postale "tes 3 endroits heureux" — même mécanique de partage que les
 * autres cartes (Web Share API si disponible, sinon téléchargement), mais
 * dérivée de rankHappiestCountries plutôt que d'un pays choisi à la main :
 * pensée pour être générée et partagée en un clic, sans étape intermédiaire.
 */
export function HappyPlacesPostcardButton({
  profileId,
  locale = "fr",
}: {
  profileId: string;
  locale?: Locale;
}) {
  const [busy, setBusy] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = TEXT[locale];

  async function handleClick(format: Format) {
    setBusy(format);
    setError(null);
    try {
      const suffix = format === "story" ? "-story" : "";
      const res = await fetch(`/api/share/cartographie/${profileId}?format=${format}`);
      if (!res.ok) throw new Error(t.error);
      const blob = await res.blob();
      const file = new File([blob], `endroits-heureux${suffix}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t.label, text: t.text });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
      playSoftChime();
    } catch (err) {
      if (err instanceof Error && err.message !== t.error) {
        // Annulation du partage natif — silencieux, pas une vraie erreur.
      } else {
        setError(t.error);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <span className="inline-flex gap-1.5">
        <button
          type="button"
          onClick={() => handleClick("post")}
          disabled={busy !== null}
          className="inline-block rounded-full border border-sage/40 px-3 py-1 text-xs text-sage hover:bg-sage/10 disabled:opacity-60"
        >
          {busy === "post" ? t.sharing : t.post}
        </button>
        <button
          type="button"
          onClick={() => handleClick("story")}
          disabled={busy !== null}
          className="inline-block rounded-full border border-sage/40 px-3 py-1 text-xs text-sage hover:bg-sage/10 disabled:opacity-60"
        >
          {busy === "story" ? t.sharing : t.story}
        </button>
      </span>
      {error && <p className="mt-1 text-xs text-terracotta">{error}</p>}
    </div>
  );
}
