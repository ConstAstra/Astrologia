"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
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
      if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue.");

      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" && (
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="name">
            Prénom
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
          E-mail
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
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
        {mode === "register" && <p className="mt-1 text-xs text-muted/70">8 caractères minimum.</p>}
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </Button>
    </form>
  );
}
