"use client";

import { useState } from "react";

const TEXT = {
  fr: { title: "Partager ce thème avec mes amis", subtitle: "Tes amis pourront voir le thème complet et les transits, sans toucher à ton compte." },
  en: { title: "Share this chart with my friends", subtitle: "Your friends will be able to see the full chart and transits, without touching your account." },
};

export function ShareChartToggle({
  profileId,
  initialShared,
  locale = "fr",
}: {
  profileId: string;
  initialShared: boolean;
  locale?: "fr" | "en";
}) {
  const t = TEXT[locale];
  const [shared, setShared] = useState(initialShared);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !shared;
    setLoading(true);
    setShared(next);
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareWithFriends: next }),
      });
      if (!res.ok) setShared(!next);
    } catch {
      setShared(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm">
        {t.title}
        <span className="block text-xs text-muted">{t.subtitle}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={shared}
        onClick={toggle}
        disabled={loading}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          shared ? "bg-gold" : "bg-border-soft"
        } ${loading ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            shared ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
