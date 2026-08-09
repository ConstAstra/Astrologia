"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GeocodeResult } from "@/app/api/geocode/route";
import type { WorldMapData } from "@/components/map/ProjectedLine";
import type { CountryLineMatch } from "@/lib/astro/astrocartography-countries";
import { AstrocartographyMap } from "@/components/map/AstrocartographyMap";
import { MAJOR_COUNTRIES } from "@/components/map/majorCountries";
import { MAJOR_COUNTRIES_EN } from "@/components/map/majorCountries.en";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import type { ZodiacSign } from "@/lib/astro/types";
import { Button } from "@/components/ui/Button";
import { playSoftChime } from "@/lib/sound";
import { safeJson } from "@/lib/safe-json";

type Locale = "fr" | "en";

interface ApiResult {
  mapData: WorldMapData;
  countryMatches: Record<string, CountryLineMatch[]>;
  big3: { sun: ZodiacSign; moon: ZodiacSign; ascendant: ZodiacSign | null };
}

const TEXT: Record<
  Locale,
  {
    name: string;
    namePlaceholder: string;
    birthDate: string;
    birthTime: string;
    timeRequiredNote: string;
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
    bigThree: (sun: string, moon: string, asc: string | null) => string;
    ctaTitle: string;
    ctaBody: string;
    ctaLink: string;
    tryAnother: string;
    shareCountry: (name: string) => string;
    sharing: string;
    shareStory: string;
  }
> = {
  fr: {
    name: "Ton prénom (facultatif, juste pour l'affichage)",
    namePlaceholder: "Toi",
    birthDate: "Date de naissance",
    birthTime: "Heure de naissance",
    timeRequiredNote:
      "L'heure exacte est indispensable ici : elle détermine l'Ascendant et le Milieu du Ciel dont dépendent toutes les lignes de la carte. Sans heure précise, on ne peut pas produire une carte fiable.",
    location: "Lieu de naissance",
    locationPlaceholder: "Ex : Lyon, France",
    searching: "Recherche…",
    timezoneDetected: (tz) => `Fuseau détecté : ${tz}`,
    errorNoLocation: "Choisis un lieu de naissance dans la liste proposée.",
    errorNoDate: "La date de naissance est requise.",
    errorNoTime: "L'heure de naissance est requise pour cet outil.",
    generate: "Calculer ma carte",
    generating: "Calcul en cours…",
    resultHeading: (name) => `La carte de ${name}`,
    bigThree: (sun, moon, asc) => `☉ ${sun} · ☾ ${moon}${asc ? ` · ASC ${asc}` : ""}`,
    ctaTitle: "Envie d'aller plus loin ?",
    ctaBody:
      "Ceci reste une exploration libre de tes lignes. Avec un compte gratuit, retrouve cette carte sauvegardée, et débloque le classement des meilleurs pays pour toi par thème (amour, carrière, spiritualité, voyage).",
    ctaLink: "Créer mon compte gratuit →",
    tryAnother: "Recommencer avec un autre thème",
    shareCountry: (name) => `⤓ Partager « ${name} »`,
    sharing: "…",
    shareStory: "⤓ Story",
  },
  en: {
    name: "Your first name (optional, display only)",
    namePlaceholder: "You",
    birthDate: "Birth date",
    birthTime: "Birth time",
    timeRequiredNote:
      "The exact time is essential here: it determines the Ascendant and Midheaven that every line on the map depends on. Without a precise time, we can't produce a reliable map.",
    location: "Birth place",
    locationPlaceholder: "E.g.: Lyon, France",
    searching: "Searching…",
    timezoneDetected: (tz) => `Detected time zone: ${tz}`,
    errorNoLocation: "Choose a birth place from the suggested list.",
    errorNoDate: "Birth date is required.",
    errorNoTime: "Birth time is required for this tool.",
    generate: "Calculate my map",
    generating: "Calculating…",
    resultHeading: (name) => `${name}'s map`,
    bigThree: (sun, moon, asc) => `☉ ${sun} · ☾ ${moon}${asc ? ` · ASC ${asc}` : ""}`,
    ctaTitle: "Want to go further?",
    ctaBody:
      "This stays a free exploration of your lines. With a free account, keep this map saved, and unlock the ranking of your best countries by theme (love, career, spirituality, travel).",
    ctaLink: "Create my free account →",
    tryAnother: "Start over with another chart",
    shareCountry: (name) => `⤓ Share "${name}"`,
    sharing: "…",
    shareStory: "⤓ Story",
  },
};

