"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GeocodeResult } from "@/app/api/geocode/route";
import type { Aspect, EclipticPoint, PointKey } from "@/lib/astro/types";
import type { WheelPoint } from "@/components/chart/ChartWheel";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { OverviewCard } from "@/components/chart/OverviewCard";
import { Button } from "@/components/ui/Button";
import { CelestialSpinner } from "@/components/ui/CelestialSpinner";
import { safeJson } from "@/lib/safe-json";
import { DRAFT_STORAGE_KEY } from "./draftStorage";

type Locale = "fr" | "en";

interface ApiResult {
  points: Partial<Record<PointKey, EclipticPoint>>;
  hasReliableHouses: boolean;
  ascendant: number;
  houseCusps: number[];
  wheelPoints: WheelPoint[];
  aspects: Aspect[];
  chartHighlights: string[];
}

const TEXT: Record<
  Locale,
  {
    name: string;
    namePlaceholder: string;
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
    generate: string;
    generating: string;
    resultHeading: (name: string) => string;
    ctaTitle: string;
    ctaBody: string;
    ctaLink: string;
    alreadyHaveAccount: string;
    logIn: string;
    tryAnother: string;
  }
> = {
  fr: {
    name: "Ton prénom (pour t'y retrouver)",
    namePlaceholder: "Moi",
    birthDate: "Date de naissance",
    birthTime: "Heure de naissance",
    timeUnknown: "Heure inconnue (Ascendant et maisons désactivés)",
    location: "Lieu de naissance",
    locationPlaceholder: "Ex : Lyon, France",
    searching: "Recherche…",
    timezoneDetected: (tz) => `Fuseau détecté : ${tz}`,
    errorNoLocation: "Choisis un lieu de naissance dans la liste proposée.",
    errorNoDate: "La date de naissance est requise.",
    errorNoTime: "Indique l'heure de naissance, ou coche \"heure inconnue\".",
    generate: "Voir mon thème",
    generating: "Calcul en cours…",
    resultHeading: (name) => `Le thème de ${name}`,
    ctaTitle: "Envie de le garder ?",
    ctaBody:
      "Ce thème n'est enregistré nulle part pour l'instant. Crée un compte gratuit pour le sauvegarder, le retrouver plus tard, et voir l'interprétation complète (positions détaillées, maisons, aspects).",
    ctaLink: "Créer mon compte gratuit pour le sauvegarder →",
    alreadyHaveAccount: "Déjà un compte ?",
    logIn: "Se connecter pour l'enregistrer",
    tryAnother: "Recommencer avec une autre date",
  },
  en: {
    name: "Your first name (so you can tell it apart)",
    namePlaceholder: "Me",
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
    generate: "See my chart",
    generating: "Calculating…",
    resultHeading: (name) => `${name}'s chart`,
    ctaTitle: "Want to keep it?",
    ctaBody:
      "This chart isn't saved anywhere yet. Create a free account to save it, come back to it later, and see the full interpretation (detailed positions, houses, aspects).",
    ctaLink: "Create my free account to save it →",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log in to save it",
    tryAnother: "Start over with another date",
  },
};

export function NatalChartTeaserForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const router = useRouter();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);

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

  async function handleGenerate() {
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

    setBusy(true);
    try {
      const res = await fetch("/api/public/natal-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime: timeUnknown ? null : birthTime,
          timeUnknown,
          latitude: selected.latitude,
          longitude: selected.longitude,
          tzName: selected.tzName,
          locale,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.errorNoDate);
      setResult(data as ApiResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorNoDate);
    } finally {
      setBusy(false);
    }
  }

  function saveDraftAndNavigate(destination: "register" | "login") {
    if (!selected) return;
    const draft = {
      label: name.trim() || t.namePlaceholder,
      isSelf: true,
      birthDate,
      birthTime: timeUnknown ? null : birthTime,
      timeUnknown,
      locationName: selected.label,
      latitude: selected.latitude,
      longitude: selected.longitude,
      tzName: selected.tzName,
    };
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Stockage indisponible (navigation privée stricte, quota…) : on
      // continue quand même, la personne recréera simplement son profil à
      // la main une fois connectée.
    }
    const next = "/dashboard/profils/reclamer";
    if (destination === "register") {
      router.push(locale === "en" ? `/en/signup?next=${next}` : `/inscription?next=${next}`);
    } else {
      router.push(locale === "en" ? `/en/login?next=${next}` : `/connexion?next=${next}`);
    }
  }

  if (result) {
    const displayName = name.trim() || t.namePlaceholder;
    return (
      <div>
        <div className="text-center">
          <h2 className="font-display text-2xl">{t.resultHeading(displayName)}</h2>
        </div>

        {result.chartHighlights.length > 0 && (
          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-border-soft bg-background-elevated p-4 text-center text-sm text-foreground">
            {result.chartHighlights[0]}
          </div>
        )}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          <div className="mx-auto w-full max-w-sm">
            <ChartWheel
              points={result.wheelPoints}
              ascendant={result.ascendant}
              houseCusps={result.houseCusps}
              aspects={result.aspects}
              locale={locale}
              interactive
            />
          </div>
          <OverviewCard points={result.points} hasReliableHouses={result.hasReliableHouses} locale={locale} />
        </div>

        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gold/40 bg-gold/5 p-6 text-center">
          <p className="font-display text-lg">{t.ctaTitle}</p>
          <p className="mt-2 text-sm text-muted">{t.ctaBody}</p>
          <div className="mt-4">
            <Button type="button" onClick={() => saveDraftAndNavigate("register")}>
              {t.ctaLink}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            {t.alreadyHaveAccount}{" "}
            <button
              type="button"
              onClick={() => saveDraftAndNavigate("login")}
              className="text-gold-strong underline hover:text-gold"
            >
              {t.logIn}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button type="button" onClick={() => setResult(null)} className="text-xs text-muted underline hover:text-foreground">
            {t.tryAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="teaser-name">
            {t.name}
          </label>
          <input
            id="teaser-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={24}
            className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="teaser-date">
              {t.birthDate}
            </label>
            <input
              id="teaser-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="teaser-time">
              {t.birthTime}
            </label>
            <input
              id="teaser-time"
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
          <label className="mb-1 block text-sm text-muted" htmlFor="teaser-location">
            {t.location}
          </label>
          <div className="relative">
            <input
              id="teaser-location"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="w-full rounded-lg border border-border-soft bg-background-elevated py-2.5 pl-4 pr-9 text-sm outline-none focus:border-gold/60"
              autoComplete="off"
            />
            {searching && (
              <CelestialSpinner
                variant="moon"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
            )}
          </div>
          <p className="sr-only" role="status">
            {searching ? t.searching : ""}
          </p>
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

        <Button type="button" onClick={handleGenerate} loading={busy} className="w-full">
          {busy ? t.generating : t.generate}
        </Button>
      </div>
    </div>
  );
}
