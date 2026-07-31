"use client";

import { useState } from "react";

export function NotificationToggle({ initialOptIn }: { initialOptIn: boolean }) {
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
        Horoscope quotidien par e-mail
        <span className="block text-xs text-muted">Un rappel court chaque jour : phase lunaire et transit du jour.</span>
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
