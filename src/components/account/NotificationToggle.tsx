"use client";

import { useState } from "react";

const TEXT = {
  fr: { title: "Horoscope quotidien par e-mail", subtitle: "Un rappel court chaque jour : phase lunaire et transit du jour." },
  en: { title: "Daily horoscope by email", subtitle: "A short daily reminder: moon phase and today's transit." },
};

export function NotificationToggle({ initialOptIn, locale = "fr" }: { initialOptIn: boolean; locale?: "fr" | "en" }) {
  const t = TEXT[locale];
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !optIn;
    setLoading(true);
    setOptIn(next);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyHoroscopeOptIn: next }),
      });
      if (!res.ok) setOptIn(!next);
    } catch {
      setOptIn(!next);
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
        aria-checked={optIn}
        onClick={toggle}
        disabled={loading}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          optIn ? "bg-gold" : "bg-border-soft"
        } ${loading ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            optIn ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
