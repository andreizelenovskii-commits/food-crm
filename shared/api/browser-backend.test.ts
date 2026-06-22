import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(path), "utf8");
}

describe("browser backend fetch contract", () => {
  it("does not let shift-sensitive browser reads use stale cache", () => {
    const source = readSource("shared/api/browser-backend.ts");

    expect(source).toContain('cache: "no-store"');
    expect(source).toContain("credentials: \"include\"");
  });
});
