import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as unlock } from "@/app/api/unlock/route";
import { prisma } from "@/lib/db";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const email = `vitest-unlock-${Date.now()}@example.com`;

// Régression pour la course sur le décrément de crédits : deux requêtes de
// déblocage concurrentes ne doivent jamais pouvoir dépenser le même dernier
// crédit deux fois (voir le commentaire dans unlockFeature, src/lib/billing/entitlements.ts).
describe("credit unlock race condition", () => {
  let userId: string;
  let profileA: string;
  let profileB: string;
  let profileC: string;

  beforeAll(async () => {
    cookieJar.clear();
    const res = await register(jsonRequest({ email, password: "unlock12345" }));
    const data = await res.json();
    userId = data.id;

    const [a, b, c] = await Promise.all(
      ["A", "B", "C"].map((label) =>
        prisma.profile.create({
          data: {
            userId,
            label,
            birthDate: "2000-01-01",
            locationName: "Nowhere",
            latitude: 0,
            longitude: 0,
            tzName: "UTC",
            timeUnknown: true,
          },
        })
      )
    );
    profileA = a.id;
    profileB = b.id;
    profileC = c.id;

    await prisma.user.update({ where: { id: userId }, data: { credits: 1 } });
  });

  it("only lets one of two concurrent unlocks spend the last credit", async () => {
    const [resAstro, resSynthesis] = await Promise.all([
      unlock(jsonRequest({ feature: "astrocartography", profileIdA: profileA })),
      unlock(jsonRequest({ feature: "synthesis", profileIdA: profileB })),
    ]);

    const statuses = [resAstro.status, resSynthesis.status].sort();
    expect(statuses).toEqual([200, 402]);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.credits).toBe(0);

    const unlockCount = await prisma.unlock.count({ where: { userId } });
    expect(unlockCount).toBe(1);
  });

  it("still refuses a third unlock once credits are exhausted", async () => {
    const res = await unlock(jsonRequest({ feature: "composite", profileIdA: profileA, profileIdB: profileC }));
    expect(res.status).toBe(402);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.credits).toBe(0);
  });
});
