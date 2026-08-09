"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Locale = "fr" | "en";

const TEXT: Record<
  Locale,
  {
    firstName: string;
    email: string;
    password: string;
    passwordHint: string;
    genericError: string;
    loading: string;
    submitLogin: string;
    submitRegister: string;
  }
> = {
  fr: {
    firstName: "Prénom",
    email: "E-mail",
    password: "Mot de passe",
    passwordHint: "8 caractères minimum.",
    genericError: "Une erreur est survenue.",
    loading: "Un instant…",
    submitLogin: "Se connecter",
    submitRegister: "Créer mon compte",
  },
  en: {
    firstName: "First name",
    email: "Email",
    password: "Password",
    passwordHint: "8 characters minimum.",
    genericError: "Something went wrong.",
    loading: "One moment…",
    submitLogin: "Log in",
    submitRegister: "Create my account",
  },
};

export function AuthForm({ mode, locale = "fr" }: { mode: "login" | "register"; locale?: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = TEXT[locale];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
      locale,
      ...(mode === "register"
        ? { name: form.get("name") || undefined, ref: searchParams.get("ref") || undefined }
        : {}),
    };

    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.genericError);

      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="name">
            {t.firstName}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="given-name"
            className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          />
        </div>
      )}
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
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="password">
          {t.password}
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          locale={locale}
        />
        {mode === "register" && <p className="mt-1 text-xs text-muted/70">{t.passwordHint}</p>}
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <Button type="submit" className="w-full" loading={loading}>
        {loading ? t.loading : mode === "login" ? t.submitLogin : t.submitRegister}
      </Button>
    </form>
  );
}
