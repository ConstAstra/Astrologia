import { computeBigThree, computeDominance } from "@/lib/astro/dominance";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { ELEMENT_DOMINANCE_TEXT, MODALITY_DOMINANCE_TEXT } from "@/lib/astro/interpretations/dominance-content";
import type { EclipticPoint, PointKey } from "@/lib/astro/types";
import { Card, Eyebrow } from "@/components/ui/Card";

const ELEMENT_COLORS: Record<string, string> = {
  Feu: "#dd9a78",
  Terre: "#8fc2a0",
  Air: "#8c7fdb",
  Eau: "#7f9fdb",
};

export function OverviewCard({
  points,
  hasReliableHouses,
}: {
  points: Partial<Record<PointKey, EclipticPoint>>;
  hasReliableHouses: boolean;
}) {
  const big3 = computeBigThree(points, hasReliableHouses);
  const dominance = computeDominance(points);
  const maxCount = Math.max(1, ...Object.values(dominance.elementCounts));

  return (
    <Card className="p-6">
      <Eyebrow>Vue d&apos;ensemble</Eyebrow>
      <div className="mt-4 grid gap-6 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{PLANET_META.sun.symbol}</span>
          <div>
            <p className="text-xs text-muted">Soleil</p>
            <p className="font-display text-lg text-gold-strong">{SIGN_META[big3.sun].name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{PLANET_META.moon.symbol}</span>
          <div>
            <p className="text-xs text-muted">Lune</p>
            <p className="font-display text-lg text-gold-strong">{SIGN_META[big3.moon].name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">AS</span>
          <div>
            <p className="text-xs text-muted">Ascendant</p>
            <p className="font-display text-lg text-gold-strong">
              {big3.ascendant ? SIGN_META[big3.ascendant].name : "Heure inconnue"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-muted">Répartition par élément</p>
        <div className="mt-3 space-y-2">
          {(Object.keys(dominance.elementCounts) as (keyof typeof dominance.elementCounts)[]).map((element) => (
            <div key={element} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted">{element}</span>
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

      <div className="mt-5 space-y-2 text-xs leading-relaxed text-muted">
        {dominance.dominantElements.map((e) => (
          <p key={e}>{ELEMENT_DOMINANCE_TEXT[e]}</p>
        ))}
        {dominance.dominantModalities.map((m) => (
          <p key={m}>{MODALITY_DOMINANCE_TEXT[m]}</p>
        ))}
      </div>
    </Card>
  );
}
