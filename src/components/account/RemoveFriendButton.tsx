"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TEXT = {
  fr: { remove: "Retirer", confirm: "Confirmer ?", removing: "…" },
  en: { remove: "Remove", confirm: "Confirm?", removing: "…" },
};

/** Confirmation en deux clics plutôt qu'une popup — retirer un ami est irréversible pour lui aussi (l'amitié disparaît des deux côtés). */
export function RemoveFriendButton({ friendUserId, locale = "fr" }: { friendUserId: string; locale?: "fr" | "en" }) {
  const t = TEXT[locale];
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await fetch(`/api/friends/${friendUserId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => (confirming ? remove() : setConfirming(true))}
      onBlur={() => setConfirming(false)}
      disabled={busy}
      className={`text-xs underline decoration-dotted disabled:opacity-60 ${
        confirming ? "text-terracotta" : "text-muted/60 hover:text-muted"
      }`}
    >
      {busy ? t.removing : confirming ? t.confirm : t.remove}
    </button>
  );
}
