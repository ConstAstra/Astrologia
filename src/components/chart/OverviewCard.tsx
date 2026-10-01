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

const MODALITY_COLORS: Record<string, string> = {
  Cardinal: "#f2b799",
  Fixe: "#e8935f",
  Mutable: "#c9784a",
};

const ELEMENT_LABEL_EN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };
const MODALITY_LABEL_EN: Record<string, string> = { Cardinal: "Cardinal", Fixe: "Fixed", Mutable: "Mutable" };

const TEXT: Record<Locale, {
  overview: string;
  sun: string;
  moon: string;
  ascendant: string;
  unknownTime: string;
  distributionElement: string;
  distributionModality: string;
  composedOf: (planets: string) => string;
  basis: string;
}> = {
  fr: {
    overview: "Vue d'ensemble",
    sun: "Soleil",
    moon: "Lune",
    ascendant: "Ascendant",
    unknownTime: "Heure inconnue",
    distributionElement: "Répartition par élément",
    distributionModality: "Répartition par modalité",
    composedOf: (planets) => `Porté par : ${planets}.`,
    basis: "Calculée sur vos 5 planètes personnelles (Soleil à Mars) et le maître de votre Ascendant, pas sur l'ensemble du thème, pour rester représentative de vous plutôt que de votre génération. Cliquez une ligne pour l'explication.",
  },
  en: {
    overview: "Overview",
    sun: "Sun",
    moon: "Moon",
    ascendant: "Ascendant",
    unknownTime: "Unknown time",
    distributionElement: "Breakdown by element",
    distributionModality: "Breakdown by modality",
    composedOf: (planets) => `Driven by: ${planets}.`,
    basis: "Calculated from your 5 personal planets (Sun through Mars) and your Ascendant ruler, not the whole chart, to stay representative of you rather than your generation. Click a row for the explanation.",
  },
};

function DistributionRow({
  label,
  count,
  maxCount,
  color,
  explanation,
  poweredBy,
  defaultOpen,
}: {
  label: string;
  count: number;
  maxCount: number;
  color: string;
  explanation: string;
  poweredBy: string;
  defaultOpen: boolean;
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
        <span className="w-16 shrink-0 text-xs text-muted">{label}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border-soft">
          <div
            className="h-full rounded-full"
            style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: color }}
          />
        </div>
        <span className="w-4 shrink-0 text-right text-xs text-muted">{count}</span>
        <svg
          className="h-3 w-3 shrink-0 text-muted transition-transform group-open:rotate-90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="mt-2 pl-[4.75rem] text-xs leading-relaxed text-muted">
        <p>{explanation}</p>
        <p className="mt-1 text-muted/70">{poweredBy}</p>
      </div>
    </details>
  );
}

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
  const maxElementCount = Math.max(1, ...Object.values(dominance.elementCounts));
  const maxModalityCount = Math.max(1, ...Object.values(dominance.modalityCounts));

  const poweredBy = (planets: PointKey[]) =>
    t.composedOf(planets.map((p) => `${planetMap[p].symbol} ${planetMap[p].name}`).join(", "));

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
        <p className="text-xs uppercase tracking-wide text-muted">{t.distributionElement}</p>
        <p className="mt-1 text-xs text-muted/70">{t.basis}</p>
        <div className="mt-3 space-y-2">
          {(Object.keys(dominance.elementCounts) as (keyof typeof dominance.elementCounts)[]).map((element) => (
            <DistributionRow
              key={element}
              label={locale === "en" ? ELEMENT_LABEL_EN[element] : element}
              count={dominance.elementCounts[element]}
              maxCount={maxElementCount}
              color={ELEMENT_COLORS[element]}
              explanation={elementText[element]}
              poweredBy={poweredBy(dominance.elementPlanets[element])}
              defaultOpen={dominance.dominantElements.includes(element)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-muted">{t.distributionModality}</p>
        <div className="mt-3 space-y-2">
          {(Object.keys(dominance.modalityCounts) as (keyof typeof dominance.modalityCounts)[]).map((modality) => (
            <DistributionRow
              key={modality}
              label={locale === "en" ? MODALITY_LABEL_EN[modality] : modality}
              count={dominance.modalityCounts[modality]}
              maxCount={maxModalityCount}
              color={MODALITY_COLORS[modality]}
              explanation={modalityText[modality]}
              poweredBy={poweredBy(dominance.modalityPlanets[modality])}
              defaultOpen={dominance.dominantModalities.includes(modality)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
