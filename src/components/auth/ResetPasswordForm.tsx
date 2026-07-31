"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Locale = "fr" | "en";

const TEXT: Record<Locale, {
  newPassword: string;
  passwordHint: string;
  confirmPassword: string;
  mismatch: string;
  genericError: string;
  loading: string;
  submit: string;
}> = {
  fr: {
    newPassword: "Nouveau mot de passe",
    passwordHint: "8 caractères minimum.",
    confirmPassword: "Confirmer le mot de passe",
    mismatch: "Les deux mots de passe ne correspondent pas.",
    genericError: "Une erreur est survenue.",
    loading: "Un instant…",
    submit: "Réinitialiser le mot de passe",
  },
  en: {
    newPassword: "New password",
    passwordHint: "8 characters minimum.",
    confirmPassword: "Confirm password",
    mismatch: "The two passwords don't match.",
    genericError: "Something went wrong.",
    loading: "One moment…",
    submit: "Reset password",
  },
};

export function ResetPasswordForm({ token, locale = "fr" }: { token: string; locale?: Locale }) {
  const t = TEXT[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = form.get("password");
    const confirm = form.get("confirm");
    if (password !== confirm) {
      setError(t.mismatch);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.genericError);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="password">
          {t.newPassword}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
        <p className="mt-1 text-xs text-muted/70">{t.passwordHint}</p>
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="confirm">
          {t.confirmPassword}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t.loading : t.submit}
      </Button>
    </form>
  );
}
