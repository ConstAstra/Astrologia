import { Astronomy, computeNorthNodePoint, computePlanetPoint, computeRamc, normalizeDegrees, trueObliquity } from "./ephemeris";
import { computeHouses, houseOfLongitude } from "./houses";
import { birthInputToJsDate } from "./time";
import { PLANET_KEYS } from "./types";
import type { BirthInput, EclipticPoint, HouseSystem, NatalChart, PointKey } from "./types";

export function computeNatalChart(
  input: BirthInput,
  houseSystem: HouseSystem = "whole-sign"
): NatalChart {
  const jsDate = birthInputToJsDate(input);
  const time = new Astronomy.AstroTime(jsDate);
  const obliquity = trueObliquity(time);
  const ramc = computeRamc(time, input.longitude);

  const houses = computeHouses(houseSystem, ramc, obliquity, input.latitude);

  const points: Partial<Record<PointKey, EclipticPoint>> = {};
  for (const key of PLANET_KEYS) {
    points[key] = key === "northNode" ? computeNorthNodePoint(time) : computePlanetPoint(key, time);
  }

  points.asc = { key: "asc", longitude: houses.ascendant, latitude: 0 };
  points.mc = { key: "mc", longitude: houses.midheaven, latitude: 0 };
  points.desc = { key: "desc", longitude: normalizeDegrees(houses.ascendant + 180), latitude: 0 };
  points.ic = { key: "ic", longitude: normalizeDegrees(houses.midheaven + 180), latitude: 0 };

  const sun = points.sun!;
  const moon = points.moon!;
  const sunHouse = houseOfLongitude(sun.longitude, houses.cusps);
  const isDayBirth = sunHouse >= 7 && sunHouse <= 12; // Soleil au-dessus de l'horizon
  const fortuneLongitude = isDayBirth
    ? normalizeDegrees(houses.ascendant + moon.longitude - sun.longitude)
    : normalizeDegrees(houses.ascendant + sun.longitude - moon.longitude);
  points.fortune = { key: "fortune", longitude: fortuneLongitude, latitude: 0 };

  const hasReliableHouses = !input.timeUnknown;
  for (const point of Object.values(points) as EclipticPoint[]) {
    if (hasReliableHouses) {
      point.house = houseOfLongitude(point.longitude, houses.cusps);
    }
  }

  return {
    input,
    utcIso: jsDate.toISOString(),
    julianDay: time.tt,
    obliquity,
    ramc,
    points: points as Record<PointKey, EclipticPoint>,
    houses,
    hasReliableHouses,
  };
}
