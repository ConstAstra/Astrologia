"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PixelAvatar } from "./PixelAvatar";
import { computeAvatarTraits, SKIN_TONES, HAIR_COLORS, CLOTHING_COLORS, HAIR_MASKS } from "./avatarTraits";
import type { AvatarOverrides } from "./avatarTraits";
import type { ZodiacSign } from "@/lib/astro/types";
import { Button } from "@/components/ui/Button";
import { playClickTick } from "@/lib/sound";

type Locale = "fr" | "en";

const HAIR_STYLE_NAMES: Record<Locale, string[]> = {
  fr: ["Classique", "Mohawk", "Raie sur le côté", "Ample", "Bouclé", "Court"],
  en: ["Classic", "Mohawk", "Side part", "Ample", "Curly", "Short"],
};

const BG_SWATCHES = ["#4a2a1f", "#243a2c", "#3a2440", "#1f2c40", "#241a2c", "#1f1420"];

const ELEMENT_LABEL_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

const TEXT: Record<
  Locale,
  {
    skin: string;
    hairColor: string;
    hairStyle: string;
    clothing: string;
    background: string;
    expression: string;
    blush: string;
    smiling: string;
    raisedBrow: string;
    glasses: string;
    save: string;
    saving: string;
    saved: string;
    reset: string;
    resetting: string;
    companionLabel: (moonSignName: string, element: string) => string;
    glowActive: string;
    glowProgress: (daysLeft: number) => string;
  }
> = {
  fr: {
    skin: "Peau",
    hairColor: "Couleur de cheveux",
    hairStyle: "Coiffure",
    clothing: "Tenue",
    background: "Fond",
    expression: "Expression",
    blush: "Joues roses",
    smiling: "Sourire",
    raisedBrow: "Sourcil levé",
    glasses: "Lunettes",
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Enregistré ✓",
    reset: "Revenir à l'auto (thème)",
    resetting: "…",
    companionLabel: (moonSignName, element) => `Compagnon : élément ${element} — hérité de la Lune en ${moonSignName}.`,
    glowActive: "✨ Halo doré actif — Premium ou série de connexions ≥ 7 jours.",
    glowProgress: (daysLeft) =>
      daysLeft === 1
        ? "Encore 1 jour de connexion pour débloquer le halo doré (ou passez Premium)."
        : `Encore ${daysLeft} jours de connexion pour débloquer le halo doré (ou passez Premium).`,
  },
  en: {
    skin: "Skin",
    hairColor: "Hair color",
    hairStyle: "Hairstyle",
    clothing: "Outfit",
    background: "Background",
    expression: "Expression",
    blush: "Blush",
    smiling: "Smiling",
    raisedBrow: "Raised brow",
    glasses: "Glasses",
    save: "Save",
    saving: "Saving…",
    saved: "Saved ✓",
    reset: "Back to auto (chart-based)",
    resetting: "…",
    companionLabel: (moonSignName, element) =>
      `Companion: ${ELEMENT_LABEL_EN[element] ?? element} element — inherited from your Moon in ${moonSignName}.`,
    glowActive: "✨ Golden glow active — Premium or a 7-day-or-longer login streak.",
    glowProgress: (daysLeft) =>
      daysLeft === 1
        ? "1 more day of logging in to unlock the golden glow (or go Premium)."
        : `${daysLeft} more days of logging in to unlock the golden glow (or go Premium).`,
  },
};

