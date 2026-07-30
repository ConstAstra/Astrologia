"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";

const FEATURE_LABELS: Record<string, { title: string; description: string }> = {
  synastry: {
    title: "Débloquer cette synastrie",
    description:
      "Découvrez les aspects croisés entre les deux thèmes et la superposition des maisons — analyse complète, à vous pour toujours une fois débloquée.",
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
};

export function UnlockGate({
  feature,
  profileIdA,
  profileIdB,
  credits,
}: {
  feature: "synastry" | "composite" | "astrocartography";
  profileIdA: string;
  profileIdB?: string;
  credits: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = FEATURE_LABELS[feature];

  async function handleUnlock() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, profileIdA, profileIdB }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <Eyebrow>Contenu Premium</Eyebrow>
      <h2 className="font-display mt-3 text-2xl">{meta.title}</h2>
      <p className="mt-3 text-sm text-muted">{meta.description}</p>

      <div className="mt-6 space-y-3">
        {credits > 0 ? (
          <Button className="w-full" disabled={loading} onClick={handleUnlock}>
            {loading ? "Un instant…" : `Débloquer avec 1 crédit (${credits} disponible${credits > 1 ? "s" : ""})`}
          </Button>
        ) : (
          <ButtonLink href="/tarifs" className="w-full">
            Acheter des crédits
          </ButtonLink>
        )}
        <ButtonLink href="/tarifs" variant="secondary" className="w-full">
          Passer Premium (illimité)
        </ButtonLink>
      </div>
      {error && <p className="mt-3 text-xs text-terracotta">{error}</p>}
      <p className="mt-4 text-xs text-muted/70">
        Déjà abonné ou crédité ailleurs ?{" "}
        <Link href="/dashboard/abonnement" className="underline">
          Vérifier mon abonnement
        </Link>
      </p>
    </Card>
  );
}
