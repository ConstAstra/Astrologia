"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { safeJson } from "@/lib/safe-json";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { placeholder: string; genericError: string; loading: string; submit: string }> = {
  fr: { placeholder: "Votre code cadeau", genericError: "Une erreur est survenue.", loading: "Un instant…", submit: "Utiliser le code" },
  en: { placeholder: "Your gift code", genericError: "Something went wrong.", loading: "One moment…", submit: "Redeem code" },
};

export function GiftCodeRedeemForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/gift/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: form.get("code"), locale }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.genericError);
      setSuccess(data?.message ?? t.genericError);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-3">
      <div className="min-w-0 flex-1">
        <input
          name="code"
          required
          placeholder={t.placeholder}
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm uppercase outline-none focus:border-gold/60"
        />
        {error && <p className="mt-2 text-sm text-terracotta">{error}</p>}
        {success && <p className="mt-2 text-sm text-sage">{success}</p>}
      </div>
      <Button type="submit" loading={loading}>
        {loading ? t.loading : t.submit}
      </Button>
    </form>
  );
}
