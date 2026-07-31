"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LocaleToggle({ locale }: { locale: "fr" | "en" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const next = locale === "en" ? "fr" : "en";

  async function switchLocale() {
    setLoading(true);
    await fetch("/api/account/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      disabled={loading}
      className="rounded-full border border-border-soft px-2.5 py-1 text-xs text-muted hover:text-foreground"
    >
      {next.toUpperCase()}
    </button>
  );
}
