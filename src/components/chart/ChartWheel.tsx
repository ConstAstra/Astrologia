import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { SIGN_META } from "@/lib/astro/interpretations/signs";
import { ASPECT_META } from "@/lib/astro/interpretations/aspects";
import { signOf } from "@/lib/astro/signs";
import { ZODIAC_SIGNS } from "@/lib/astro/types";
import type { Aspect, PointKey } from "@/lib/astro/types";
import { describeArcPath, longitudeToSvgAngleDeg, polarToXY } from "./geometry";

export interface WheelPoint {
  key: PointKey;
  longitude: number;
}

const DISPLAY_ORDER: PointKey[] = [
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

function resolveCollisions(points: { key: PointKey; angle: number }[], minGap: number) {
  const sorted = [...points].sort((a, b) => a.angle - b.angle);
  const radiusOffset = new Map<PointKey, number>();
  for (let i = 0; i < sorted.length; i++) {
    radiusOffset.set(sorted[i].key, 0);
  }
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 20) {
    changed = false;
    iterations++;
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      const b = sorted[(i + 1) % sorted.length];
      let gap = b.angle - a.angle;
      if (gap < 0) gap += 360;
      if (i === sorted.length - 1) gap = 360 - (a.angle - b.angle < 0 ? a.angle - b.angle + 360 : a.angle - b.angle);
      if (gap < minGap && (radiusOffset.get(a.key) ?? 0) === (radiusOffset.get(b.key) ?? 0)) {
        radiusOffset.set(b.key, (radiusOffset.get(a.key) ?? 0) + 1);
        changed = true;
      }
    }
  }
  return radiusOffset;
}

export function ChartWheel({
  points,
  ascendant,
  houseCusps,
  aspects,
  size = 560,
  locale = "fr",
}: {
  points: WheelPoint[];
  ascendant: number;
  houseCusps: number[];
  aspects: Aspect[];
  size?: number;
  locale?: "fr" | "en";
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.48;
  const rZodiacOuter = size * 0.46;
  const rZodiacInner = size * 0.4;
  const rHouseLabel = size * 0.36;
  const rPlanetBase = size * 0.3;
  const rAspect = size * 0.18;

  const displayPoints = DISPLAY_ORDER.map((k) => points.find((p) => p.key === k)).filter(
    (p): p is WheelPoint => Boolean(p)
  );

  const angled = displayPoints.map((p) => ({ key: p.key, angle: longitudeToSvgAngleDeg(p.longitude, ascendant) }));
  const collisionOffsets = resolveCollisions(angled, 8);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ width: "100%", height: "auto", maxWidth: size, display: "block" }}
      role="img"
      aria-label={locale === "en" ? "Astrological wheel" : "Roue astrologique"}
    >
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="var(--border-soft)" strokeWidth={1} />

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
              fill={i % 2 === 0 ? "#ffffff08" : "#ffffff02"}
              stroke="var(--border-soft)"
              strokeWidth={0.5}
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size * 0.032}
              fill="var(--gold-strong)"
            >
              <title>{meta.name}</title>
              {meta.symbol}
            </text>
          </g>
        );
      })}

      {houseCusps.map((cusp, i) => {
        const angle = longitudeToSvgAngleDeg(cusp, ascendant);
        const outer = polarToXY(cx, cy, rZodiacInner, angle);
        const inner = polarToXY(cx, cy, i % 3 === 0 ? rAspect * 0.4 : rPlanetBase * 0.55, angle);
        const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
        const labelAngle = longitudeToSvgAngleDeg(cusp + 8, ascendant);
        const labelPos = polarToXY(cx, cy, rHouseLabel, labelAngle);
        return (
          <g key={i}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={isAngle ? "var(--gold)" : "var(--border-soft)"}
              strokeWidth={isAngle ? 1.5 : 0.75}
            />
            <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.022} fill="var(--muted)">
              {i + 1}
            </text>
          </g>
        );
      })}

      {aspects
        .filter((a) => DISPLAY_ORDER.includes(a.a) && DISPLAY_ORDER.includes(a.b))
        .map((aspect, i) => {
          const pa = points.find((p) => p.key === aspect.a);
          const pb = points.find((p) => p.key === aspect.b);
          if (!pa || !pb) return null;
          const angleA = longitudeToSvgAngleDeg(pa.longitude, ascendant);
          const angleB = longitudeToSvgAngleDeg(pb.longitude, ascendant);
          const a1 = polarToXY(cx, cy, rAspect, angleA);
          const a2 = polarToXY(cx, cy, rAspect, angleB);
          const tone = ASPECT_META[aspect.aspect].tone;
          return (
            <line
              key={i}
              x1={a1.x}
              y1={a1.y}
              x2={a2.x}
              y2={a2.y}
              stroke={ASPECT_COLOR[tone]}
              strokeWidth={aspect.major ? 1 : 0.5}
              opacity={aspect.major ? 0.75 : 0.4}
            />
          );
        })}

      <circle cx={cx} cy={cy} r={rAspect} fill="none" stroke="var(--border-soft)" strokeWidth={0.75} />

      {displayPoints.map((p) => {
        const baseAngle = longitudeToSvgAngleDeg(p.longitude, ascendant);
        const offset = collisionOffsets.get(p.key) ?? 0;
        const r = rPlanetBase - offset * (size * 0.028);
        const pos = polarToXY(cx, cy, r, baseAngle);
        const meta = PLANET_META[p.key];
        return (
          <text
            key={p.key}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.034}
            fill="var(--foreground)"
          >
            <title>{`${meta.name} — ${SIGN_META[signOf(p.longitude)].name}`}</title>
            {meta.symbol}
          </text>
        );
      })}
    </svg>
  );
}
