"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { safeJson } from "@/lib/safe-json";

const TEXT = {
  fr: { loading: "Un instant…", manage: "Gérer mon abonnement (Stripe)", genericError: "Une erreur est survenue." },
  en: { loading: "One moment…", manage: "Manage my subscription (Stripe)", genericError: "Something went wrong." },
};

export function ManageBillingButton({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const t = TEXT[locale];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await safeJson(res);
      if (!res.ok || !data?.url) throw new Error(data?.error ?? t.genericError);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" loading={loading} onClick={handleClick}>
        {loading ? t.loading : t.manage}
      </Button>
      {error && <p className="mt-2 text-sm text-terracotta">{error}</p>}
    </div>
  );
}
