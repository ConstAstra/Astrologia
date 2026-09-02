import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/public/astrocartography/route";

function mkReq(body: unknown, ip: string) {
  return new Request("http://localhost/api/public/astrocartography", {
    method: "POST",
    headers: { "x-forwarded-for": ip, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  birthDate: "1990-06-15",
  birthTime: "08:30",
  latitude: 48.8566,
  longitude: 2.3522,
  tzName: "Europe/Paris",
  locale: "fr",
};

describe("POST /api/public/astrocartography", () => {
  it("computes a full map for a valid birth chart, without persisting anything", async () => {
    const res = await POST(mkReq(VALID_BODY, "198.51.100.1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mapData.lines.length).toBeGreaterThan(0);
    expect(data.mapData.countryPaths.length).toBeGreaterThan(0);
    expect(data.big3.sun).toBeTruthy();
    expect(data.big3.moon).toBeTruthy();
    expect(data.big3.ascendant).toBeTruthy();
    // Un pays connu (France, coordonnées du profil) doit ressortir avec au moins une ligne.
    expect(data.countryMatches.fr).toBeDefined();
  });

  it("rejects a missing birth time — this tool has no honest 'unknown time' mode", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, birthTime: undefined }, "198.51.100.2"));
    expect(res.status).toBe(400);
  });

  it("rejects a birth date outside the accepted range", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, birthDate: "1850-01-01" }, "198.51.100.3"));
    expect(res.status).toBe(400);
  });

  it("rejects an out-of-range latitude", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, latitude: 200 }, "198.51.100.4"));
    expect(res.status).toBe(400);
  });

  it("rejects a timezone that isn't a plausible IANA identifier", async () => {
    const res = await POST(mkReq({ ...VALID_BODY, tzName: "not-a-timezone" }, "198.51.100.5"));
    expect(res.status).toBe(400);
  });

  it(
    "rate-limits a single IP after 8 requests within the window",
    async () => {
      const ip = "198.51.100.6";
      const statuses: number[] = [];
      for (let i = 0; i < 10; i++) {
        const res = await POST(mkReq(VALID_BODY, ip));
        statuses.push(res.status);
      }
      expect(statuses.slice(0, 8)).toEqual(Array(8).fill(200));
      expect(statuses.slice(8)).toEqual([429, 429]);
    },
    20000
  );

  it(
    "does not let one IP's usage count against a different IP",
    async () => {
      const busyIp = "198.51.100.7";
      for (let i = 0; i < 8; i++) {
        await POST(mkReq(VALID_BODY, busyIp));
      }
      const otherRes = await POST(mkReq(VALID_BODY, "198.51.100.8"));
      expect(otherRes.status).toBe(200);
    },
    15000
  );
});
