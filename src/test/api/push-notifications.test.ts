import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as subscribe, DELETE as unsubscribe } from "@/app/api/notifications/push-subscribe/route";
import { prisma } from "@/lib/db";

function jsonRequest(url: string, method: string, body: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const email = `vitest-push-${Date.now()}@example.com`;
const endpoint = `https://push.example.com/subscription/${Date.now()}`;

describe("push notifications", () => {
  let userId: string;

  beforeAll(async () => {
    cookieJar.clear();
    const res = await register(jsonRequest("http://localhost/api/auth/register", "POST", { email, password: "pushtest123" }));
    const data = await res.json();
    userId = data.id;
  });

  it("rejects an unauthenticated subscribe request", async () => {
    cookieJar.clear();
    const res = await subscribe(
      jsonRequest("http://localhost/api/notifications/push-subscribe", "POST", {
        endpoint,
        keys: { p256dh: "key", auth: "secret" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("saves a subscription and flips dailyTransitPushOptIn on", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email, password: "pushtest123" }));

    const res = await subscribe(
      jsonRequest("http://localhost/api/notifications/push-subscribe", "POST", {
        endpoint,
        keys: { p256dh: "key", auth: "secret" },
      })
    );
    expect(res.status).toBe(200);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.dailyTransitPushOptIn).toBe(true);

    const sub = await prisma.pushSubscription.findUnique({ where: { endpoint } });
    expect(sub?.userId).toBe(userId);
  });

  it("rejects an invalid payload", async () => {
    const res = await subscribe(
      jsonRequest("http://localhost/api/notifications/push-subscribe", "POST", { endpoint: "not-a-url" })
    );
    expect(res.status).toBe(400);
  });

  it("removes the subscription and flips the opt-in back off once none remain", async () => {
    const res = await unsubscribe(jsonRequest("http://localhost/api/notifications/push-subscribe", "DELETE", { endpoint }));
    expect(res.status).toBe(200);

    const sub = await prisma.pushSubscription.findUnique({ where: { endpoint } });
    expect(sub).toBeNull();

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.dailyTransitPushOptIn).toBe(false);
  });
});
