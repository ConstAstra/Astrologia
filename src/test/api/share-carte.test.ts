import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/share/carte/route";

function mkReq(params: Record<string, string>, ip: string) {
  const search = new URLSearchParams(params).toString();
  return new Request(`http://localhost/api/share/carte?${search}`, {
    headers: { "x-forwarded-for": ip },
  });
}

const VALID_PARAMS = {
  name: "Constance",
  locale: "fr",
  sun: "gemeaux",
  moon: "poissons",
  ascendant: "cancer",
  countryId: "ca",
  lines: "sun-MC,jupiter-AC",
  format: "post",
};

describe("GET /api/share/carte", () => {
  it("returns a PNG image for a valid request", async () => {
    const res = await GET(mkReq(VALID_PARAMS, "203.0.113.10"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("rejects an invalid sun sign", async () => {
    const res = await GET(mkReq({ ...VALID_PARAMS, sun: "not-a-sign" }, "203.0.113.11"));
    expect(res.status).toBe(400);
  });

  it("rejects a country not in the covered list", async () => {
    const res = await GET(mkReq({ ...VALID_PARAMS, countryId: "atlantis" }, "203.0.113.12"));
    expect(res.status).toBe(400);
  });

  it("silently drops malformed line tokens instead of crashing", async () => {
    const res = await GET(mkReq({ ...VALID_PARAMS, lines: "sun-MC,garbage-XX,,venus-DC" }, "203.0.113.13"));
    expect(res.status).toBe(200);
  });

  it("works without an ascendant (unreliable houses case)", async () => {
    const { ascendant: _unused, ...withoutAsc } = VALID_PARAMS;
    const res = await GET(mkReq(withoutAsc, "203.0.113.14"));
    expect(res.status).toBe(200);
  });

  it("renders the story format too", async () => {
    const res = await GET(mkReq({ ...VALID_PARAMS, format: "story" }, "203.0.113.15"));
    expect(res.status).toBe(200);
  });

  it("rate-limits a single IP after 15 requests within the window", async () => {
    const ip = "203.0.113.16";
    const statuses: number[] = [];
    for (let i = 0; i < 17; i++) {
      const res = await GET(mkReq(VALID_PARAMS, ip));
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 15)).toEqual(Array(15).fill(200));
    expect(statuses.slice(15)).toEqual([429, 429]);
  });
});
