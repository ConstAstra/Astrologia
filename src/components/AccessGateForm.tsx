"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { safeJson } from "@/lib/safe-json";

const TEXT = {
  title: "Accès privé",
  intro: "Astrologium n'est pas encore ouvert au public — entrez le mot de passe pour continuer.",
  password: "Mot de passe",
  genericError: "Une erreur est survenue.",
  loading: "Un instant…",
  submit: "Entrer",
};

export function AccessGateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/site-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.get("password"), locale: "fr" }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? TEXT.genericError);
      const next = searchParams.get("next") || "/";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-6 text-center">
      <h1 className="font-display text-2xl">{TEXT.title}</h1>
      <p className="mt-2 text-sm text-muted">{TEXT.intro}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 text-left">
        <PasswordInput name="password" required autoFocus placeholder={TEXT.password} />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? TEXT.loading : TEXT.submit}
        </Button>
      </form>
    </div>
  );
}
