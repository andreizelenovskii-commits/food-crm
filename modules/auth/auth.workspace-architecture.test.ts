import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(path), "utf8");
}

function collectPageSources(root: string) {
  const entries = readdirSync(root);
  const pages: string[] = [];

  for (const entry of entries) {
    const path = join(root, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      pages.push(...collectPageSources(path));
      continue;
    }

    if (entry === "page.tsx") {
      pages.push(path);
    }
  }

  return pages.sort();
}

const WORKSPACE_LEAF_PAGES = [
  ...collectPageSources("app/dashboard"),
  ...collectPageSources("app/dispatcher"),
  ...collectPageSources("app/kitchen"),
];

describe("workspace auth architecture", () => {
  it("keeps auth bootstrap in workspace layouts", () => {
    expect(readSource("app/dashboard/layout.tsx")).toContain('requireWorkspaceAccess("crm")');
    expect(readSource("app/dispatcher/layout.tsx")).toContain('requireWorkspaceAccess("dispatcher")');
    expect(readSource("app/kitchen/layout.tsx")).toContain('requireWorkspaceAccess("kitchen")');
  });

  it("keeps all workspace leaf pages free of direct employee auth lookups", () => {
    expect(WORKSPACE_LEAF_PAGES.length).toBeGreaterThan(20);

    for (const path of WORKSPACE_LEAF_PAGES) {
      const source = readSource(path);

      expect(source, path).not.toContain("requirePermission");
      expect(source, path).not.toContain("requireSessionUser");
      expect(source, path).not.toContain("getSessionUser");
      expect(source, path).not.toContain("getCurrentEmployeeSession");
      expect(source, path).not.toContain("/api/v1/auth/me");
    }
  });

  it("keeps workspace shell and session provider out of leaf pages", () => {
    for (const path of WORKSPACE_LEAF_PAGES) {
      const source = readSource(path);

      expect(source, path).not.toContain("AppSidebar");
      expect(source, path).not.toContain("StaffShell");
      expect(source, path).not.toContain("EmployeeSessionProvider");
    }
  });

  it("keeps PageShell presentational", () => {
    const source = readSource("components/ui/page-shell.tsx");

    expect(source).not.toContain("auth.session");
    expect(source).not.toContain("getSessionUser");
    expect(source).not.toContain("AppSidebar");
    expect(source).not.toContain("EmployeeSessionProvider");
  });

  it("keeps workspace shells and providers centralized in layouts", () => {
    const dashboardLayout = readSource("app/dashboard/layout.tsx");
    const dispatcherLayout = readSource("app/dispatcher/layout.tsx");
    const kitchenLayout = readSource("app/kitchen/layout.tsx");

    expect(dashboardLayout).toContain("AppSidebar");
    expect(dashboardLayout).toContain("EmployeeSessionProvider");
    expect(dispatcherLayout).toContain("StaffShell");
    expect(dispatcherLayout).toContain("EmployeeSessionProvider");
    expect(kitchenLayout).toContain("StaffShell");
    expect(kitchenLayout).toContain("EmployeeSessionProvider");
  });

  it("keeps CRM mutation helpers on soft workspace navigation", () => {
    const sources = [
      "components/ui/confirm-delete-button.tsx",
      "modules/catalog/catalog.actions.ts",
      "modules/clients/clients.actions.ts",
      "modules/employees/employees.actions.ts",
      "modules/orders/orders.actions.ts",
      "modules/orders/components/kitchen-workspace.tsx",
      "modules/orders/components/simple-dispatcher-orders.tsx",
      "modules/tech-cards/tech-cards.actions.ts",
    ];

    for (const path of sources) {
      const source = readSource(path);

      expect(source, path).not.toContain("window.location.assign");
      expect(source, path).not.toContain("window.location.reload");
      expect(source, path).not.toContain("location.href");
    }
  });

  it("uses React cache for request-scoped employee session deduplication", () => {
    const source = readSource("modules/auth/server/employee-session.ts");

    expect(source).toContain('import { cache } from "react"');
    expect(source).toContain('backendGetResult<SessionUser>("/api/v1/auth/me")');
    expect(source).not.toContain("new Map");
    expect(source).not.toContain("localStorage");
  });
});
