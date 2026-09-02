"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { isNativeApp, purchaseAppleProduct } from "@/lib/native/storekit";
import type { CreditPackId, SubscriptionPlanId } from "@/lib/billing/plans";
import { safeJson } from "@/lib/safe-json";

type Target =
  | { kind: "subscription"; plan: SubscriptionPlanId; appleProductId: string }
  | { kind: "credits"; pack: CreditPackId; appleProductId: string };

const TEXT = {
  fr: { loading: "Redirection…", unknownError: "Erreur inconnue", genericError: "Une erreur est survenue." },
  en: { loading: "Redirecting…", unknownError: "Unknown error", genericError: "Something went wrong." },
};

export function CheckoutButton({
  target,
  children,
  variant = "primary",
  locale = "fr",
}: {
  target: Target;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  locale?: "fr" | "en";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = TEXT[locale];

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      if (isNativeApp()) {
        await purchaseAppleProduct(target.appleProductId);
        router.refresh();
        return;
      }

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          target.kind === "subscription"
            ? { kind: "subscription", plan: target.plan }
            : { kind: "credits", pack: target.pack }
        ),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.unknownError);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t.genericError);
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant={variant} className="w-full" loading={loading} onClick={handleClick}>
        {loading ? t.loading : children}
      </Button>
      {error && <p className="mt-2 text-xs text-terracotta">{error}</p>}
    </div>
  );
}
