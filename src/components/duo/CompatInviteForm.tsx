"use client";

import { useState } from "react";
import Link from "next/link";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { ZodiacSign } from "@/lib/astro/types";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { playSoftChime } from "@/lib/sound";

type Locale = "fr" | "en";
type Format = "post" | "story";

const TEXT: Record<
  Locale,
  {
    yourName: string;
    yourSign: string;
    yourNamePlaceholder: string;
    generate: string;
    generating: string;
    error: string;
    post: string;
    story: string;
    sharing: string;
    shareLabel: string;
    shareText: string;
    ctaTitle: string;
    ctaBody: string;
    ctaLink: string;
  }
> = {
  fr: {
    yourName: "Ton prénom",
    yourSign: "Ton signe",
    yourNamePlaceholder: "Toi",
    generate: "Voir notre compatibilité",
    generating: "…",
    error: "Choisis un prénom et un signe.",
    post: "⤓ Carte",
    story: "⤓ Story",
    sharing: "…",
    shareLabel: "Notre compatibilité",
    shareText: "Notre compatibilité astrale, généré sur Astrologium.",
    ctaTitle: "Envie du vrai résultat ?",
    ctaBody:
      "Ceci reste basé sur les seuls signes solaires. Avec ton thème complet (heure et lieu de naissance), la vraie synastrie regarde la Lune, Vénus, Mars, l'Ascendant — gratuite à l'inscription.",
    ctaLink: "Créer mon compte gratuit →",
  },
  en: {
    yourName: "Your name",
    yourSign: "Your sign",
    yourNamePlaceholder: "You",
    generate: "See our compatibility",
    generating: "…",
    error: "Pick a name and a sign.",
    post: "⤓ Card",
    story: "⤓ Story",
    sharing: "…",
    shareLabel: "Our compatibility",
    shareText: "Our astro compatibility, generated on Astrologium.",
    ctaTitle: "Want the real result?",
    ctaBody:
      "This is based on sun signs alone. With your full chart (birth time and place), real synastry looks at the Moon, Venus, Mars, the Ascendant — free when you sign up.",
    ctaLink: "Create my free account →",
  },
};

function SignPicker({
  label,
  value,
  onChange,
  locale,
}: {
  label: string;
  value: ZodiacSign | null;
  onChange: (sign: ZodiacSign) => void;
  locale: Locale;
}) {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  return (
    <div>
      <p className="mb-1.5 text-sm text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign}
            type="button"
            onClick={() => onChange(sign)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              value === sign
                ? "border-gold-strong bg-gold/10 text-gold-strong"
                : "border-border-soft text-muted hover:text-foreground"
            }`}
          >
            {signMap[sign].symbol} {signMap[sign].name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CompatInviteForm({
  code,
  ownerName,
  ownerSign,
  locale = "fr",
}: {
  code: string;
  ownerName: string;
  ownerSign: ZodiacSign;
  locale?: Locale;
}) {
  const t = TEXT[locale];
  const [name, setName] = useState("");
  const [sign, setSign] = useState<ZodiacSign | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sharing, setSharing] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);

  function buildUrl(format: Format) {
    const params = new URLSearchParams({
      name: name.trim() || (locale === "en" ? "You" : "Toi"),
      sign: sign ?? "",
      format,
      locale,
    });
    return `/api/share/compat-invite/${code}?${params.toString()}`;
  }

  async function handleGenerate() {
    if (!sign) {
      setError(t.error);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(buildUrl("post"));
      if (!res.ok) throw new Error("failed");
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
      playSoftChime();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare(format: Format) {
    setSharing(format);
    try {
      const res = await fetch(buildUrl(format));
      const blob = await res.blob();
      const file = new File([blob], `compatibilite-astrale${format === "story" ? "-story" : ""}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t.shareLabel, text: t.shareText });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Annulation du partage natif ou erreur réseau — silencieux, l'utilisateur peut réessayer.
    } finally {
      setSharing(null);
    }
  }

  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;

  return (
    <div className="mx-auto max-w-xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border-soft bg-background-elevated p-4">
          <p className="text-sm text-muted">{ownerName}</p>
          <p className="text-sm text-gold-strong">
            {signMap[ownerSign].symbol} {signMap[ownerSign].name}
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="c-name">
              {t.yourName}
            </label>
            <input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.yourNamePlaceholder}
              maxLength={24}
              className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
            />
          </div>
          <SignPicker label={t.yourSign} value={sign} onChange={setSign} locale={locale} />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-terracotta">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={busy}
        className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-background disabled:opacity-60"
      >
        {busy ? t.generating : t.generate}
      </button>

      {previewUrl && (
        <div className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="w-full rounded-2xl border border-border-soft" />
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleShare("post")}
              disabled={sharing !== null}
              className="rounded-full border border-gold/40 px-4 py-1.5 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
            >
              {sharing === "post" ? t.sharing : t.post}
            </button>
            <button
              type="button"
              onClick={() => handleShare("story")}
              disabled={sharing !== null}
              className="rounded-full border border-gold/40 px-4 py-1.5 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
            >
              {sharing === "story" ? t.sharing : t.story}
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-border-soft bg-background-elevated p-5 text-center">
            <p className="font-display text-lg">{t.ctaTitle}</p>
            <p className="mt-2 text-sm text-muted">{t.ctaBody}</p>
            <Link
              href={locale === "en" ? `/en/signup?ref=${code}` : `/inscription?ref=${code}`}
              className="mt-4 inline-block text-sm font-medium text-gold-strong underline"
            >
              {t.ctaLink}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
