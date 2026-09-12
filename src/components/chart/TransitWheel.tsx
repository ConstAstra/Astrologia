import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { signOf } from "@/lib/astro/signs";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { PlanetKey } from "@/lib/astro/types";
import type { TransitAspect } from "@/lib/astro/transits";
import { describeArcPath, longitudeToSvgAngleDeg, polarToXY } from "./geometry";
import type { WheelPoint } from "./ChartWheel";

const DISPLAY_ORDER: PlanetKey[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "northNode",
];

const ASPECT_COLOR: Record<string, string> = {
  harmonieux: "#9fc0a3",
  tendu: "#c96b4a",
  neutre: "#c77b8a",
};

const ELEMENT_WEDGE_COLOR: Record<string, string> = {
  Feu: "#c96b4a",
  Terre: "#9fc0a3",
  Air: "#c77b8a",
  Eau: "#8a9fc4",
};

/**
 * Roue de transit : le thème natal sur l'anneau intérieur (doré, fixe),
 * le ciel du jour sur l'anneau extérieur (vert sauge, ce qui bouge), les
 * aspects actifs majeurs tracés entre les deux. Ancrée sur l'Ascendant
 * natal réel (comme ChartWheel) puisque, contrairement à la synastrie, il
 * n'y a ici qu'un seul référentiel de maisons légitime — celui de la
 * personne dont c'est le thème.
 */
export function TransitWheel({
  natalPoints,
  transitingPoints,
  ascendant,
  crossAspects,
  size = 420,
  locale = "fr",
}: {
  natalPoints: WheelPoint[];
  transitingPoints: WheelPoint[];
  ascendant: number;
  crossAspects: TransitAspect[];
  size?: number;
  locale?: "fr" | "en";
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rZodiacOuter = size * 0.48;
  const rZodiacInner = size * 0.42;
  const rTransit = size * 0.33;
  const rNatal = size * 0.19;

  const displayNatal = DISPLAY_ORDER.map((k) => natalPoints.find((p) => p.key === k)).filter((p): p is WheelPoint => Boolean(p));
  const displayTransit = DISPLAY_ORDER.map((k) => transitingPoints.find((p) => p.key === k)).filter((p): p is WheelPoint => Boolean(p));

  function ringPoints(points: WheelPoint[], radius: number) {
    return points.map((p) => {
      const angle = longitudeToSvgAngleDeg(p.longitude, ascendant);
      const pos = polarToXY(cx, cy, radius, angle);
      const meta = PLANET_META[p.key as PlanetKey];
      const tint = ELEMENT_WEDGE_COLOR[SIGN_META[signOf(p.longitude)].element];
      return { key: p.key, pos, meta, tint, angle };
    });
  }

  const ringNatal = ringPoints(displayNatal, rNatal);
  const ringTransit = ringPoints(displayTransit, rTransit);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ width: "100%", height: "auto", maxWidth: size, display: "block" }}
      role="img"
      aria-label={locale === "en" ? "Transit wheel" : "Roue de transit"}
    >
      <circle cx={cx} cy={cy} r={rZodiacOuter} fill="none" stroke="var(--border-soft)" strokeWidth={1} />

      {ZODIAC_SIGNS.map((sign, i) => {
        const signLon = i * 30;
        const startAngle = longitudeToSvgAngleDeg(signLon, ascendant);
        const endAngle = longitudeToSvgAngleDeg(signLon + 30, ascendant);
        const midAngle = longitudeToSvgAngleDeg(signLon + 15, ascendant);
        const labelPos = polarToXY(cx, cy, (rZodiacOuter + rZodiacInner) / 2, midAngle);
        const meta = SIGN_META[sign];
        return (
          <g key={sign}>
            <path
              d={describeArcPath(cx, cy, rZodiacOuter, rZodiacInner, startAngle, endAngle)}
              fill={ELEMENT_WEDGE_COLOR[meta.element]}
              fillOpacity={i % 2 === 0 ? 0.1 : 0.05}
              stroke="var(--border-soft)"
              strokeWidth={0.5}
            />
            <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.03} fill="var(--gold-strong)">
              <title>{meta.name}</title>
              {meta.symbol}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r={rTransit + size * 0.045} fill="none" stroke="var(--border-soft)" strokeWidth={0.5} strokeDasharray="2 3" />
      <circle cx={cx} cy={cy} r={rNatal + size * 0.045} fill="none" stroke="var(--border-soft)" strokeWidth={0.5} strokeDasharray="2 3" />

      {crossAspects
        .filter((asp) => asp.major && DISPLAY_ORDER.includes(asp.transitingPlanet) && DISPLAY_ORDER.includes(asp.natalPoint as PlanetKey))
        .map((asp, i) => {
          const from = ringTransit.find((p) => p.key === asp.transitingPlanet);
          const to = ringNatal.find((p) => p.key === asp.natalPoint);
          if (!from || !to) return null;
          const tone = ASPECT_META[asp.aspect].tone;
          return (
            <line
              key={i}
              x1={from.pos.x}
              y1={from.pos.y}
              x2={to.pos.x}
              y2={to.pos.y}
              stroke={ASPECT_COLOR[tone]}
              strokeWidth={0.75}
              opacity={0.5}
            />
          );
        })}

      {ringTransit.map((p) => (
        <g key={`t-${p.key}`}>
          <circle cx={p.pos.x} cy={p.pos.y} r={size * 0.026} fill="#1f1420" stroke="var(--sage)" strokeWidth={1} />
          <text x={p.pos.x} y={p.pos.y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.03} fill={p.tint}>
            <title>{`${p.meta.name} (${locale === "en" ? "today" : "aujourd'hui"})`}</title>
            {p.meta.symbol}
          </text>
        </g>
      ))}

      {ringNatal.map((p) => (
        <g key={`n-${p.key}`}>
          <circle cx={p.pos.x} cy={p.pos.y} r={size * 0.026} fill="#1f1420" stroke="var(--gold)" strokeWidth={1} />
          <text x={p.pos.x} y={p.pos.y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.03} fill={p.tint}>
            <title>{`${p.meta.name} (${locale === "en" ? "natal" : "natal"})`}</title>
            {p.meta.symbol}
          </text>
        </g>
      ))}

      <text x={cx} y={cy - size * 0.02} textAnchor="middle" fontSize={size * 0.026} fill="var(--sage)">
        ● {locale === "en" ? "Today" : "Aujourd'hui"}
      </text>
      <text x={cx} y={cy + size * 0.035} textAnchor="middle" fontSize={size * 0.026} fill="var(--gold)">
        ● {locale === "en" ? "Natal" : "Natal"}
      </text>
    </svg>
  );
}
