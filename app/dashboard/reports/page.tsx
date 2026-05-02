import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { fetchCatalogItems } from "@/modules/catalog/catalog.api";
import { fetchEmployees } from "@/modules/employees/employees.api";
import {
  fetchIncomingActs,
  fetchProducts,
  fetchWriteoffActs,
} from "@/modules/inventory/inventory.api";
import { fetchLoyaltySnapshot } from "@/modules/loyalty/loyalty.api";
import { fetchOrders } from "@/modules/orders/orders.api";
import { ReportsPage } from "@/modules/reports/components/reports-page";
import { normalizeReportMonth } from "@/modules/reports/reports.page-model";

export default async function ReportsRoutePage(props: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const user = await requirePermission("view_dashboard");
  const searchParams = await props.searchParams;
  const month = normalizeReportMonth(searchParams?.month);
  const canViewOrders = hasPermission(user, "view_orders");
  const canViewCatalog = hasPermission(user, "view_catalog");
  const canViewInventory = hasPermission(user, "view_inventory");
  const canViewEmployees = hasPermission(user, "view_employees");

  const [
    orders,
    catalogItems,
    products,
    incomingActs,
    writeoffActs,
    employees,
    loyalty,
  ] = await Promise.all([
    canViewOrders ? fetchOrders() : Promise.resolve([]),
    canViewCatalog ? fetchCatalogItems() : Promise.resolve([]),
    canViewInventory ? fetchProducts() : Promise.resolve([]),
    canViewInventory ? fetchIncomingActs() : Promise.resolve([]),
    canViewInventory ? fetchWriteoffActs() : Promise.resolve([]),
    canViewEmployees ? fetchEmployees() : Promise.resolve([]),
    fetchLoyaltySnapshot().catch(() => null),
  ]);

  return (
    <ReportsPage
      user={user}
      month={month}
      orders={orders}
      catalogItems={catalogItems}
      products={products}
      incomingActs={incomingActs}
      writeoffActs={writeoffActs}
      employees={employees}
      loyalty={loyalty}
    />
  );
}
