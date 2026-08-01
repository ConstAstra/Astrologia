"use client";

import { useMemo, useState } from "react";
import type { WorldMapData } from "./ProjectedLine";
import { PLANET_META } from "@/lib/astro/interpretations/planets";
import { PLANET_META_EN } from "@/lib/astro/interpretations/planets.en";
import type { PlanetKey } from "@/lib/astro/types";

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

export function AstrocartographyMap({ data, locale = "fr" }: { data: WorldMapData; locale?: "fr" | "en" }) {
  const planetMap = locale === "en" ? PLANET_META_EN : PLANET_META;
  const allPlanets = useMemo(() => {
    const set = new Set<PlanetKey>();
    data.lines.forEach((l) => set.add(l.planet));
    return Array.from(set);
  }, [data.lines]);

  const [visiblePlanets, setVisiblePlanets] = useState<Set<PlanetKey>>(
    () => new Set(["sun", "moon", "venus", "jupiter"] as PlanetKey[])
  );
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(["MC", "IC", "AC", "DC"]));

  function togglePlanet(p: PlanetKey) {
    setVisiblePlanets((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  function toggleType(t: string) {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-1.5">
          {allPlanets.map((p) => (
            <button
              key={p}
              onClick={() => togglePlanet(p)}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
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
          {LINE_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => toggleType(t.key)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                visibleTypes.has(t.key) ? "border-gold/50 text-gold-strong" : "border-border-soft text-muted opacity-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-soft bg-[#070914]">
        <svg viewBox={`0 0 ${data.width} ${data.height}`} width="100%" style={{ minWidth: 640 }}>
          <rect x={0} y={0} width={data.width} height={data.height} fill="#070914" />
          <path d={data.graticulePath} fill="none" stroke="#ffffff10" strokeWidth={0.5} />
          {data.countryPaths.map((d, i) => (
            <path key={i} d={d} fill="#ffffff12" stroke="#ffffff22" strokeWidth={0.5} />
          ))}
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
              style={{ textTransform: "uppercase" }}
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
              />
            ))}
        </svg>
      </div>
    </div>
  );
}
