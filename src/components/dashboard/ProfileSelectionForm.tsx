"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import type { ZodiacSign } from "@/lib/astro/types";

type Locale = "fr" | "en";

const TEXT: Record<
  Locale,
  {
    progress: (chosen: number, limit: number) => string;
    selfLocked: string;
    submit: string;
    submitting: string;
    error: string;
    unknownTime: string;
  }
> = {
  fr: {
    progress: (chosen, limit) => `${chosen} / ${limit} choisis`,
    selfLocked: "Votre profil (toujours gardé)",
    submit: "Valider ma sélection",
    submitting: "Enregistrement…",
    error: "Une erreur est survenue, réessayez.",
    unknownTime: "heure inconnue",
  },
  en: {
    progress: (chosen, limit) => `${chosen} / ${limit} chosen`,
    selfLocked: "Your profile (always kept)",
    submit: "Confirm my selection",
    submitting: "Saving…",
    error: "Something went wrong, try again.",
    unknownTime: "unknown time",
  },
};

interface ProfileOption {
  id: string;
  label: string;
  isSelf: boolean;
  birthDate: string;
  birthTime: string | null;
  timeUnknown: boolean;
  locationName: string;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
}

export function ProfileSelectionForm({
  profiles,
  limit,
  locale = "fr",
}: {
  profiles: ProfileOption[];
  limit: number;
  locale?: Locale;
}) {
  const router = useRouter();
  const t = TEXT[locale];

  // Le profil "soi" (s'il existe) est pré-coché et non décochable : c'est
  // presque toujours celui qu'on veut garder, et le laisser se faire
  // archiver par erreur casserait le partage avec les amis (voir
  // listFriendSelfProfiles) sans qu'on s'en rende compte tout de suite.
  const selfId = profiles.find((p) => p.isSelf)?.id;
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selfId ? [selfId] : []));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    if (id === selfId) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < limit) {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profiles/archiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepProfileIds: [...selected] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? t.error);
        setSubmitting(false);
        return;
      }
      router.push("/dashboard/profils");
      router.refresh();
    } catch {
      setError(t.error);
      setSubmitting(false);
    }
  }

  const canSubmit = selected.size === limit && !submitting;

  return (
    <div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => {
          const isChecked = selected.has(profile.id);
          const isLocked = profile.id === selfId;
          return (
            <Card
              key={profile.id}
              interactive={!isLocked}
              className={`flex flex-col p-6 transition-colors ${
                isChecked ? "border-gold/60 bg-gold/5" : ""
              } ${isLocked ? "cursor-default" : "cursor-pointer"}`}
              onClick={() => toggle(profile.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <PixelAvatar seed={profile.id} sunSign={profile.sunSign} moonSign={profile.moonSign} size={56} locale={locale} />
                  <div>
                    <p className="font-display text-lg">{profile.label}</p>
                    <p className="text-xs text-muted">
                      {profile.birthDate}
                      {profile.timeUnknown ? ` · ${t.unknownTime}` : profile.birthTime ? ` · ${profile.birthTime}` : ""}
                    </p>
                    <p className="text-xs text-muted">{profile.locationName}</p>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    isChecked ? "border-gold-strong bg-gold-strong text-background" : "border-border-soft"
                  }`}
                >
                  {isChecked ? "✓" : ""}
                </span>
              </div>
              {isLocked && <p className="mt-3 text-xs text-gold-strong">{t.selfLocked}</p>}
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full bg-gold-strong px-6 py-2.5 text-sm font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? t.submitting : t.submit}
        </button>
        <p className="text-sm text-muted">{t.progress(selected.size, limit)}</p>
      </div>
      {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
    </div>
  );
}
