import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import {
  FREE_PROFILE_LIMIT,
  needsProfileSelection,
  archiveExcessProfiles,
  restoreArchivedProfiles,
} from "@/lib/billing/entitlements";

const email = `vitest-archiving-${Date.now()}@example.com`;
let userId: string;
let profileIds: string[];

async function createProfile(userId: string, label: string, isSelf = false) {
  const profile = await prisma.profile.create({
    data: {
      userId,
      label,
      isSelf,
      birthDate: "1990-01-01",
      birthTime: "12:00",
      timeUnknown: false,
      locationName: "Paris, France",
      latitude: 48.8566,
      longitude: 2.3522,
      tzName: "Europe/Paris",
    },
  });
  return profile.id;
}

describe("profile archiving on Premium lapse", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "not-a-real-hash",
        referralCode: `vitest-archiving-${Date.now()}`,
        subscriptionStatus: "free",
      },
    });
    userId = user.id;

    // 5 profils actifs, la première "soi" — dépasse volontairement la
    // limite gratuite (3) pour exercer le déclenchement de la sélection.
    profileIds = [
      await createProfile(userId, "Moi", true),
      await createProfile(userId, "Ami A"),
      await createProfile(userId, "Ami B"),
      await createProfile(userId, "Ami C"),
      await createProfile(userId, "Ami D"),
    ];
  });

  afterAll(async () => {
    await prisma.profile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it("flags a non-Premium account with more active profiles than the free limit", async () => {
    expect(await needsProfileSelection(userId)).toBe(true);
  });

  it("never flags a Premium account, regardless of profile count", async () => {
    await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: "active" } });
    expect(await needsProfileSelection(userId)).toBe(false);
    await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: "free" } });
  });

  it("rejects a selection that isn't exactly the free limit", async () => {
    await expect(archiveExcessProfiles(userId, profileIds.slice(0, 2))).rejects.toThrow();
  });

  it("rejects a selection containing a profile the user doesn't own", async () => {
    await expect(archiveExcessProfiles(userId, [...profileIds.slice(0, 2), "not-a-real-id"])).rejects.toThrow();
  });

  it("archives everything not selected, keeping exactly the chosen ones active", async () => {
    const keep = profileIds.slice(0, FREE_PROFILE_LIMIT);
    await archiveExcessProfiles(userId, keep);

    const active = await prisma.profile.findMany({ where: { userId, archivedAt: null } });
    expect(active.map((p) => p.id).sort()).toEqual([...keep].sort());

    const archived = await prisma.profile.findMany({ where: { userId, archivedAt: { not: null } } });
    expect(archived.map((p) => p.id).sort()).toEqual(profileIds.slice(FREE_PROFILE_LIMIT).sort());
  });

  it("no longer needs a selection once resolved", async () => {
    expect(await needsProfileSelection(userId)).toBe(false);
  });

  it("restores every archived profile when Premium resumes", async () => {
    await restoreArchivedProfiles(userId);
    const active = await prisma.profile.findMany({ where: { userId, archivedAt: null } });
    expect(active).toHaveLength(profileIds.length);
  });
});
