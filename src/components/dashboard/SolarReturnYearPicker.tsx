"use client";

import { useRouter } from "next/navigation";

const TEXT = {
  fr: { label: "Année" },
  en: { label: "Year" },
};

/**
 * Choix explicite de l'année d'anniversaire à consulter (par défaut, la
 * page affiche le cycle en cours) — la révolution solaire d'une année
 * passée ou future reste un calcul valide, pas seulement celle "active"
 * aujourd'hui.
 */
export function SolarReturnYearPicker({
  profileId,
  selectedYear,
  minYear,
  maxYear,
  locale = "fr",
}: {
  profileId: string;
  selectedYear: number;
  minYear: number;
  maxYear: number;
  locale?: "fr" | "en";
}) {
  const router = useRouter();
  const t = TEXT[locale];

  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted">
      {t.label}
      <select
        value={selectedYear}
        onChange={(e) => router.push(`/dashboard/revolution-solaire/${profileId}?annee=${e.target.value}`)}
        className="rounded-full border border-border-soft bg-surface px-3 py-1.5 text-sm text-foreground"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
