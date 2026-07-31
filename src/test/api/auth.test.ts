import { describe, it, expect, beforeEach } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/db";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("register + login", () => {
  const email = `vitest-${Date.now()}@example.com`;

  beforeEach(() => {
    cookieJar.clear();
  });

  it("creates an account and immediately opens a session", async () => {
    const res = await register(jsonRequest({ email, password: "hunter22", name: "Vitest" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe(email);
    // register() must have set the session cookie via createSessionCookie.
    expect(cookieJar.get("astrologia_session")).toBeDefined();
  });

  it("rejects registering the same email twice", async () => {
    const res = await register(jsonRequest({ email, password: "anotherpass" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/existe déjà/i);
  });

  it("logs in with the right password and rejects the wrong one", async () => {
    cookieJar.clear();

    const wrongRes = await login(jsonRequest({ email, password: "wrongpassword" }));
    expect(wrongRes.status).toBe(401);
    expect(cookieJar.get("astrologia_session")).toBeUndefined();

    const rightRes = await login(jsonRequest({ email, password: "hunter22" }));
    expect(rightRes.status).toBe(200);
    expect(cookieJar.get("astrologia_session")).toBeDefined();
  });

  it("rejects an unknown email with the same generic message as a wrong password (no user enumeration)", async () => {
    const unknownRes = await login(jsonRequest({ email: "nobody-vitest@example.com", password: "whatever1" }));
    const wrongPasswordRes = await login(jsonRequest({ email, password: "wrongpassword" }));
    expect(unknownRes.status).toBe(wrongPasswordRes.status);
    expect((await unknownRes.json()).error).toBe((await wrongPasswordRes.json()).error);
  });

  it("hashes the password rather than storing it in clear", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.passwordHash).not.toBe("hunter22");
    expect(user.passwordHash.length).toBeGreaterThan(20);
  });
});
