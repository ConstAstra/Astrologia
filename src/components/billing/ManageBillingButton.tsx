"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const TEXT = {
  fr: { loading: "Un instant…", manage: "Gérer mon abonnement (Stripe)" },
  en: { loading: "One moment…", manage: "Manage my subscription (Stripe)" },
};

export function ManageBillingButton({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const t = TEXT[locale];
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <Button variant="secondary" loading={loading} onClick={handleClick}>
      {loading ? t.loading : t.manage}
    </Button>
  );
}
