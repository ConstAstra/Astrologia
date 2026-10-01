import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { prisma } from "@/lib/db";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as createProfile } from "@/app/api/profiles/route";
import { PUT as updateProfile } from "@/app/api/profiles/[id]/route";

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

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

function deepSynthesisRow(profileId: string) {
  return {
    type: "natal",
    profileId,
    locale: "fr",
    contentJson: JSON.stringify({ general: "x", love: "x", money: "x", career: "x", spiritual: "x" }),
  };
}

const emailA = `vitest-profile-update-a-${Date.now()}@example.com`;
const emailB = `vitest-profile-update-b-${Date.now()}@example.com`;
const password = "updatetest123";

// PUT /api/profiles/[id] est le seul moyen de corriger une naissance mal
// saisie sans perdre l'historique du profil (voir le commentaire dans la
// route) : ce test fige la validation (même règles DST que la création),
// la purge du cache de synthèse IA, et l'étanchéité entre comptes.
describe("PUT /api/profiles/[id]", () => {
  let profileId: string;

  beforeAll(async () => {
    cookieJar.clear();
    await register(jsonRequest("http://localhost/api/auth/register", "POST", { email: emailA, password }));
    const res = await createProfile(jsonRequest("http://localhost/api/profiles", "POST", validProfileBody()));
    const data = await res.json();
    profileId = data.profile.id;
  });

  it("updates the birth time", async () => {
    const res = await updateProfile(
      jsonRequest(`http://localhost/api/profiles/${profileId}`, "PUT", validProfileBody({ birthTime: "08:00" })),
      { params: Promise.resolve({ id: profileId }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.profile.birthTime).toBe("08:00");
  });

  it("rejects a local birth time that never existed due to a DST spring-forward gap", async () => {
    const res = await updateProfile(
      jsonRequest(
        `http://localhost/api/profiles/${profileId}`,
        "PUT",
        validProfileBody({ birthDate: "2024-03-10", birthTime: "02:30", tzName: "America/New_York" })
      ),
      { params: Promise.resolve({ id: profileId }) }
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/heure d'été/i);
  });

  it("purges cached deep-synthesis rows when a birth-relevant field changes", async () => {
    await prisma.deepSynthesis.create({ data: deepSynthesisRow(profileId) });

    const res = await updateProfile(
      jsonRequest(`http://localhost/api/profiles/${profileId}`, "PUT", validProfileBody({ birthTime: "19:45" })),
      { params: Promise.resolve({ id: profileId }) }
    );
    expect(res.status).toBe(200);

    const remaining = await prisma.deepSynthesis.findMany({ where: { profileId } });
    expect(remaining.length).toBe(0);
  });

  it("keeps cached deep-synthesis rows when no birth-relevant field changes", async () => {
    await prisma.deepSynthesis.create({ data: deepSynthesisRow(profileId) });

    // Same birth time as the previous test left in place (19:45) — only the
    // display label changes here.
    const res = await updateProfile(
      jsonRequest(
        `http://localhost/api/profiles/${profileId}`,
        "PUT",
        validProfileBody({ birthTime: "19:45", label: "Nouveau nom" })
      ),
      { params: Promise.resolve({ id: profileId }) }
    );
    expect(res.status).toBe(200);

    const remaining = await prisma.deepSynthesis.findMany({ where: { profileId } });
    expect(remaining.length).toBe(1);
  });

  it("refuses to update a profile belonging to another account", async () => {
    cookieJar.clear();
    await register(jsonRequest("http://localhost/api/auth/register", "POST", { email: emailB, password }));

    const res = await updateProfile(
      jsonRequest(`http://localhost/api/profiles/${profileId}`, "PUT", validProfileBody({ label: "Vol" })),
      { params: Promise.resolve({ id: profileId }) }
    );
    expect(res.status).toBe(404);
  });
});
