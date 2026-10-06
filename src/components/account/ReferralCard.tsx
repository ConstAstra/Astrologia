"use client";

import { useState } from "react";
import { playSoftChime } from "@/lib/sound";
import { Badge } from "@/components/ui/Card";

const TEXT = {
  fr: {
    invite: (
      <>
        Invitez un proche : vous recevez chacun <span className="text-gold-strong">2 crédits offerts</span> dès son
        premier achat.
      </>
    ),
    copy: "Copier",
    copied: "Copié !",
    convertedBadge: (n: number) => `+${n * 2} crédits gagnés`,
    converted: (n: number) => `${n} filleul${n > 1 ? "s" : ""} converti${n > 1 ? "s" : ""} jusqu'ici, merci !`,
  },
  en: {
    invite: (
      <>
        Invite someone: you each get <span className="text-gold-strong">2 free credits</span> as soon as they make
        their first purchase.
      </>
    ),
    copy: "Copy",
    copied: "Copied!",
    convertedBadge: (n: number) => `+${n * 2} credits earned`,
    converted: (n: number) => `${n} referral${n > 1 ? "s" : ""} converted so far, thank you!`,
  },
};

export function ReferralCard({
  referralUrl,
  successfulReferrals,
  locale = "fr",
}: {
  referralUrl: string;
  successfulReferrals: number;
  locale?: "fr" | "en";
}) {
  const t = TEXT[locale];
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      playSoftChime();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission refusée...) : rien de grave, l'utilisateur peut copier le lien à la main.
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">{t.invite}</p>
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
          className={`shrink-0 rounded-full border px-3 py-2 text-xs transition-all duration-300 ${
            copied
              ? "scale-105 border-sage/60 bg-sage/10 text-sage"
              : "border-gold/40 text-gold-strong hover:bg-gold/10"
          }`}
        >
          {copied ? `✓ ${t.copied}` : t.copy}
        </button>
      </div>
      {successfulReferrals > 0 && (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted/70">
          <Badge tone="pop">{t.convertedBadge(successfulReferrals)}</Badge>
          {t.converted(successfulReferrals)}
        </p>
      )}
    </div>
  );
}
