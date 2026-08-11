"use client";

import { useMemo, useState } from "react";
import type { WorldMapData } from "./ProjectedLine";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { LINE_TYPE_META } from "@/lib/astro/interpretations/astrocartography-content";
import { LINE_TYPE_META_EN } from "@/lib/astro/interpretations/astrocartography-content.en";
import { describeAstroCartoLine } from "@/lib/astro/interpretations/compose";
import type { CountryLineMatch } from "@/lib/astro/astrocartography-countries";
import type { PlanetKey } from "@/lib/astro/types";
import { playClickTick } from "@/lib/sound";

const PLANET_COLORS: Record<string, string> = {
  sun: "#f2b799",
  moon: "#c9d3e8",
  mercury: "#9fd6c6",
  venus: "#e6a6c7",
  mars: "#dd7a63",
  jupiter: "#e8935f",
  saturn: "#8f8fae",
  uranus: "#7fd1d1",
  neptune: "#7f9fdb",
  pluto: "#a888c2",
  northNode: "#c2c2c2",
};

const LINE_TYPES: { key: "MC" | "IC" | "AC" | "DC"; label: string }[] = [
  { key: "MC", label: "MC" },
  { key: "IC", label: "IC" },
  { key: "AC", label: "AC" },
  { key: "DC", label: "DC" },
];

const TEXT = {
  fr: {
    tapHint: "👉 Touchez un pays sur la carte (surligné au survol) pour voir ce que vos lignes y racontent.",
    heading: (name: string) => `Ce qui se passerait en ${name}`,
    orPick: "ou choisissez un pays dans la liste",
    placeholder: "Choisir un pays…",
    noLines: "Aucune de vos lignes ne traverse directement ce pays.",
    close: "Fermer",
    lockedPrompt: "Débloquez votre thème pour lire ce que cette ligne raconte vraiment.",
  },
  en: {
    tapHint: "👉 Tap a country on the map (highlighted on hover) to see what your lines say about it.",
    heading: (name: string) => `What would happen in ${name}`,
    orPick: "or pick a country from the list",
    placeholder: "Choose a country…",
    noLines: "None of your lines directly cross this country.",
    close: "Close",
    lockedPrompt: "Unlock your chart to read what this line actually means.",
  },
};

function toSegmentedPath(points: { x: number; y: number }[], width: number): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    if (Math.abs(cur.x - prev.x) > width / 2) {
      d += ` M ${cur.x} ${cur.y}`;
    } else {
      d += ` L ${cur.x} ${cur.y}`;
    }
  }
  return d;
}

/** Reflète la sélection dans l'URL (sans requête serveur) pour qu'un pays tapé sur la carte reste partageable/rechargeable. */
function syncCountryToUrl(countryId: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (countryId) url.searchParams.set("country", countryId);
  else url.searchParams.delete("country");
  window.history.replaceState(window.history.state, "", url);
}

