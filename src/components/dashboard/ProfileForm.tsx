"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { GeocodeResult } from "@/app/api/geocode/route";
import { safeJson } from "@/lib/safe-json";

type Locale = "fr" | "en";

const TEXT: Record<Locale, {
  labelField: string;
  labelPlaceholder: string;
  isSelf: string;
  birthDate: string;
  birthTime: string;
  timeUnknown: string;
  location: string;
  locationPlaceholder: string;
  searching: string;
  timezoneDetected: (tz: string) => string;
  errorNoLocation: string;
  errorNoDate: string;
  errorNoTime: string;
  errorCreate: string;
  errorGeneric: string;
  submitting: string;
  submit: string;
}> = {
  fr: {
    labelField: "Nom / prénom (pour vous y retrouver)",
    labelPlaceholder: "Ex : Moi, Camille, Papa…",
    isSelf: "C'est mon propre thème",
    birthDate: "Date de naissance",
    birthTime: "Heure de naissance",
    timeUnknown: "Heure inconnue (Ascendant et maisons désactivés)",
    location: "Lieu de naissance",
    locationPlaceholder: "Ex : Lyon, France",
    searching: "Recherche…",
    timezoneDetected: (tz) => `Fuseau détecté : ${tz}`,
    errorNoLocation: "Choisissez un lieu de naissance dans la liste proposée.",
    errorNoDate: "La date de naissance est requise.",
    errorNoTime: "Indiquez l'heure de naissance, ou cochez \"heure inconnue\".",
    errorCreate: "Erreur lors de la création du profil.",
    errorGeneric: "Une erreur est survenue.",
    submitting: "Calcul en cours…",
    submit: "Créer le profil et voir le thème",
  },
  en: {
    labelField: "Name (so you can tell profiles apart)",
    labelPlaceholder: "E.g.: Me, Camille, Dad…",
    isSelf: "This is my own chart",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timeUnknown: "Unknown time (Ascendant and houses disabled)",
    location: "Birth place",
    locationPlaceholder: "E.g.: Lyon, France",
    searching: "Searching…",
    timezoneDetected: (tz) => `Detected time zone: ${tz}`,
    errorNoLocation: "Choose a birth place from the suggested list.",
    errorNoDate: "Birth date is required.",
    errorNoTime: "Enter the birth time, or check \"unknown time\".",
    errorCreate: "Error creating the profile.",
    errorGeneric: "Something went wrong.",
    submitting: "Calculating…",
    submit: "Create the profile and view the chart",
  },
};

export function ProfileForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
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
        const data = await safeJson(res);
        setResults(data?.results ?? []);
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
      setError(t.errorNoLocation);
      return;
    }
    if (!birthDate) {
      setError(t.errorNoDate);
      return;
    }
    if (!timeUnknown && !birthTime) {
      setError(t.errorNoTime);
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
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.errorCreate);
      router.push(`/dashboard/theme-natal/${data.profile.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="label">
          {t.labelField}
        </label>
        <input
          id="label"
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          placeholder={t.labelPlaceholder}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={isSelf} onChange={(e) => setIsSelf(e.target.checked)} />
        {t.isSelf}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="birthDate">
            {t.birthDate}
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
            {t.birthTime}
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
            {t.timeUnknown}
          </label>
        </div>
      </div>

      <div className="relative">
        <label className="mb-1 block text-sm text-muted" htmlFor="location">
          {t.location}
        </label>
        <input
          id="location"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={t.locationPlaceholder}
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          autoComplete="off"
        />
        {searching && <p className="mt-1 text-xs text-muted">{t.searching}</p>}
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
        {selected && <p className="mt-1 text-xs text-sage">{t.timezoneDetected(selected.tzName)}</p>}
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <Button type="submit" loading={submitting} className="w-full">
        {submitting ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
