import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/public/natal-chart/route";

function mkReq(body: unknown, ip: string) {
  return new Request("http://localhost/api/public/natal-chart", {
    method: "POST",
    headers: { "x-forwarded-for": ip, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  birthDate: "1990-06-15",
  birthTime: "08:30",
  timeUnknown: false,
  latitude: 48.8566,
  longitude: 2.3522,
  tzName: "Europe/Paris",
  locale: "fr",
};

// Ce endpoint alimente NatalChartTeaserForm (voir /theme-astral et
// /en/natal-chart) : le point d'entrée qui laisse calculer un vrai thème
// natal complet sans compte, avant de proposer d'en créer un pour le
// sauvegarder. Rien n'est persisté ici — voir le commentaire dans la route.
describe("POST /api/public/natal-chart", () => {
  it("computes a full chart for a valid birth input, without persisting anything", async () => {
    const res = await POST(mkReq(VALID_BODY, "203.0.113.20"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hasReliableHouses).toBe(true);
    expect(data.points.sun).toBeTruthy();
    expect(data.points.moon).toBeTruthy();
    expect(data.wheelPoints.length).toBeGreaterThan(0);
    expect(data.chartHighlights.length).toBeGreaterThan(0);
    expect(Array.isArray(data.aspects)).toBe(true);
  });

  it("computes an honest chart without reliable houses when the time is unknown", async () => {
    const res = await POST(
      mkReq({ ...VALID_BODY, birthTime: null, timeUnknown: true }, "203.0.113.21")
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    // hasReliableHouses is the authoritative flag consumers must check —
    // points.asc/mc can still hold a computed-but-unreliable value, exactly
    // as in the authenticated theme-natal page.
    expect(data.hasReliableHouses).toBe(false);
    expect(data.points.sun).toBeTruthy();
  });

  it("rejects a missing birth time when timeUnknown isn't set", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, birthTime: undefined, timeUnknown: false }, "203.0.113.22"));
    expect(res.status).toBe(400);
  });

  it("rejects a birth date outside the accepted range", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, birthDate: "1850-01-01" }, "203.0.113.23"));
    expect(res.status).toBe(400);
  });

  it("rejects an out-of-range latitude", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, latitude: 200 }, "203.0.113.24"));
    expect(res.status).toBe(400);
  });

  it("rejects a timezone that isn't a plausible IANA identifier", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, tzName: "not-a-timezone" }, "203.0.113.25"));
    expect(res.status).toBe(400);
  });

  it("rejects a local birth time that never existed due to a DST spring-forward gap", async () => {
    const res = await POST(
      mkReq({ ...VALID_BODY, birthDate: "2024-03-10", birthTime: "02:30", tzName: "America/New_York" }, "203.0.113.26")
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/heure d'été/i);
  });

  it("rate-limits a single IP after 8 requests within the window", async () => {
    const ip = "203.0.113.27";
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) {
      const res = await POST(mkReq({ ...VALID_BODY, birthDate: `1990-06-${10 + (i % 9)}` }, ip));
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 8)).toEqual(Array(8).fill(200));
    expect(statuses.slice(8)).toEqual([429, 429]);
  });
});
