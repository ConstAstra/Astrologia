import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as checkIn } from "@/app/api/transit-checkin/route";
import { prisma } from "@/lib/db";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/transit-checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const email = `vitest-checkin-${Date.now()}@example.com`;

describe("transit check-in", () => {
  let userId: string;
  let profileId: string;
  let otherProfileId: string;

  beforeAll(async () => {
    cookieJar.clear();
    const res = await register(jsonRequest({ email, password: "checkin12345" }));
    const data = await res.json();
    userId = data.id;

    const profile = await prisma.profile.create({
      data: {
        userId,
        label: "Moi",
        isSelf: true,
        birthDate: "2000-01-01",
        birthTime: "12:00",
        locationName: "Nowhere",
        latitude: 0,
        longitude: 0,
        tzName: "UTC",
      },
    });
    profileId = profile.id;

    const otherUser = await register(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `vitest-checkin-other-${Date.now()}@example.com`, password: "other12345" }),
      })
    ).then((r) => r.json());
    const otherProfile = await prisma.profile.create({
      data: {
        userId: otherUser.id,
        label: "Quelqu'un d'autre",
        birthDate: "1990-01-01",
        locationName: "Nowhere",
        latitude: 0,
        longitude: 0,
        tzName: "UTC",
        timeUnknown: true,
      },
    });
    otherProfileId = otherProfile.id;

    // La création du second compte a écrasé le cookie de session — on se
    // reconnecte comme le premier utilisateur pour le reste des tests.
    cookieJar.clear();
    const { POST: login } = await import("@/app/api/auth/login/route");
    await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "checkin12345" }),
      })
    );
  });

  it("rejects an unauthenticated request", async () => {
    cookieJar.clear();
    const res = await checkIn(jsonRequest({ profileId, date: "2026-01-01", reaction: "vrai" }));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid payload", async () => {
    const { POST: login } = await import("@/app/api/auth/login/route");
    await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "checkin12345" }),
      })
    );
    const res = await checkIn(jsonRequest({ profileId, date: "2026-01-01", reaction: "not-a-real-reaction" }));
    expect(res.status).toBe(400);
  });

  it("rejects a future date", async () => {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 1);
    const res = await checkIn(
      jsonRequest({ profileId, date: farFuture.toISOString().slice(0, 10), reaction: "vrai" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects checking in on someone else's profile", async () => {
    const res = await checkIn(jsonRequest({ profileId: otherProfileId, date: "2026-01-01", reaction: "vrai" }));
    expect(res.status).toBe(403);
  });

  it("saves a check-in for a past date", async () => {
    const res = await checkIn(jsonRequest({ profileId, date: "2026-01-01", reaction: "partiellement" }));
    expect(res.status).toBe(200);

    const saved = await prisma.transitCheckIn.findUnique({
      where: { profileId_date: { profileId, date: "2026-01-01" } },
    });
    expect(saved?.reaction).toBe("partiellement");
  });

  it("overwrites the same day's check-in instead of stacking a new one", async () => {
    await checkIn(jsonRequest({ profileId, date: "2026-01-01", reaction: "vrai" }));

    const all = await prisma.transitCheckIn.findMany({ where: { profileId, date: "2026-01-01" } });
    expect(all).toHaveLength(1);
    expect(all[0].reaction).toBe("vrai");
  });
});
