"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { safeJson } from "@/lib/safe-json";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { email: string; genericError: string; loading: string; submit: string }> = {
  fr: {
    email: "E-mail",
    genericError: "Une erreur est survenue.",
    loading: "Un instant…",
    submit: "Envoyer le lien de réinitialisation",
  },
  en: {
    email: "Email",
    genericError: "Something went wrong.",
    loading: "One moment…",
    submit: "Send reset link",
  },
};

export function ForgotPasswordForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), locale }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.genericError);
      setMessage(data?.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setLoading(false);
    }
  }

  if (message) {
    return <p className="text-sm text-sage">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="email">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <Button type="submit" className="w-full" loading={loading}>
        {loading ? t.loading : t.submit}
      </Button>
    </form>
  );
}