export function AstrocartographyMap({
  data,
  locale = "fr",
  countryMatches,
  countries,
  initialSelectedCountryId,
  onCountrySelect,
  locked = false,
}: {
  data: WorldMapData;
  locale?: "fr" | "en";
  /** Lignes qui traversent réellement chaque pays couvert (voir `computeCountryLineMatches`), pour le panneau "ce qui se passerait ici" au clic. */
  countryMatches: Record<string, CountryLineMatch[]>;
  /** Pays couverts (mêmes identifiants que `countryMatches`), pour le nom affiché et le sélecteur de repli. */
  countries: { id: string; name: string }[];
  initialSelectedCountryId?: string;
  /** Notifie le parent à chaque changement de sélection (ex : afficher un bouton "partager ce pays"). */
  onCountrySelect?: (countryId: string | null) => void;
  // Aperçu gratuit : la carte et ses lignes restent visibles et cliquables,
  // mais le texte d'interprétation par pays est remplacé par une invite à
  // débloquer, plutôt que de tout cacher derrière un mur — la carte donne
  // déjà envie, le texte est ce qui se vend.
  locked?: boolean;
}) {
  const t = TEXT[locale];
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const lineTypeMap = locale === "en" ? LINE_TYPE_META_EN : LINE_TYPE_META;
  const countryName = useMemo(() => new Map(countries.map((c) => [c.id, c.name])), [countries]);

  const allPlanets = useMemo(() => {
    const set = new Set<PlanetKey>();
    data.lines.forEach((l) => set.add(l.planet));
    return Array.from(set);
  }, [data.lines]);

  const [visiblePlanets, setVisiblePlanets] = useState<Set<PlanetKey>>(
    () => new Set(["sun", "moon", "venus", "jupiter"] as PlanetKey[])
  );
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(["MC", "IC", "AC", "DC"]));
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(initialSelectedCountryId ?? null);

  function togglePlanet(p: PlanetKey) {
    playClickTick();
    setVisiblePlanets((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  function toggleType(t: string) {
    playClickTick();
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function selectCountry(id: string | null) {
    if (id) playClickTick();
    setSelectedCountryId(id);
    syncCountryToUrl(id);
    onCountrySelect?.(id);
  }

  const selectedMatches = selectedCountryId ? (countryMatches[selectedCountryId] ?? []) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-1.5">
          {allPlanets.map((p) => (
            <button
              key={p}
              onClick={() => togglePlanet(p)}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-150 active:scale-95"
              style={{
                borderColor: visiblePlanets.has(p) ? PLANET_COLORS[p] : "var(--border-soft)",
                color: visiblePlanets.has(p) ? PLANET_COLORS[p] : "var(--muted)",
                opacity: visiblePlanets.has(p) ? 1 : 0.5,
              }}
            >
              {planetMap[p].symbol} {planetMap[p].name}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {LINE_TYPES.map((lt) => (
            <button
              key={lt.key}
              onClick={() => toggleType(lt.key)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-all duration-150 active:scale-95 ${
                visibleTypes.has(lt.key) ? "border-gold/50 text-gold-strong" : "border-border-soft text-muted opacity-50"
              }`}
            >
              {lt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-2 text-xs text-muted">{t.tapHint}</p>

      <div className="overflow-x-auto rounded-xl border border-border-soft bg-[#070914]">
        <svg viewBox={`0 0 ${data.width} ${data.height}`} width="100%" style={{ minWidth: 640 }}>
          <rect x={0} y={0} width={data.width} height={data.height} fill="#070914" />
          <path d={data.graticulePath} fill="none" stroke="#ffffff10" strokeWidth={0.5} />
          {data.countryPaths.map((cp, i) => {
            const isSelected = cp.countryId !== undefined && cp.countryId === selectedCountryId;
            const isClickable = cp.countryId !== undefined;
            return (
              <path
                key={i}
                d={cp.d}
                fill={isSelected ? "#f2b79950" : "#ffffff12"}
                stroke={isSelected ? "#f2b799" : "#ffffff22"}
                strokeWidth={isSelected ? 1.25 : 0.5}
                className={isClickable ? "cursor-pointer transition-colors duration-150 hover:fill-[#f2b79930]" : undefined}
                onClick={isClickable ? () => selectCountry(cp.countryId === selectedCountryId ? null : cp.countryId!) : undefined}
              >
                {isClickable && <title>{countryName.get(cp.countryId!) ?? cp.countryId}</title>}
              </path>
            );
          })}
          {data.countryLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              letterSpacing={0.3}
              fill="#c7cbdc"
              opacity={0.85}
              style={{ textTransform: "uppercase", pointerEvents: "none" }}
            >
              {label.name}
            </text>
          ))}
          {data.lines
            .filter((l) => visiblePlanets.has(l.planet) && visibleTypes.has(l.type))
            .map((line, i) => (
              <path
                key={i}
                d={toSegmentedPath(line.points, data.width)}
                fill="none"
                stroke={PLANET_COLORS[line.planet]}
                strokeWidth={line.type === "MC" || line.type === "IC" ? 1.5 : 1.75}
                strokeDasharray={line.type === "IC" || line.type === "DC" ? "4 3" : undefined}
                opacity={0.85}
                style={{ pointerEvents: "none" }}
              />
            ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>{t.orPick}</span>
        <select
          value={selectedCountryId ?? ""}
          onChange={(e) => selectCountry(e.target.value || null)}
          className="rounded-lg border border-border-soft bg-background-elevated px-2 py-1 text-xs outline-none focus:border-gold/60"
        >
          <option value="">{t.placeholder}</option>
          {[...countries].sort((a, b) => a.name.localeCompare(b.name, locale)).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCountryId && selectedMatches && (
        <div key={selectedCountryId} className="stagger-item mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">{t.heading(countryName.get(selectedCountryId) ?? selectedCountryId)}</h3>
            <button
              onClick={() => selectCountry(null)}
              aria-label={t.close}
              className="rounded-full px-2 py-0.5 text-xs text-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>
          {selectedMatches.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t.noLines}</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {selectedMatches.map((m) => (
                <div key={`${m.planet}-${m.type}`} className="rounded-lg bg-background-elevated p-3 text-sm">
                  <p className="font-medium">
                    {planetMap[m.planet].symbol} {planetMap[m.planet].name} — {lineTypeMap[m.type].name}
                  </p>
                  {locked ? (
                    <p className="mt-1 leading-relaxed text-muted/70">🔒 {t.lockedPrompt}</p>
                  ) : (
                    <p className="mt-1 leading-relaxed text-muted">{describeAstroCartoLine(m.planet, m.type, locale)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
