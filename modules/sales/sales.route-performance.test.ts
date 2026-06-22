import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(path), "utf8");
}

describe("sales route performance contract", () => {
  it("uses the compact analytics endpoint instead of full datasets", () => {
    const source = readSource("app/dashboard/sales/page.tsx");

    expect(source).toContain("fetchSalesAnalytics");
    expect(source).not.toContain("fetchOrders");
    expect(source).not.toContain("fetchCatalogItems");
    expect(source).not.toContain("fetchProducts");
    expect(source).not.toContain("fetchTechCards");
    expect(source).not.toContain("fetchIncomingActs");
    expect(source).not.toContain("fetchWriteoffActs");
  });

  it("keeps PageShell presentational and sales leaf free of auth lookup", () => {
    const pageShellSource = readSource("components/ui/page-shell.tsx");
    const salesPageSource = readSource("modules/sales/components/sales-page.tsx");
    const salesRouteSource = readSource("app/dashboard/sales/page.tsx");

    expect(pageShellSource).not.toContain("getSessionUser");
    expect(pageShellSource).not.toContain("AppSidebar");
    expect(salesPageSource).not.toContain("SessionUserActions");
    expect(salesPageSource).not.toContain("user={");
    expect(salesRouteSource).not.toContain("requirePermission");
  });
});
