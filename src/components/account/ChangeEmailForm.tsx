"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Locale = "fr" | "en";

const TEXT: Record<Locale, {
  currentEmail: string;
  newEmail: string;
  password: string;
  genericError: string;
  loading: string;
  submit: string;
  success: string;
}> = {
  fr: {
    currentEmail: "E-mail actuel :",
    newEmail: "Nouvelle adresse e-mail",
    password: "Mot de passe",
    genericError: "Une erreur est survenue.",
    loading: "Un instant…",
    submit: "Changer l'e-mail",
    success: "Adresse e-mail mise à jour.",
  },
  en: {
    currentEmail: "Current email:",
    newEmail: "New email address",
    password: "Password",
    genericError: "Something went wrong.",
    loading: "One moment…",
    submit: "Change email",
    success: "Email address updated.",
  },
};

export function ChangeEmailForm({ currentEmail, locale = "fr" }: { currentEmail: string; locale?: Locale }) {
  const t = TEXT[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/account/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: form.get("newEmail"), password: form.get("password"), locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.genericError);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-muted">
        {t.currentEmail} <span className="text-foreground">{currentEmail}</span>
      </p>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="newEmail">
          {t.newEmail}
        </label>
        <input
          id="newEmail"
          name="newEmail"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="email-password">
          {t.password}
        </label>
        <input
          id="email-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}
      {success && <p className="text-sm text-sage">{t.success}</p>}

      <Button type="submit" variant="secondary" disabled={loading}>
        {loading ? t.loading : t.submit}
      </Button>
    </form>
  );
}
