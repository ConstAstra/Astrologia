"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { safeJson } from "@/lib/safe-json";

type Locale = "fr" | "en";

const TEXT: Record<Locale, {
  start: string;
  warning: string;
  password: string;
  genericError: string;
  loading: string;
  confirm: string;
  cancel: string;
}> = {
  fr: {
    start: "Supprimer mon compte",
    warning:
      "Cette action est définitive : tous vos profils, thèmes, déverrouillages et votre abonnement (le cas échéant) seront supprimés. Confirmez avec votre mot de passe.",
    password: "Mot de passe",
    genericError: "Une erreur est survenue.",
    loading: "Suppression…",
    confirm: "Supprimer définitivement mon compte",
    cancel: "Annuler",
  },
  en: {
    start: "Delete my account",
    warning:
      "This action is permanent: all your profiles, charts, unlocks and your subscription (if any) will be deleted. Confirm with your password.",
    password: "Password",
    genericError: "Something went wrong.",
    loading: "Deleting…",
    confirm: "Permanently delete my account",
    cancel: "Cancel",
  },
};

export function DeleteAccountForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.get("password"), locale }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.genericError);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-border-soft px-3 py-1.5 text-sm text-muted hover:text-terracotta"
      >
        {t.start}
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-terracotta">{t.warning}</p>
      <PasswordInput
        name="password"
        required
        placeholder={t.password}
        autoComplete="current-password"
        locale={locale}
        className="max-w-xs"
      />
      {error && <p className="text-sm text-terracotta">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" loading={loading} className="border-terracotta/50 text-terracotta">
          {loading ? t.loading : t.confirm}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border-soft px-3 py-1.5 text-sm text-muted"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
