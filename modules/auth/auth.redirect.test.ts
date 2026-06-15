import { describe, expect, it } from "vitest";
import { normalizeAuthReturnTo } from "@/modules/auth/auth.redirect";

describe("normalizeAuthReturnTo", () => {
  it("keeps internal absolute paths", () => {
    expect(normalizeAuthReturnTo("/dashboard/orders")).toBe("/dashboard/orders");
  });

  it("trims whitespace around internal paths", () => {
    expect(normalizeAuthReturnTo("  /dashboard  ")).toBe("/dashboard");
  });

  it("rejects empty, relative and protocol-relative values", () => {
    expect(normalizeAuthReturnTo("")).toBe("/dashboard");
    expect(normalizeAuthReturnTo("dashboard")).toBe("/dashboard");
    expect(normalizeAuthReturnTo("//example.com")).toBe("/dashboard");
    expect(normalizeAuthReturnTo("https://example.com")).toBe("/dashboard");
  });

  it("uses a custom fallback when provided", () => {
    expect(normalizeAuthReturnTo("//example.com", "")).toBe("");
  });
});
