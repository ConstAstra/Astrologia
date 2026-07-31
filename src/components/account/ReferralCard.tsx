"use client";

import { useState } from "react";

export function ReferralCard({ referralUrl, successfulReferrals }: { referralUrl: string; successfulReferrals: number }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission refusée...) : rien de grave, l'utilisateur peut copier le lien à la main.
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Invitez un proche : vous recevez chacun <span className="text-gold-strong">2 crédits offerts</span> dès son
        premier achat.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={referralUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-border-soft bg-background-elevated px-3 py-2 text-xs text-muted"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full border border-gold/40 px-3 py-2 text-xs text-gold-strong hover:bg-gold/10"
        >
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
      {successfulReferrals > 0 && (
        <p className="mt-2 text-xs text-muted/70">
          {successfulReferrals} filleul{successfulReferrals > 1 ? "s" : ""} converti{successfulReferrals > 1 ? "s" : ""} jusqu&apos;ici — merci !
        </p>
      )}
    </div>
  );
}
