import { computeBigThree, computeDominance } from "@/lib/astro/dominance";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { SIGN_META_EN } from "@/lib/astro/interpretations/signs.en";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import { ELEMENT_DOMINANCE_TEXT, MODALITY_DOMINANCE_TEXT } from "@/lib/astro/interpretations/dominance-content";
import { ELEMENT_DOMINANCE_TEXT_EN, MODALITY_DOMINANCE_TEXT_EN } from "@/lib/astro/interpretations/dominance-content.en";
import type { EclipticPoint, PointKey } from "@/lib/astro/types";
import { Card, Eyebrow } from "@/components/ui/Card";

type Locale = "fr" | "en";

const ELEMENT_COLORS: Record<string, string> = {
  Feu: "#c96b4a",
  Terre: "#9fc0a3",
  Air: "#c77b8a",
  Eau: "#8a9fc4",
};

const ELEMENT_LABEL_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };

const TEXT: Record<Locale, {
  overview: string;
  sun: string;
  moon: string;
  ascendant: string;
  unknownTime: string;
  distribution: string;
  composedOf: (planets: string) => string;
  basis: string;
}> = {
  fr: {
    overview: "Vue d'ensemble",
    sun: "Soleil",
    moon: "Lune",
    ascendant: "Ascendant",
    unknownTime: "Heure inconnue",
    distribution: "Répartition par élément",
    composedOf: (planets) => `Porté par : ${planets}.`,
    basis: "Calculée sur vos 5 planètes personnelles (Soleil à Mars) et le maître de votre Ascendant — pas sur l'ensemble du thème, pour rester représentative de vous plutôt que de votre génération.",
  },
  en: {
    overview: "Overview",
    sun: "Sun",
    moon: "Moon",
    ascendant: "Ascendant",
    unknownTime: "Unknown time",
    distribution: "Breakdown by element",
    composedOf: (planets) => `Driven by: ${planets}.`,
    basis: "Calculated from your 5 personal planets (Sun through Mars) and your Ascendant ruler — not the whole chart, to stay representative of you rather than your generation.",
  },
};

export function OverviewCard({
  points,
  hasReliableHouses,
  locale = "fr",
}: {
  points: Partial<Record<PointKey, EclipticPoint>>;
  hasReliableHouses: boolean;
  locale?: Locale;
}) {
  const signMap = locale === "en" ? SIGN_META_EN : SIGN_META;
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const elementText = locale === "en" ? ELEMENT_DOMINANCE_TEXT_EN : ELEMENT_DOMINANCE_TEXT;
  const modalityText = locale === "en" ? MODALITY_DOMINANCE_TEXT_EN : MODALITY_DOMINANCE_TEXT;
  const t = TEXT[locale];

  const big3 = computeBigThree(points, hasReliableHouses);
  const dominance = computeDominance(points, hasReliableHouses);
  const maxCount = Math.max(1, ...Object.values(dominance.elementCounts));

  return (
    <Card className="p-6">
      <Eyebrow>{t.overview}</Eyebrow>
      <div className="mt-4 grid gap-6 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{planetMap.sun.symbol}</span>
          <div>
            <p className="text-xs text-muted">{t.sun}</p>
            <p className="font-display text-lg text-gold-strong">{signMap[big3.sun].name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{planetMap.moon.symbol}</span>
          <div>
            <p className="text-xs text-muted">{t.moon}</p>
            <p className="font-display text-lg text-gold-strong">{signMap[big3.moon].name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">AS</span>
          <div>
            <p className="text-xs text-muted">{t.ascendant}</p>
            <p className="font-display text-lg text-gold-strong">
              {big3.ascendant ? signMap[big3.ascendant].name : t.unknownTime}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-muted">{t.distribution}</p>
        <p className="mt-1 text-xs text-muted/70">{t.basis}</p>
        <div className="mt-3 space-y-2">
          {(Object.keys(dominance.elementCounts) as (keyof typeof dominance.elementCounts)[]).map((element) => (
            <div key={element} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted">{locale === "en" ? ELEMENT_LABEL_EN[element] : element}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border-soft">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(dominance.elementCounts[element] / maxCount) * 100}%`,
                    backgroundColor: ELEMENT_COLORS[element],
                  }}
                />
              </div>
              <span className="w-4 shrink-0 text-right text-xs text-muted">{dominance.elementCounts[element]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3 text-xs leading-relaxed text-muted">
        {dominance.dominantElements.map((e) => {
          const planets = dominance.elementPlanets[e];
          return (
            <div key={e}>
              <p>{elementText[e]}</p>
              <p className="mt-1 text-muted/70">
                {t.composedOf(planets.map((p) => `${planetMap[p].symbol} ${planetMap[p].name}`).join(", "))}
              </p>
            </div>
          );
        })}
        {dominance.dominantModalities.map((m) => {
          const planets = dominance.modalityPlanets[m];
          return (
            <div key={m}>
              <p>{modalityText[m]}</p>
              <p className="mt-1 text-muted/70">
                {t.composedOf(planets.map((p) => `${planetMap[p].symbol} ${planetMap[p].name}`).join(", "))}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
