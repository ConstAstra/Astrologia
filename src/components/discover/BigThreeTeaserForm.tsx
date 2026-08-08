"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GeocodeResult } from "@/app/api/geocode/route";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import type { ZodiacSign } from "@/lib/astro/types";
import { Button } from "@/components/ui/Button";
import { playSoftChime } from "@/lib/sound";

type Locale = "fr" | "en";

interface ApiResult {
  big3: { sun: ZodiacSign; moon: ZodiacSign; ascendant: ZodiacSign | null };
  dominantElement: string | null;
}

// Clé sessionStorage lue par ProfileForm à l'arrivée sur
// /dashboard/profils/nouveau juste après l'inscription — évite de faire
// retaper une deuxième fois la date/heure/lieu de naissance déjà saisis
// ici, le point de friction n°1 d'un premier passage sur l'app.
const PENDING_PROFILE_KEY = "astrologium_pending_profile";

const ELEMENT_LABEL: Record<Locale, Record<string, string>> = {
  fr: { Feu: "Feu", Terre: "Terre", Air: "Air", Eau: "Eau" },
  en: { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" },
};

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
    generate: string;
    generating: string;
    resultHeading: (name: string) => string;
    sun: string;
    moon: string;
    asc: string;
    dominant: (element: string) => string;
    ctaTitle: string;
    ctaBody: string;
    ctaLink: string;
    tryAnother: string;
    horoscopeLink: string;
  }
> = {
  fr: {
    name: "Ton prénom (facultatif)",
    namePlaceholder: "Toi",
    birthDate: "Date de naissance",
    birthTime: "Heure de naissance",
    timeUnknown: "Heure inconnue (pas d'Ascendant)",
    location: "Lieu de naissance",
    locationPlaceholder: "Ex : Lyon, France",
    searching: "Recherche…",
    timezoneDetected: (tz) => `Fuseau détecté : ${tz}`,
    errorNoLocation: "Choisis un lieu de naissance dans la liste proposée.",
    errorNoDate: "La date de naissance est requise.",
    generate: "Voir mon thème",
    generating: "Calcul en cours…",
    resultHeading: (name) => `${name}, voici ton Big 3`,
    sun: "Soleil",
    moon: "Lune",
    asc: "Ascendant",
    dominant: (element) => `Dominante ${element}`,
    ctaTitle: "Ce n'est qu'un aperçu",
    ctaBody:
      "Le thème complet (maisons, aspects, synastrie, transits du jour) reste gratuit à l'inscription — et ta date de naissance est déjà enregistrée, pas besoin de la retaper.",
    ctaLink: "Créer mon compte gratuit, sans retaper mes infos →",
    tryAnother: "Essayer un autre thème",
    horoscopeLink: "Voir l'horoscope du jour de mon signe solaire →",
  },
  en: {
    name: "Your first name (optional)",
    namePlaceholder: "You",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timeUnknown: "Unknown time (no Ascendant)",
    location: "Birth place",
    locationPlaceholder: "E.g.: Lyon, France",
    searching: "Searching…",
    timezoneDetected: (tz) => `Detected time zone: ${tz}`,
    errorNoLocation: "Choose a birth place from the suggested list.",
    errorNoDate: "Birth date is required.",
    generate: "See my chart",
    generating: "Calculating…",
    resultHeading: (name) => `${name}, here's your Big 3`,
    sun: "Sun",
    moon: "Moon",
    asc: "Ascendant",
    dominant: (element) => `${element}-dominant`,
    ctaTitle: "This is just a preview",
    ctaBody:
      "The full chart (houses, aspects, synastry, today's transits) stays free when you sign up — and your birth data is already saved, no need to type it again.",
    ctaLink: "Create my free account, no retyping →",
    tryAnother: "Try another chart",
    horoscopeLink: "See today's horoscope for my sun sign →",
  },
};

