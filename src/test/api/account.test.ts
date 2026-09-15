import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as changePassword } from "@/app/api/account/change-password/route";
import { POST as changeEmail } from "@/app/api/account/change-email/route";
import { POST as deleteAccount } from "@/app/api/account/delete/route";
import { prisma } from "@/lib/db";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const email = `vitest-account-${Date.now()}@example.com`;

describe("account management", () => {
  beforeAll(async () => {
    cookieJar.clear();
    await register(jsonRequest({ email, password: "originalpass1" }));
    // registering leaves the session cookie set for the rest of this file
  });

  describe("change-password", () => {
    it("rejects the wrong current password", async () => {
      const res = await changePassword(jsonRequest({ currentPassword: "nope", newPassword: "newpass123" }));
      expect(res.status).toBe(401);
    });

    it("accepts the right current password and actually changes it", async () => {
      const res = await changePassword(
        jsonRequest({ currentPassword: "originalpass1", newPassword: "newpass123" })
      );
      expect(res.status).toBe(200);

      const user = await prisma.user.findUniqueOrThrow({ where: { email } });
      const { verifyPassword } = await import("@/lib/auth/password");
      expect(await verifyPassword("newpass123", user.passwordHash)).toBe(true);
      expect(await verifyPassword("originalpass1", user.passwordHash)).toBe(false);
    });

    it("rejects a request with no session cookie", async () => {
      cookieJar.clear();
      const res = await changePassword(jsonRequest({ currentPassword: "newpass123", newPassword: "whatever12" }));
      expect(res.status).toBe(401);
    });
  });

  describe("change-email", () => {
    beforeAll(async () => {
      cookieJar.clear();
      await register(jsonRequest({ email, password: "newpass123" })); // re-login (previous session was cleared above)
    });

    it("rejects the wrong password", async () => {
      const res = await changeEmail(jsonRequest({ newEmail: "renamed@example.com", password: "wrong" }));
      expect(res.status).toBe(401);
    });

    it("rejects an email already used by another account", async () => {
      const otherEmail = `vitest-other-${Date.now()}@example.com`;
      cookieJar.clear();
      await register(jsonRequest({ email: otherEmail, password: "somepassword1" }));

      // Log back in as the original account (registering `otherEmail` above
      // replaced the session cookie with that new account's session).
      cookieJar.clear();
      const { POST: login } = await import("@/app/api/auth/login/route");
      await login(jsonRequest({ email, password: "newpass123" }));

      const res = await changeEmail(jsonRequest({ newEmail: otherEmail, password: "newpass123" }));
      expect(res.status).toBe(409);
    });

    it("changes the email with the right password", async () => {
      const newEmail = `vitest-renamed-${Date.now()}@example.com`;
      const res = await changeEmail(jsonRequest({ newEmail, password: "newpass123" }));
      expect(res.status).toBe(200);

      const user = await prisma.user.findUnique({ where: { email: newEmail } });
      expect(user).not.toBeNull();
      const stale = await prisma.user.findUnique({ where: { email } });
      expect(stale).toBeNull();
    });
  });

  describe("delete", () => {
    const disposableEmail = `vitest-disposable-${Date.now()}@example.com`;

    beforeAll(async () => {
      cookieJar.clear();
      await register(jsonRequest({ email: disposableEmail, password: "todelete123" }));
    });

    it("rejects the wrong password and leaves the account intact", async () => {
      const res = await deleteAccount(jsonRequest({ password: "wrongpassword" }));
      expect(res.status).toBe(401);
      const stillThere = await prisma.user.findUnique({ where: { email: disposableEmail } });
      expect(stillThere).not.toBeNull();
    });

    it("deletes the account with the right password, and clears the session", async () => {
      const res = await deleteAccount(jsonRequest({ password: "todelete123" }));
      expect(res.status).toBe(200);

      const gone = await prisma.user.findUnique({ where: { email: disposableEmail } });
      expect(gone).toBeNull();
      expect(cookieJar.get("astrologium_session")).toBeUndefined();
    });

    it("cascades profile deletion along with the account", async () => {
      cookieJar.clear();
      const cascadeEmail = `vitest-cascade-${Date.now()}@example.com`;
      const regRes = await register(jsonRequest({ email: cascadeEmail, password: "cascade123" }));
      const { id: userId } = await regRes.json();

      const profile = await prisma.profile.create({
        data: {
          userId,
          label: "Test",
          birthDate: "2000-01-01",
          birthTime: "12:00",
          locationName: "Nowhere",
          latitude: 0,
          longitude: 0,
          tzName: "UTC",
        },
      });

      await deleteAccount(jsonRequest({ password: "cascade123" }));

      const orphanProfile = await prisma.profile.findUnique({ where: { id: profile.id } });
      expect(orphanProfile).toBeNull();
    });
  });
});