function Swatch({
  color,
  active,
  onClick,
  label,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playClickTick();
        onClick();
      }}
      aria-label={label}
      aria-pressed={active}
      className={`h-9 w-9 rounded-full border-2 transition-transform ${
        active ? "scale-110 border-gold-strong" : "border-transparent hover:scale-105"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

export function AvatarEditor({
  profileId,
  seed,
  sunSign,
  moonSign,
  moonSignName,
  initialOverrides,
  locale,
  glowing = false,
  daysUntilGlow = 0,
}: {
  profileId: string;
  seed: string;
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  moonSignName?: string;
  initialOverrides?: AvatarOverrides;
  locale: Locale;
  /** Halo doré : abonnement Premium actif ou série de connexions ≥ 7 jours. */
  glowing?: boolean;
  /** Jours de connexion restants avant de débloquer le halo (0 si déjà acquis). */
  daysUntilGlow?: number;
}) {
  const t = TEXT[locale];
  const router = useRouter();

  const initial = computeAvatarTraits(seed, sunSign, moonSign, undefined, initialOverrides);
  const [skin, setSkin] = useState(initial.skin);
  const [hairColor, setHairColor] = useState(initial.hairColor);
  const [hairMaskIndex, setHairMaskIndex] = useState(initial.hairMaskIndex);
  const [clothing, setClothing] = useState(initial.clothing);
  const [bg, setBg] = useState(initial.bg);
  const [blush, setBlush] = useState(initial.blush);
  const [smiling, setSmiling] = useState(initial.smiling);
  const [raisedBrow, setRaisedBrow] = useState(initial.raisedBrow);
  const [glasses, setGlasses] = useState(initial.glasses);

  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [resetting, setResetting] = useState(false);

  const overrides: AvatarOverrides = {
    skin,
    hairColor,
    hairMaskIndex,
    clothing,
    blush,
    smiling,
    raisedBrow,
    glasses,
    bg,
  };

  async function handleSave() {
    setStatus("saving");
    const res = await fetch(`/api/profiles/${profileId}/avatar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overrides),
    });
    if (res.ok) {
      setStatus("saved");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("idle");
    }
  }

  async function handleReset() {
    setResetting(true);
    const res = await fetch(`/api/profiles/${profileId}/avatar`, { method: "DELETE" });
    if (res.ok) {
      const fresh = computeAvatarTraits(seed, sunSign, moonSign, undefined, undefined);
      setSkin(fresh.skin);
      setHairColor(fresh.hairColor);
      setHairMaskIndex(fresh.hairMaskIndex);
      setClothing(fresh.clothing);
      setBg(fresh.bg);
      setBlush(fresh.blush);
      setSmiling(fresh.smiling);
      setRaisedBrow(fresh.raisedBrow);
      setGlasses(fresh.glasses);
      router.refresh();
    }
    setResetting(false);
  }

  return (
    <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start">
      <div className="flex flex-col items-center gap-3 sm:sticky sm:top-6">
        <PixelAvatar
          seed={seed}
          sunSign={sunSign}
          moonSign={moonSign}
          overrides={overrides}
          size={160}
          glowing={glowing}
          locale={locale}
        />
        <div className="max-w-xs space-y-1 text-center text-xs text-muted">
          {initial.companion && moonSignName && <p>{t.companionLabel(moonSignName, initial.companion.element)}</p>}
          <p>{glowing ? t.glowActive : t.glowProgress(daysUntilGlow)}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <p className="mb-2 text-sm font-medium text-muted">{t.skin}</p>
          <div className="flex flex-wrap gap-2">
            {SKIN_TONES.map((c) => (
              <Swatch key={c} color={c} active={skin === c} onClick={() => setSkin(c)} label={c} />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-muted">{t.hairColor}</p>
          <div className="flex flex-wrap gap-2">
            {HAIR_COLORS.map((c) => (
              <Swatch key={c} color={c} active={hairColor === c} onClick={() => setHairColor(c)} label={c} />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-muted">{t.hairStyle}</p>
          <div className="flex flex-wrap gap-2">
            {HAIR_MASKS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  playClickTick();
                  setHairMaskIndex(i);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  hairMaskIndex === i
                    ? "border-gold-strong bg-gold/10 text-gold-strong"
                    : "border-border-soft text-muted hover:text-foreground"
                }`}
              >
                {HAIR_STYLE_NAMES[locale][i]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-muted">{t.clothing}</p>
          <div className="flex flex-wrap gap-2">
            {CLOTHING_COLORS.map((c) => (
              <Swatch key={c} color={c} active={clothing === c} onClick={() => setClothing(c)} label={c} />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-muted">{t.background}</p>
          <div className="flex flex-wrap gap-2">
            {BG_SWATCHES.map((c) => (
              <Swatch key={c} color={c} active={bg === c} onClick={() => setBg(c)} label={c} />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-muted">{t.expression}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={blush} onChange={(e) => setBlush(e.target.checked)} />
              {t.blush}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={smiling} onChange={(e) => setSmiling(e.target.checked)} />
              {t.smiling}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={raisedBrow} onChange={(e) => setRaisedBrow(e.target.checked)} />
              {t.raisedBrow}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={glasses} onChange={(e) => setGlasses(e.target.checked)} />
              {t.glasses}
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={handleSave} loading={status === "saving"}>
            {status === "saving" ? t.saving : status === "saved" ? t.saved : t.save}
          </Button>
          <Button variant="ghost" onClick={handleReset} loading={resetting}>
            {resetting ? t.resetting : t.reset}
          </Button>
        </div>
      </div>
    </div>
  );
}
