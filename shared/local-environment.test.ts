import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(resolve(path), "utf8");
}

describe("local development environment contracts", () => {
  it("local reset refuses non-local databases", () => {
    expect(read("scripts/local-utils.mjs")).toContain("Refusing non-local DATABASE_URL");
    expect(read("scripts/local-reset.mjs")).toContain("RESET LOCAL DATABASE");
  });

  it("frontend env example keeps browser backend override disabled by default", () => {
    const source = read(".env.local.example");

    expect(source).toContain("NEXT_PUBLIC_APP_ENV=local");
    expect(source).not.toMatch(/^NEXT_PUBLIC_BACKEND_API_URL=/m);
    expect(source).not.toContain("api.crmandromeda.ru");
  });

  it("local UI is gated by NEXT_PUBLIC_APP_ENV", () => {
    expect(read("shared/app-env.ts")).toContain('APP_ENV === "local"');
    expect(read("app/dev/page.tsx")).toContain("notFound()");
  });
});
