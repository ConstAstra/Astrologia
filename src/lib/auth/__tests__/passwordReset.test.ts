import { describe, it, expect } from "vitest";
import { createPasswordResetToken, consumePasswordResetToken } from "../passwordReset";
import { prisma } from "@/lib/db";

// Régression pour la course sur usedAt : deux requêtes concurrentes avec le
// même jeton de réinitialisation ne doivent jamais pouvoir toutes les deux
// le consommer (voir le commentaire dans consumePasswordResetToken). Appel
// direct de la fonction (pas de session/cookie en jeu) avec un vrai
// Promise.all, donc une vraie concurrence.
describe("consumePasswordResetToken race condition", () => {
  it("lets only one of two concurrent calls consume the same token", async () => {
    const user = await prisma.user.create({
      data: {
        email: `vitest-pwreset-${Date.now()}@example.com`,
        passwordHash: "x",
        referralCode: `vitest-pwreset-${Date.now()}-code`,
      },
    });
    const token = await createPasswordResetToken(user.id);

    const [a, b] = await Promise.all([consumePasswordResetToken(token), consumePasswordResetToken(token)]);
    const successes = [a, b].filter((r) => r !== null);
    const failures = [a, b].filter((r) => r === null);
    expect(successes).toEqual([user.id]);
    expect(failures).toEqual([null]);
  });

  it("refuses a token that has already been consumed", async () => {
    const user = await prisma.user.create({
      data: {
        email: `vitest-pwreset2-${Date.now()}@example.com`,
        passwordHash: "x",
        referralCode: `vitest-pwreset2-${Date.now()}-code`,
      },
    });
    const token = await createPasswordResetToken(user.id);

    const first = await consumePasswordResetToken(token);
    const second = await consumePasswordResetToken(token);
    expect(first).toBe(user.id);
    expect(second).toBeNull();
  });
});