export function BigThreeTeaserForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const elementLabel = ELEMENT_LABEL[locale];

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

    setBusy(true);
    try {
      const res = await fetch("/api/public/big-three", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime: timeUnknown ? null : birthTime,
          timeUnknown,
          latitude: selected.latitude,
          longitude: selected.longitude,
          tzName: selected.tzName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.errorNoDate);
      setResult(data as ApiResult);

      try {
        sessionStorage.setItem(
          PENDING_PROFILE_KEY,
          JSON.stringify({
            label: name.trim(),
            birthDate,
            birthTime: timeUnknown ? "" : birthTime,
            timeUnknown,
            locationLabel: selected.label,
            latitude: selected.latitude,
            longitude: selected.longitude,
            tzName: selected.tzName,
          })
        );
      } catch {
        // sessionStorage indisponible (navigation privée stricte...) — pas
        // grave, l'utilisateur retapera simplement ses infos à l'inscription.
      }

      playSoftChime();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorNoDate);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const displayName = name.trim() || t.namePlaceholder;
    return (
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-2xl">{t.resultHeading(displayName)}</h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border-soft bg-background-elevated p-5">
            <p className="text-xs text-muted">{t.sun}</p>
            <p className="mt-1 text-2xl">{signMap[result.big3.sun].symbol}</p>
            <p className="mt-1 text-sm text-gold-strong">{signMap[result.big3.sun].name}</p>
          </div>
          <div className="rounded-2xl border border-border-soft bg-background-elevated p-5">
            <p className="text-xs text-muted">{t.moon}</p>
            <p className="mt-1 text-2xl">{signMap[result.big3.moon].symbol}</p>
            <p className="mt-1 text-sm text-gold-strong">{signMap[result.big3.moon].name}</p>
          </div>
          <div className="rounded-2xl border border-border-soft bg-background-elevated p-5">
            <p className="text-xs text-muted">{t.asc}</p>
            {result.big3.ascendant ? (
              <>
                <p className="mt-1 text-2xl">{signMap[result.big3.ascendant].symbol}</p>
                <p className="mt-1 text-sm text-gold-strong">{signMap[result.big3.ascendant].name}</p>
              </>
            ) : (
              <p className="mt-3 text-xs text-muted">—</p>
            )}
          </div>
        </div>

        {result.dominantElement && (
          <p className="mt-4 text-sm text-muted">{t.dominant(elementLabel[result.dominantElement] ?? result.dominantElement)}</p>
        )}

        <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <p className="font-display text-lg">{t.ctaTitle}</p>
          <p className="mt-2 text-sm text-muted">{t.ctaBody}</p>
          <Link
            href={locale === "en" ? "/en/signup?next=/dashboard/profils/nouveau" : "/inscription?next=/dashboard/profils/nouveau"}
            className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-background"
          >
            {t.ctaLink}
          </Link>
        </div>

        <Link
          href={`${locale === "en" ? "/en/horoscope" : "/horoscope"}/${result.big3.sun}`}
          className="mt-4 block text-sm text-gold-strong underline"
        >
          {t.horoscopeLink}
        </Link>

        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-4 text-sm text-muted underline hover:text-foreground"
        >
          {t.tryAnother}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="big3-name">
          {t.name}
        </label>
        <input
          id="big3-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          maxLength={24}
          className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="big3-date">
            {t.birthDate}
          </label>
          <input
            id="big3-date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted" htmlFor="big3-time">
            {t.birthTime}
          </label>
          <input
            id="big3-time"
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

      <div className="relative mt-4">
        <label className="mb-1 block text-sm text-muted" htmlFor="big3-location">
          {t.location}
        </label>
        <input
          id="big3-location"
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

      {error && <p className="mt-4 text-sm text-terracotta">{error}</p>}

      <Button type="button" onClick={handleGenerate} disabled={busy} className="mt-6 w-full">
        {busy ? t.generating : t.generate}
      </Button>
    </div>
  );
}
