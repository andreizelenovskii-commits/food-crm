import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { fetchCatalogItems } from "@/modules/catalog/catalog.api";
import { fetchClients } from "@/modules/clients/clients.api";
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
import { fetchTechCards } from "@/modules/tech-cards/tech-cards.api";

function padDatePart(value: string | undefined, fallback: string) {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0
    ? String(normalized).padStart(2, "0")
    : fallback;
}

function resolveDateParam(searchParams?: { date?: string; day?: string; month?: string; year?: string }) {
  if (searchParams?.year || searchParams?.month || searchParams?.day) {
    const now = new Date();
    const year = String(Number(searchParams.year) || now.getFullYear());
    const month = padDatePart(searchParams.month, "01");
    const day = padDatePart(searchParams.day, "01");

    return `${year}-${month}-${day}`;
  }

  return searchParams?.date;
}

export default async function ReportsRoutePage(props: {
  searchParams?: Promise<{ period?: string; date?: string; day?: string; month?: string; year?: string }>;
}) {
  const user = await requirePermission("view_dashboard");
  const searchParams = await props.searchParams;
  const month = searchParams?.month && !searchParams.year && !searchParams.day
    ? normalizeReportMonth(searchParams.month)
    : undefined;
  const canViewOrders = hasPermission(user, "view_orders");
  const canViewCatalog = hasPermission(user, "view_catalog");
  const canViewInventory = hasPermission(user, "view_inventory");
  const canViewEmployees = hasPermission(user, "view_employees");
  const canViewClients = hasPermission(user, "view_clients");

  const [
    orders,
    catalogItems,
    products,
    techCards,
    incomingActs,
    writeoffActs,
    employees,
    clients,
    loyalty,
  ] = await Promise.all([
    canViewOrders ? fetchOrders() : Promise.resolve([]),
    canViewCatalog ? fetchCatalogItems() : Promise.resolve([]),
    canViewInventory ? fetchProducts() : Promise.resolve([]),
    canViewInventory ? fetchTechCards() : Promise.resolve([]),
    canViewInventory ? fetchIncomingActs() : Promise.resolve([]),
    canViewInventory ? fetchWriteoffActs() : Promise.resolve([]),
    canViewEmployees ? fetchEmployees() : Promise.resolve([]),
    canViewClients ? fetchClients() : Promise.resolve([]),
    fetchLoyaltySnapshot().catch(() => null),
  ]);

  return (
    <ReportsPage
      user={user}
      period={searchParams?.period}
      date={resolveDateParam(searchParams)}
      month={month}
      orders={orders}
      catalogItems={catalogItems}
      products={products}
      techCards={techCards}
      incomingActs={incomingActs}
      writeoffActs={writeoffActs}
      employees={employees}
      clients={clients}
      loyalty={loyalty}
    />
  );
}
