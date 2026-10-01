import { describe, it, expect } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as changePassword } from "@/app/api/account/change-password/route";
import { GET as getProfiles } from "@/app/api/profiles/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth/jwt";

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function authProbe() {
  return getProfiles();
}

const email = `vitest-sessioninval-${Date.now()}@example.com`;

// Régression : un jeton de session émis avant un changement de mot de passe
// (donc potentiellement volé, d'où le changement) restait valide jusqu'à ses
// 30 jours d'expiration — voir le commentaire dans getCurrentUserId
// (src/lib/auth/session.ts). Ce test capture le jeton "ancien" avant le
// changement, puis le réinjecte manuellement dans le jar pour vérifier qu'il
// est bien rejeté ensuite, alors que le nouveau jeton réémis reste valide.
describe("session invalidation on password change", () => {
  it("rejects a session token issued before the password change, but keeps the freshly reissued one working", async () => {
    cookieJar.clear();
    await register(jsonRequest("http://localhost/api/auth/register", { email, password: "originalpass1" }));

    const oldToken = cookieJar.get(SESSION_COOKIE_NAME)?.value;
    expect(oldToken).toBeTruthy();

    // The old session works before the change.
    const beforeRes = await authProbe();
    expect(beforeRes.status).toBe(200);

    const changeRes = await changePassword(
      jsonRequest("http://localhost/api/account/change-password", {
        currentPassword: "originalpass1",
        newPassword: "newpass123",
      })
    );
    expect(changeRes.status).toBe(200);

    // The reissued cookie (current jar state) still works.
    const afterWithNewToken = await authProbe();
    expect(afterWithNewToken.status).toBe(200);

    // Replaying the pre-change token must now be rejected.
    cookieJar.set(SESSION_COOKIE_NAME, oldToken!);
    const afterWithOldToken = await authProbe();
    expect(afterWithOldToken.status).toBe(401);
  });
});
