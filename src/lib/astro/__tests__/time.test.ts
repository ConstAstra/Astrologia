import { describe, it, expect } from "vitest";
import { isNonexistentLocalTime, birthInputToUtc } from "@/lib/astro/time";

const base = { latitude: 40.7, longitude: -74 };

describe("isNonexistentLocalTime", () => {
  it("flags a local time that falls inside the spring-forward gap", () => {
    // Clocks in America/New_York jump from 1:59:59 straight to 3:00:00 on
    // this date — 2:30 never existed.
    expect(isNonexistentLocalTime({ ...base, date: "2024-03-10", time: "02:30", tzName: "America/New_York" })).toBe(true);
  });

  it("does not flag a valid time right after the gap", () => {
    expect(isNonexistentLocalTime({ ...base, date: "2024-03-10", time: "03:30", tzName: "America/New_York" })).toBe(false);
  });

  it("does not flag the fall-back ambiguous hour (exists twice, resolved deterministically)", () => {
    expect(isNonexistentLocalTime({ ...base, date: "2024-11-03", time: "01:30", tzName: "America/New_York" })).toBe(false);
  });

  it("does not flag an ordinary time on an ordinary day", () => {
    expect(isNonexistentLocalTime({ ...base, date: "2024-06-15", time: "14:30", tzName: "America/New_York" })).toBe(false);
  });

  it("returns false when the time is unknown, rather than flagging the fallback noon", () => {
    expect(isNonexistentLocalTime({ ...base, date: "2024-03-10", time: null, tzName: "America/New_York", timeUnknown: true })).toBe(
      false
    );
  });

  it("still lets birthInputToUtc resolve a nonexistent local time deterministically (this function only flags it, it doesn't block the conversion)", () => {
    const utc = birthInputToUtc({ ...base, date: "2024-03-10", time: "02:30", tzName: "America/New_York" });
    expect(utc.isValid).toBe(true);
  });
});
