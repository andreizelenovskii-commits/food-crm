import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { fetchCatalogItems } from "@/modules/catalog/catalog.api";
import {
  fetchIncomingActs,
  fetchProducts,
  fetchWriteoffActs,
} from "@/modules/inventory/inventory.api";
import { fetchOrders } from "@/modules/orders/orders.api";
import { SalesPage } from "@/modules/sales/components/sales-page";
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

export default async function SalesRoutePage(props: {
  searchParams?: Promise<{ period?: string; date?: string; day?: string; month?: string; year?: string }>;
}) {
  const user = await requirePermission("view_dashboard");
  const searchParams = await props.searchParams;
  const canViewOrders = hasPermission(user, "view_orders");
  const canViewCatalog = hasPermission(user, "view_catalog");
  const canViewInventory = hasPermission(user, "view_inventory");

  const [orders, catalogItems, products, techCards, incomingActs, writeoffActs] =
    await Promise.all([
      canViewOrders ? fetchOrders() : Promise.resolve([]),
      canViewCatalog ? fetchCatalogItems() : Promise.resolve([]),
      canViewInventory ? fetchProducts() : Promise.resolve([]),
      canViewInventory ? fetchTechCards() : Promise.resolve([]),
      canViewInventory ? fetchIncomingActs() : Promise.resolve([]),
      canViewInventory ? fetchWriteoffActs() : Promise.resolve([]),
    ]);

  return (
    <SalesPage
      user={user}
      period={searchParams?.period}
      date={resolveDateParam(searchParams)}
      orders={orders}
      catalogItems={catalogItems}
      products={products}
      techCards={techCards}
      incomingActs={incomingActs}
      writeoffActs={writeoffActs}
    />
  );
}
