"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type Locale = "fr" | "en";

const TEXT: Record<Locale, {
  currentPassword: string;
  newPassword: string;
  passwordHint: string;
  confirmPassword: string;
  mismatch: string;
  genericError: string;
  loading: string;
  submit: string;
  success: string;
}> = {
  fr: {
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    passwordHint: "8 caractères minimum.",
    confirmPassword: "Confirmer le nouveau mot de passe",
    mismatch: "Les deux mots de passe ne correspondent pas.",
    genericError: "Une erreur est survenue.",
    loading: "Un instant…",
    submit: "Changer le mot de passe",
    success: "Mot de passe mis à jour.",
  },
  en: {
    currentPassword: "Current password",
    newPassword: "New password",
    passwordHint: "8 characters minimum.",
    confirmPassword: "Confirm new password",
    mismatch: "The two passwords don't match.",
    genericError: "Something went wrong.",
    loading: "One moment…",
    submit: "Change password",
    success: "Password updated.",
  },
};

export function ChangePasswordForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const newPassword = form.get("newPassword");
    const confirm = form.get("confirm");
    if (newPassword !== confirm) {
      setError(t.mismatch);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.genericError);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="currentPassword">
          {t.currentPassword}
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="newPassword">
          {t.newPassword}
        </label>
        <input
          id="newPassword"
          name="newPassword"
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
      {success && <p className="text-sm text-sage">{t.success}</p>}

      <Button type="submit" variant="secondary" disabled={loading}>
        {loading ? t.loading : t.submit}
      </Button>
    </form>
  );
}
