"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TEXT = {
  fr: { deleting: "Suppression…", confirm: "Confirmer ?", delete: "Supprimer" },
  en: { deleting: "Deleting…", confirm: "Confirm?", delete: "Delete" },
};

export function DeleteProfileButton({ profileId, locale = "fr" }: { profileId: string; locale?: "fr" | "en" }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = TEXT[locale];

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-full border border-terracotta/50 px-3 py-1 text-terracotta"
      >
        {loading ? t.deleting : t.confirm}
      </button>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-full border border-border-soft px-3 py-1 text-muted hover:text-terracotta"
    >
      {t.delete}
    </button>
  );
}
