import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as redeem } from "@/app/api/gift/redeem/route";
import { prisma } from "@/lib/db";

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const emailA = `vitest-giftredeem-a-${Date.now()}@example.com`;
const emailB = `vitest-giftredeem-b-${Date.now()}@example.com`;
const password = "giftredeem12345";
const code = `VITESTGIFT${Date.now()}`;

// Régression pour la course sur redemptionCount : la lecture de
// redemptionCount/maxRedemptions et son incrément se faisaient en deux temps
// (voir le commentaire dans gift/redeem/route.ts), permettant à deux comptes
// différents de dépasser la limite d'un code à usage unique s'ils
// redeemaient au même instant. Le test ci-dessous est séquentiel plutôt que
// concurrent : le mock de cookies() dans src/test/setup.ts est un jar
// unique partagé, pas un cookie par requête, donc il ne peut pas simuler
// deux comptes qui appellent réellement en même temps (voir unlock.test.ts,
// dont le test concurrent porte sur UN SEUL compte, cas que le jar supporte
// bien). Ce test vérifie donc la borne fonctionnelle du correctif — une fois
// la limite atteinte, personne d'autre ne peut plus rédempter — pas la
// fenêtre de course elle-même.
describe("gift code redemption limit", () => {
  beforeAll(async () => {
    cookieJar.clear();
    await register(jsonRequest("http://localhost/api/auth/register", { email: emailA, password }));
    cookieJar.clear();
    await register(jsonRequest("http://localhost/api/auth/register", { email: emailB, password }));

    await prisma.giftCode.create({
      data: {
        code,
        grantType: "credits",
        creditsAmount: 5,
        maxRedemptions: 1,
      },
    });
  });

  it("lets the first account redeem a single-use code", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", { email: emailA, password }));

    const res = await redeem(jsonRequest("http://localhost/api/gift/redeem", { code }));
    expect(res.status).toBe(200);

    const giftCode = await prisma.giftCode.findUniqueOrThrow({ where: { code } });
    expect(giftCode.redemptionCount).toBe(1);
  });

  it("refuses a second account once the redemption limit is reached, without over-incrementing", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", { email: emailB, password }));

    const res = await redeem(jsonRequest("http://localhost/api/gift/redeem", { code }));
    expect(res.status).toBe(400);

    const giftCode = await prisma.giftCode.findUniqueOrThrow({ where: { code } });
    expect(giftCode.redemptionCount).toBe(1);

    const redemptionCount = await prisma.giftCodeRedemption.count({ where: { giftCodeId: giftCode.id } });
    expect(redemptionCount).toBe(1);
  });
});
