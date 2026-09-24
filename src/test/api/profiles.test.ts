import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as createProfile } from "@/app/api/profiles/route";

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const email = `vitest-profiles-${Date.now()}@example.com`;
const password = "profilestest123";

function validProfileBody(overrides: Record<string, unknown> = {}) {
  return {
    label: "Moi",
    isSelf: true,
    birthDate: "1990-06-15",
    birthTime: "14:30",
    timeUnknown: false,
    locationName: "Paris, France",
    latitude: 48.8566,
    longitude: 2.3522,
    tzName: "Europe/Paris",
    ...overrides,
  };
}

describe("POST /api/profiles", () => {
  beforeAll(async () => {
    cookieJar.clear();
    await register(jsonRequest("http://localhost/api/auth/register", { email, password }));
  });

  it("creates a profile with a valid birth time and IANA timezone", async () => {
    const res = await createProfile(jsonRequest("http://localhost/api/profiles", validProfileBody()));
    expect(res.status).toBe(200);
  });

  it("rejects a timezone that isn't a recognized IANA zone", async () => {
    const res = await createProfile(
      jsonRequest("http://localhost/api/profiles", validProfileBody({ label: "Faux fuseau", tzName: "Not/AZone" }))
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/fuseau/i);
  });

  it("rejects a local birth time that never existed due to a DST spring-forward gap", async () => {
    // Clocks in America/New_York jump from 1:59:59 straight to 3:00:00 on
    // this date — 2:30 never existed.
    const res = await createProfile(
      jsonRequest(
        "http://localhost/api/profiles",
        validProfileBody({ label: "Heure impossible", birthDate: "2024-03-10", birthTime: "02:30", tzName: "America/New_York" })
      )
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/heure d'été/i);
  });

  it("still accepts the valid time right after the same DST gap", async () => {
    const res = await createProfile(
      jsonRequest(
        "http://localhost/api/profiles",
        validProfileBody({ label: "Après le saut", birthDate: "2024-03-10", birthTime: "03:30", tzName: "America/New_York" })
      )
    );
    expect(res.status).toBe(200);
  });

  it("does not flag a nonexistent time as an error when timeUnknown is set (it's ignored)", async () => {
    const res = await createProfile(
      jsonRequest(
        "http://localhost/api/profiles",
        validProfileBody({
          label: "Heure inconnue",
          birthDate: "2024-03-10",
          birthTime: "02:30",
          timeUnknown: true,
          tzName: "America/New_York",
        })
      )
    );
    expect(res.status).toBe(200);
  });
});
