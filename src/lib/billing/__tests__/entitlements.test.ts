import { describe, it, expect, afterEach, vi } from "vitest";
import { isPremiumActive, isAvatarGlowing } from "../entitlements";

const baseUser = { email: "someone@example.com", subscriptionStatus: "free", currentPeriodEnd: null as Date | null };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isPremiumActive", () => {
  it("is true for an active subscription", () => {
    expect(isPremiumActive({ ...baseUser, subscriptionStatus: "active" })).toBe(true);
  });

  it("is true for a trialing subscription", () => {
    expect(isPremiumActive({ ...baseUser, subscriptionStatus: "trialing" })).toBe(true);
  });

  it("is false for a free account", () => {
    expect(isPremiumActive(baseUser)).toBe(false);
  });

  it("is false once currentPeriodEnd is in the past", () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    expect(isPremiumActive({ ...baseUser, subscriptionStatus: "active", currentPeriodEnd: yesterday })).toBe(false);
  });

  it("grants Premium to an admin email even without any subscription", () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    expect(isPremiumActive({ ...baseUser, email: "admin@example.com" })).toBe(true);
  });

  it("matches admin emails case-insensitively", () => {
    vi.stubEnv("ADMIN_EMAILS", "Admin@Example.com");
    expect(isPremiumActive({ ...baseUser, email: "admin@example.com" })).toBe(true);
  });

  it("does not grant Premium to an email absent from ADMIN_EMAILS", () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    expect(isPremiumActive(baseUser)).toBe(false);
  });
});

describe("isAvatarGlowing", () => {
  it("glows for an admin even with a low streak and no subscription", () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    expect(isAvatarGlowing({ ...baseUser, email: "admin@example.com", currentStreak: 0 })).toBe(true);
  });

  it("does not glow for a non-admin free account with a low streak", () => {
    expect(isAvatarGlowing({ ...baseUser, currentStreak: 0 })).toBe(false);
  });
});