export function MapTeaserForm({ locale = "fr" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const countries = locale === "en" ? MAJOR_COUNTRIES_EN : MAJOR_COUNTRIES;

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [sharing, setSharing] = useState<"post" | "story" | null>(null);

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
    if (!birthTime) {
      setError(t.errorNoTime);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/public/astrocartography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime,
          latitude: selected.latitude,
          longitude: selected.longitude,
          tzName: selected.tzName,
          locale,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error ?? t.errorNoDate);
      setResult(data as ApiResult);
      playSoftChime();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorNoDate);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare(format: "post" | "story") {
    if (!result || !selectedCountryId) return;
    setSharing(format);
    try {
      const lines = (result.countryMatches[selectedCountryId] ?? []).map((m) => `${m.planet}-${m.type}`).join(",");
      const params = new URLSearchParams({
        name: name.trim() || t.namePlaceholder,
        locale,
        sun: result.big3.sun,
        moon: result.big3.moon,
        countryId: selectedCountryId,
        lines,
        format,
      });
      if (result.big3.ascendant) params.set("ascendant", result.big3.ascendant);
      const res = await fetch(`/api/share/carte?${params.toString()}`);
      if (!res.ok) throw new Error("failed");
      const blob = await res.blob();
      const file = new File([blob], `carte-astro${format === "story" ? "-story" : ""}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Annulation du partage natif ou erreur réseau — silencieux, réessayable.
    } finally {
      setSharing(null);
    }
  }

  if (result) {
    const displayName = name.trim() || t.namePlaceholder;
    const selectedCountryName = selectedCountryId ? countries.find((c) => c.id === selectedCountryId)?.name : undefined;
    return (
      <div>
        <div className="text-center">
          <h2 className="font-display text-2xl">{t.resultHeading(displayName)}</h2>
          <p className="mt-1 text-sm text-gold-strong">
            {t.bigThree(
              signMap[result.big3.sun].name,
              signMap[result.big3.moon].name,
              result.big3.ascendant ? signMap[result.big3.ascendant].name : null
            )}
          </p>
        </div>

        <div className="mt-6">
          <AstrocartographyMap
            data={result.mapData}
            locale={locale}
            countryMatches={result.countryMatches}
            countries={countries}
            onCountrySelect={setSelectedCountryId}
          />
        </div>

        {selectedCountryId && selectedCountryName && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleShare("post")}
              disabled={sharing !== null}
              className="rounded-full border border-gold/40 px-4 py-1.5 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
            >
              {sharing === "post" ? t.sharing : t.shareCountry(selectedCountryName)}
            </button>
            <button
              type="button"
              onClick={() => handleShare("story")}
              disabled={sharing !== null}
              className="rounded-full border border-gold/40 px-4 py-1.5 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
            >
              {sharing === "story" ? t.sharing : t.shareStory}
            </button>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border-soft bg-background-elevated p-5 text-center">
          <p className="font-display text-lg">{t.ctaTitle}</p>
          <p className="mt-2 text-sm text-muted">{t.ctaBody}</p>
          <Link
            href={locale === "en" ? "/en/signup" : "/inscription"}
            className="mt-4 inline-block text-sm font-medium text-gold-strong underline"
          >
            {t.ctaLink}
          </Link>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setSelectedCountryId(null);
            }}
            className="text-xs text-muted underline hover:text-foreground"
          >
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
          <label className="mb-1 block text-sm text-muted" htmlFor="carte-name">
            {t.name}
          </label>
          <input
            id="carte-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={24}
            className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="carte-date">
              {t.birthDate}
            </label>
            <input
              id="carte-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="carte-time">
              {t.birthTime}
            </label>
            <input
              id="carte-time"
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full rounded-lg border border-border-soft bg-background-elevated px-4 py-2.5 text-sm outline-none focus:border-gold/60"
            />
          </div>
        </div>
        <p className="text-xs text-muted">{t.timeRequiredNote}</p>

        <div className="relative">
          <label className="mb-1 block text-sm text-muted" htmlFor="carte-location">
            {t.location}
          </label>
          <input
            id="carte-location"
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

        <Button type="button" onClick={handleGenerate} loading={busy} className="w-full">
          {busy ? t.generating : t.generate}
        </Button>
      </div>
    </div>
  );
}
