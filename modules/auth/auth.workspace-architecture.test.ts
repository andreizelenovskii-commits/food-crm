import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(path), "utf8");
}

const MIGRATED_LEAF_PAGES = [
  "app/dashboard/page.tsx",
  "app/dashboard/sales/page.tsx",
  "app/dashboard/clients/page.tsx",
  "app/dashboard/inventory/page.tsx",
  "app/dispatcher/orders/page.tsx",
  "app/dispatcher/clients/page.tsx",
  "app/kitchen/page.tsx",
];

describe("workspace auth architecture", () => {
  it("keeps auth bootstrap in workspace layouts", () => {
    expect(readSource("app/dashboard/layout.tsx")).toContain('requireWorkspaceAccess("crm")');
    expect(readSource("app/dispatcher/layout.tsx")).toContain('requireWorkspaceAccess("dispatcher")');
    expect(readSource("app/kitchen/layout.tsx")).toContain('requireWorkspaceAccess("kitchen")');
  });

  it("keeps migrated leaf pages free of employee auth lookups", () => {
    for (const path of MIGRATED_LEAF_PAGES) {
      const source = readSource(path);

      expect(source, path).not.toContain("requirePermission");
      expect(source, path).not.toContain("requireSessionUser");
      expect(source, path).not.toContain("getSessionUser");
      expect(source, path).not.toContain("/api/v1/auth/me");
    }
  });

  it("keeps PageShell presentational", () => {
    const source = readSource("components/ui/page-shell.tsx");

    expect(source).not.toContain("auth.session");
    expect(source).not.toContain("getSessionUser");
    expect(source).not.toContain("AppSidebar");
  });

  it("uses React cache for request-scoped employee session deduplication", () => {
    const source = readSource("modules/auth/server/employee-session.ts");

    expect(source).toContain('import { cache } from "react"');
    expect(source).toContain('backendGetResult<SessionUser>("/api/v1/auth/me")');
    expect(source).not.toContain("new Map");
    expect(source).not.toContain("localStorage");
  });
});
