import { describe, it, expect } from "vitest";
import { trackEvent } from "../analytics";
import { prisma } from "@/lib/db";

describe("trackEvent", () => {
  it("records an event row with the given name, user and metadata", async () => {
    const user = await prisma.user.create({
      data: {
        email: `vitest-analytics-${Date.now()}@example.com`,
        passwordHash: "x",
        referralCode: `vitest-analytics-${Date.now()}-code`,
      },
    });

    await trackEvent("paywall_hit", user.id, { feature: "synastry" });

    const events = await prisma.productEvent.findMany({ where: { userId: user.id } });
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("paywall_hit");
    expect(events[0].metadata).toEqual({ feature: "synastry" });
  });

  it("accepts a null userId (event not tied to an account)", async () => {
    await trackEvent("signup", null, { hasReferrer: false });
    // No assertion beyond "doesn't throw" — this is the anonymous-event path.
  });
});
