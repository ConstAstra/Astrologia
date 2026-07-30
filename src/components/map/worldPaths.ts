import { geoEquirectangular, geoPath, geoGraticule } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

export interface WorldMapPaths {
  width: number;
  height: number;
  countryPaths: string[];
  graticulePath: string;
  projectLatLon: (lat: number, lon: number) => [number, number] | null;
  projectLongitudeLine: (lon: number) => { x: number; y1: number; y2: number };
}

export function buildWorldMap(width = 960, height = 500): WorldMapPaths {
  const projection = geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2]);
  const path = geoPath(projection);

  const topology = world as unknown as Topology;
  const countries = feature(topology, topology.objects.countries as GeometryCollection);
  const countryPaths = countries.features.map((f) => path(f) ?? "").filter(Boolean);

  const graticule = geoGraticule().step([30, 30])();
  const graticulePath = path(graticule) ?? "";

  return {
    width,
    height,
    countryPaths,
    graticulePath,
    projectLatLon: (lat: number, lon: number) => {
      const p = projection([lon, lat]);
      return p as [number, number] | null;
    },
    projectLongitudeLine: (lon: number) => {
      const top = projection([lon, 85]);
      const bottom = projection([lon, -85]);
      return { x: top?.[0] ?? 0, y1: top?.[1] ?? 0, y2: bottom?.[1] ?? height };
    },
  };
}
