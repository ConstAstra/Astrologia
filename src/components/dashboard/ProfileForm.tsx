"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { GeocodeResult } from "@/app/api/geocode/route";

export function ProfileForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [isSelf, setIsSelf] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (selected && value !== selected.label) setSelected(null);
  }

  useEffect(() => {
    if (selected && query === selected.label) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 3) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selected) {
      setError("Choisissez un lieu de naissance dans la liste proposée.");
      return;
    }
    if (!birthDate) {
      setError("La date de naissance est requise.");
      return;
    }
    if (!timeUnknown && !birthTime) {
      setError("Indiquez l'heure de naissance, ou cochez \"heure inconnue\".");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          isSelf,
          birthDate,
          birthTime: timeUnknown ? null : birthTime,
          timeUnknown,
          locationName: selected.label,
          latitude: selected.latitude,
          longitude: selected.longitude,
          tzName: selected.tzName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la création du profil.");
      router.push(`/dashboard/theme-natal/${data.profile.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="label">
          Nom / prénom (pour vous y retrouver)
        </label>
        <input
          id="label"
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          placeholder="Ex : Moi, Camille, Papa…"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={isSelf} onChange={(e) => setIsSelf(e.target.checked)} />
        C&apos;est mon propre thème
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="birthDate">
            Date de naissance
          </label>
          <input
            id="birthDate"
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="birthTime">
            Heure de naissance
          </label>
          <input
            id="birthTime"
            type="time"
            disabled={timeUnknown}
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60 disabled:opacity-40"
          />
          <label className="mt-1 flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
            Heure inconnue (Ascendant et maisons désactivés)
          </label>
        </div>
      </div>

      <div className="relative">
        <label className="mb-1 block text-sm text-muted" htmlFor="location">
          Lieu de naissance
        </label>
        <input
          id="location"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Ex : Lyon, France"
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          autoComplete="off"
        />
        {searching && <p className="mt-1 text-xs text-muted">Recherche…</p>}
        {results.length > 0 && !selected && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border-soft bg-background-elevated shadow-lg">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(r);
                    setQuery(r.label);
                    setResults([]);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gold/10"
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {selected && <p className="mt-1 text-xs text-sage">Fuseau détecté : {selected.tzName}</p>}
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Calcul en cours…" : "Créer le profil et voir le thème"}
      </Button>
    </form>
  );
}
