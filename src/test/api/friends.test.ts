import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as createInvite } from "@/app/api/friends/invite/route";
import { GET as getInvite } from "@/app/api/friends/invite/[token]/route";
import { POST as acceptInvite } from "@/app/api/friends/invite/[token]/accept/route";
import { prisma } from "@/lib/db";

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function registerAndGetId(email: string, password: string) {
  const res = await register(jsonRequest("http://localhost/api/auth/register", "POST", { email, password }));
  const data = await res.json();
  return data.id as string;
}

const emailA = `vitest-friend-a-${Date.now()}@example.com`;
const emailB = `vitest-friend-b-${Date.now()}@example.com`;
const password = "friendtest123";

describe("friends", () => {
  let userIdA: string;
  let userIdB: string;
  let token: string;

  beforeAll(async () => {
    cookieJar.clear();
    userIdA = await registerAndGetId(emailA, password);
    cookieJar.clear();
    userIdB = await registerAndGetId(emailB, password);
  });

  it("creates a reusable invite for the authenticated user", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailA, password }));

    const res = await createInvite();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeTruthy();
    token = data.token;

    // Réutilise le même lien plutôt que d'en créer un nouveau à chaque appel.
    const res2 = await createInvite();
    const data2 = await res2.json();
    expect(data2.token).toBe(token);
  });

  it("rejects invite creation for an unauthenticated request", async () => {
    cookieJar.clear();
    const res = await createInvite();
    expect(res.status).toBe(401);
  });

  it("returns a 404 for an unknown token", async () => {
    const res = await getInvite(new Request("http://localhost/api/friends/invite/does-not-exist"), {
      params: Promise.resolve({ token: "does-not-exist" }),
    });
    expect(res.status).toBe(404);
  });

  it("shows the invite as the owner's own when viewed by the creator", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailA, password }));
    const res = await getInvite(new Request(`http://localhost/api/friends/invite/${token}`), {
      params: Promise.resolve({ token }),
    });
    const data = await res.json();
    expect(data.isOwnInvite).toBe(true);
  });

  it("rejects accepting your own invite", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailA, password }));
    const res = await acceptInvite(new Request(`http://localhost/api/friends/invite/${token}/accept`, { method: "POST" }), {
      params: Promise.resolve({ token }),
    });
    expect(res.status).toBe(400);

    const friendship = await prisma.friendship.findFirst({ where: { OR: [{ userAId: userIdA }, { userBId: userIdA }] } });
    expect(friendship).toBeNull();
  });

  it("lets a different user accept the invite, creating the friendship", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailB, password }));

    const res = await acceptInvite(new Request(`http://localhost/api/friends/invite/${token}/accept`, { method: "POST" }), {
      params: Promise.resolve({ token }),
    });
    expect(res.status).toBe(200);

    const [userAId, userBId] = userIdA < userIdB ? [userIdA, userIdB] : [userIdB, userIdA];
    const friendship = await prisma.friendship.findUnique({ where: { userAId_userBId: { userAId, userBId } } });
    expect(friendship).not.toBeNull();
  });

  it("is idempotent: accepting the same invite twice does not error or duplicate", async () => {
    const res = await acceptInvite(new Request(`http://localhost/api/friends/invite/${token}/accept`, { method: "POST" }), {
      params: Promise.resolve({ token }),
    });
    expect(res.status).toBe(200);

    const count = await prisma.friendship.count({ where: { OR: [{ userAId: userIdA }, { userBId: userIdA }] } });
    expect(count).toBe(1);
  });

  it("reports alreadyFriends once accepted", async () => {
    const res = await getInvite(new Request(`http://localhost/api/friends/invite/${token}`), {
      params: Promise.resolve({ token }),
    });
    const data = await res.json();
    expect(data.alreadyFriends).toBe(true);
  });
});
