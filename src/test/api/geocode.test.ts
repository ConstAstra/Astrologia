import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/geocode/route";

function mkReq(q: string, ip: string) {
  return new Request(`http://localhost/api/geocode?q=${encodeURIComponent(q)}`, {
    headers: { "x-forwarded-for": ip },
  });
}

describe("GET /api/geocode", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [{ display_name: "Paris, France", lat: "48.8566", lon: "2.3522" }],
      }))
    );
  });

  it("returns no results for a too-short query, without hitting the network", async () => {
    const res = await GET(mkReq("a", "203.0.113.1"));
    const data = await res.json();
    expect(data.results).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it(
    "rate-limits a single IP after 10 requests within the window",
    async () => {
      // Each distinct query serializes behind the real ~1.1s Nominatim
      // throttle (see scheduleNominatimCall in the route), so 12 sequential
      // calls genuinely take upwards of ~13s — hence the longer timeout.
      const ip = "203.0.113.2";
      const statuses: number[] = [];
      for (let i = 0; i < 12; i++) {
        const res = await GET(mkReq(`unique-query-${i}`, ip));
        statuses.push(res.status);
      }
      expect(statuses.slice(0, 10)).toEqual(Array(10).fill(200));
      expect(statuses.slice(10)).toEqual([429, 429]);
    },
    20000
  );

  it(
    "does not let one IP's usage count against a different IP",
    async () => {
      const busyIp = "203.0.113.3";
      for (let i = 0; i < 10; i++) {
        await GET(mkReq(`busy-query-${i}`, busyIp));
      }
      const otherRes = await GET(mkReq("some-other-query", "203.0.113.4"));
      expect(otherRes.status).toBe(200);
    },
    15000
  );

  it("caches results so a repeated query does not call fetch again", async () => {
    const ip = "203.0.113.5";
    await GET(mkReq("Paris-cache-test", ip));
    const callsAfterFirst = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    await GET(mkReq("Paris-cache-test", ip));
    const callsAfterSecond = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callsAfterSecond).toBe(callsAfterFirst);
  });

  it("surfaces a 502 when the upstream service fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }))
    );
    const res = await GET(mkReq("some-failing-query", "203.0.113.6"));
    expect(res.status).toBe(502);
  });
});
