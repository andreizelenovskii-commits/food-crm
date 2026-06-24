import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBrowserBackendApiUrl,
  resolveBrowserBackendApiUrl,
} from "@/shared/api/browser-backend";

function readSource(path: string) {
  return readFileSync(resolve(path), "utf8");
}

describe("browser backend fetch contract", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    window.history.pushState({}, "", "http://localhost:3000/");
  });

  it("does not let shift-sensitive browser reads use stale cache", () => {
    const source = readSource("shared/api/browser-backend.ts");

    expect(source).toContain('cache: "no-store"');
    expect(source).toContain("credentials: \"include\"");
  });

  it("uses same-origin browser API by default on localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_BACKEND_API_URL", "");
    window.history.pushState({}, "", "http://localhost:3000/login");

    expect(getBrowserBackendApiUrl()).toBe("");
  });

  it("uses same-origin browser API by default on 127.0.0.1", () => {
    expect(resolveBrowserBackendApiUrl("127.0.0.1", "")).toBe("");
  });

  it("respects an explicit local backend override", () => {
    vi.stubEnv("NEXT_PUBLIC_BACKEND_API_URL", "http://127.0.0.1:4000");
    window.history.pushState({}, "", "http://localhost:3000/login");

    expect(getBrowserBackendApiUrl()).toBe("http://localhost:4000");
  });

  it("keeps production hosts same-origin", () => {
    expect(resolveBrowserBackendApiUrl(
      "crm.crmandromeda.ru",
      "https://api.crmandromeda.ru",
    )).toBe("");
  });

  it("keeps API and uploads paths relative when same-origin", () => {
    const source = readSource("shared/api/browser-backend.ts");

    expect(source).toContain('`${apiUrl}${path.startsWith("/") ? path : `/${path}`}`');
    expect(source).not.toContain("api/v1/api/v1");
    expect(source).toContain("browserBackendFormData");
  });
});
