"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { playMagicChime } from "@/lib/sound";
import { safeJson } from "@/lib/safe-json";

type Locale = "fr" | "en";

const FEATURE_LABELS: Record<Locale, Record<string, { title: string; description: string }>> = {
  fr: {
    synastry: {
      title: "Débloquer cette synastrie",
      description:
        "Découvrez les aspects croisés entre les deux thèmes et la superposition des maisons : analyse complète, à vous pour toujours une fois débloquée.",
    },
    composite: {
      title: "Débloquer ce thème composite",
      description:
        "Le thème du couple lui-même, calculé par la méthode des points médians, avec sa roue et ses aspects internes.",
    },
    astrocartography: {
      title: "Débloquer cette cartographie",
      description:
        "Vos lignes planétaires (MC, IC, Ascendant, Descendant) projetées sur la carte du monde, avec leur interprétation.",
    },
    synthesis: {
      title: "Débloquer la lecture de synthèse",
      description:
        "Une lecture d'ensemble qui relie Big 3, dominantes, maître de l'Ascendant, contradictions internes et aspects porteurs en un seul récit cohérent, plutôt que des placements isolés à interpréter soi-même.",
    },
    lifeMission: {
      title: "Débloquer le développement complet",
      description:
        "Au-delà du résumé : le Nœud Sud (ce qu'il faut lâcher), les maisons des deux nœuds, le maître de ton Nœud Nord (comment avancer concrètement) et les aspects qui soutiennent ou compliquent cette trajectoire.",
    },
  },
  en: {
    synastry: {
      title: "Unlock this synastry",
      description:
        "Discover the cross-aspects between the two charts and the house overlay — full analysis, yours forever once unlocked.",
    },
    composite: {
      title: "Unlock this composite chart",
      description: "The couple's own chart, calculated with the midpoint method, with its wheel and internal aspects.",
    },
    astrocartography: {
      title: "Unlock this astrocartography",
      description: "Your planetary lines (MC, IC, Ascendant, Descendant) projected on the world map, with their interpretation.",
    },
    synthesis: {
      title: "Unlock the synthesis reading",
      description:
        "A holistic reading that ties Big 3, dominances, Ascendant ruler, internal contradictions and standout aspects into one coherent narrative, instead of isolated placements you have to interpret yourself.",
    },
    lifeMission: {
      title: "Unlock the full development",
      description:
        "Beyond the summary: the South Node (what to release), both nodes' houses, your North Node's ruler (how to actually move forward), and the aspects that support or complicate this path.",
    },
  },
};

const TEXT: Record<
  Locale,
  {
    premiumContent: string;
    loading: string;
    unlockWithCredit: (credits: number) => string;
    buyCredits: string;
    goPremium: string;
    genericError: string;
    alreadySubscribed: string;
    checkSubscription: string;
    pricingHref: string;
  }
> = {
  fr: {
    premiumContent: "Contenu Premium",
    loading: "Un instant…",
    unlockWithCredit: (credits) => `Débloquer avec 1 crédit (${credits} disponible${credits > 1 ? "s" : ""})`,
    buyCredits: "Acheter des crédits",
    goPremium: "Passer Premium (illimité)",
    genericError: "Erreur",
    alreadySubscribed: "Déjà abonné ou crédité ailleurs ?",
    checkSubscription: "Vérifier mon abonnement",
    pricingHref: "/tarifs",
  },
  en: {
    premiumContent: "Premium content",
    loading: "One moment…",
    unlockWithCredit: (credits) => `Unlock with 1 credit (${credits} available)`,
    buyCredits: "Buy credits",
    goPremium: "Go Premium (unlimited)",
    genericError: "Error",
    alreadySubscribed: "Already subscribed or credited elsewhere?",
    checkSubscription: "Check my subscription",
    pricingHref: "/en/pricing",
  },
};

export function UnlockGate({
  feature,
  profileIdA,
  profileIdB,
  credits,
  locale = "fr",
  compact = false,
}: {
  feature: "synastry" | "composite" | "astrocartography" | "synthesis" | "lifeMission";
  profileIdA: string;
  profileIdB?: string;
  credits: number;
  locale?: Locale;
  // Utilisé quand la carte s'insère au milieu d'une lecture déjà riche
  // (thème natal) plutôt que d'être seule sur la page : moins de padding,
  // boutons côte à côte, pour ne pas faire mur et casser l'élan du scroll.
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const meta = FEATURE_LABELS[locale][feature];
  const t = TEXT[locale];

  async function handleUnlock() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, profileIdA, profileIdB }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.genericError);
      playMagicChime();
      // Un battement de lumière avant de rafraîchir : sans lui, la carte
      // disparaît instantanément au profit du contenu débloqué, et l'action
      // ne se ressent pas vraiment comme un déblocage.
      setJustUnlocked(true);
      setLoading(false);
      setTimeout(() => router.refresh(), 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.genericError);
      setLoading(false);
    }
  }

  return (
    <Card className={`relative overflow-hidden ${compact ? "p-6" : "mx-auto max-w-lg p-8 text-center"}`}>
      {justUnlocked && <span className="unlock-halo pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true" />}
      <Eyebrow>{t.premiumContent}</Eyebrow>
      <h2 className={compact ? "font-display mt-2 text-xl" : "font-display mt-3 text-2xl"}>{meta.title}</h2>
      <p className="mt-3 text-sm text-muted">{meta.description}</p>

      <div className={compact ? "mt-5 flex flex-wrap gap-3" : "mt-6 space-y-3"}>
        {credits > 0 ? (
          <Button className={compact ? "" : "w-full"} loading={loading} onClick={handleUnlock}>
            {loading ? t.loading : t.unlockWithCredit(credits)}
          </Button>
        ) : (
          <ButtonLink href={t.pricingHref} className={compact ? "" : "w-full"}>
            {t.buyCredits}
          </ButtonLink>
        )}
        <ButtonLink href={t.pricingHref} variant="secondary" className={`cta-glow ${compact ? "" : "w-full"}`}>
          {t.goPremium}
        </ButtonLink>
      </div>
      {error && <p className="mt-3 text-xs text-terracotta">{error}</p>}
      <p className={compact ? "mt-3 text-xs text-muted/70" : "mt-4 text-xs text-muted/70"}>
        {t.alreadySubscribed}{" "}
        <Link href="/dashboard/abonnement" className="underline">
          {t.checkSubscription}
        </Link>
      </p>
    </Card>
  );
}
