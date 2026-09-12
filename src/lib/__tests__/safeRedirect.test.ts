import { describe, it, expect } from "vitest";
import { safeNextPath } from "@/lib/safeRedirect";

describe("safeNextPath", () => {
  it("accepts a plain relative path", () => {
    expect(safeNextPath("/dashboard/profils/reclamer", "/dashboard")).toBe(
      "/dashboard/profils/reclamer"
    );
  });

  it("falls back when next is missing", () => {
    expect(safeNextPath(null, "/dashboard")).toBe("/dashboard");
    expect(safeNextPath(undefined, "/dashboard")).toBe("/dashboard");
    expect(safeNextPath("", "/dashboard")).toBe("/dashboard");
  });

  it("falls back when next doesn't start with a single slash", () => {
    expect(safeNextPath("https://evil.example", "/dashboard")).toBe("/dashboard");
    expect(safeNextPath("evil.example", "/dashboard")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs a browser would treat as external", () => {
    expect(safeNextPath("//evil.example", "/dashboard")).toBe("/dashboard");
    expect(safeNextPath("//evil.example/phishing", "/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example", "/dashboard")).toBe("/dashboard");
  });
});
