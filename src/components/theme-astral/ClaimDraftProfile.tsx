"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CelestialSpinner } from "@/components/ui/CelestialSpinner";
import { safeJson } from "@/lib/safe-json";
import { DRAFT_STORAGE_KEY } from "./draftStorage";

type Locale = "fr" | "en";

const TEXT: Record<Locale, { saving: string; failed: string }> = {
  fr: { saving: "Enregistrement de votre thème…", failed: "Impossible d'enregistrer ce thème. Créez-le à la main." },
  en: { saving: "Saving your chart…", failed: "Could not save this chart. Create it by hand instead." },
};

/**
 * Finalise, juste après l'inscription, le profil dont les informations de
 * naissance ont été saisies anonymement sur /theme-astral (voir
 * NatalChartTeaserForm) — sans cette étape, la personne aurait dû ressaisir
 * sa date/heure/lieu de naissance une seconde fois juste après avoir créé
 * son compte, ce qui aurait annulé tout l'intérêt de l'avoir laissée voir
 * son thème avant de s'inscrire.
 */
export function ClaimDraftProfile({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const claimedRef = useRef(false);

  useEffect(() => {
    if (claimedRef.current) return;
    claimedRef.current = true;

    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      raw = null;
    }

    if (!raw) {
      router.replace("/dashboard/profils/nouveau");
      return;
    }

    (async () => {
      try {
        const draft = JSON.parse(raw!);
        const res = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.error ?? "failed");
        router.replace(`/dashboard/theme-natal/${data.profile.id}`);
      } catch {
        setFailed(true);
        setTimeout(() => router.replace("/dashboard/profils/nouveau"), 2000);
      }
    })();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-sm text-muted">
      {!failed && <CelestialSpinner variant="sun" className="h-8 w-8 text-gold-strong" />}
      <p>{failed ? t.failed : t.saving}</p>
    </div>
  );
}
