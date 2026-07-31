import { buildWorldMap } from "./worldPaths";
import { MAJOR_COUNTRIES } from "./majorCountries";
import { MAJOR_COUNTRIES_EN } from "./majorCountries.en";
import type { AstroCartoLine } from "@/lib/astro/astrocartography";
import type { PlanetKey } from "@/lib/astro/types";

export interface ProjectedLine {
  planet: PlanetKey;
  type: "MC" | "IC" | "AC" | "DC";
  points: { x: number; y: number }[];
}

export interface CountryLabel {
  name: string;
  x: number;
  y: number;
}

export interface WorldMapData {
  width: number;
  height: number;
  countryPaths: string[];
  graticulePath: string;
  lines: ProjectedLine[];
  countryLabels: CountryLabel[];
}

export function projectAstroCartoLines(
  lines: AstroCartoLine[],
  width = 960,
  height = 500,
  locale: "fr" | "en" = "fr"
): WorldMapData {
  const map = buildWorldMap(width, height);
  const countries = locale === "en" ? MAJOR_COUNTRIES_EN : MAJOR_COUNTRIES;

  const projected: ProjectedLine[] = lines.map((line) => {
    if (line.longitude !== undefined) {
      const { x, y1, y2 } = map.projectLongitudeLine(line.longitude);
      return { planet: line.planet, type: line.type, points: [{ x, y: y1 }, { x, y: y2 }] };
    }
    const points = (line.path ?? [])
      .map((p) => {
        const proj = map.projectLatLon(p.lat, p.lon);
        return proj ? { x: proj[0], y: proj[1] } : null;
      })
      .filter((p): p is { x: number; y: number } => p !== null);
    return { planet: line.planet, type: line.type, points };
  });

  const countryLabels: CountryLabel[] = countries.map((c) => {
    const proj = map.projectLatLon(c.lat, c.lon);
    return proj ? { name: c.name, x: proj[0] + (c.dx ?? 0), y: proj[1] + (c.dy ?? 0) } : null;
  }).filter((l): l is CountryLabel => l !== null);

  return {
    width: map.width,
    height: map.height,
    countryPaths: map.countryPaths,
    graticulePath: map.graticulePath,
    lines: projected,
    countryLabels,
  };
}
