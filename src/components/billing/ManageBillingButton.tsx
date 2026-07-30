"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <Button variant="secondary" disabled={loading} onClick={handleClick}>
      {loading ? "Un instant…" : "Gérer mon abonnement (Stripe)"}
    </Button>
  );
}
