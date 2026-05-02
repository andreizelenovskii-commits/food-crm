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

export default async function SalesRoutePage() {
  const user = await requirePermission("view_dashboard");
  const canViewOrders = hasPermission(user, "view_orders");
  const canViewCatalog = hasPermission(user, "view_catalog");
  const canViewInventory = hasPermission(user, "view_inventory");

  const [orders, catalogItems, products, incomingActs, writeoffActs] =
    await Promise.all([
      canViewOrders ? fetchOrders() : Promise.resolve([]),
      canViewCatalog ? fetchCatalogItems() : Promise.resolve([]),
      canViewInventory ? fetchProducts() : Promise.resolve([]),
      canViewInventory ? fetchIncomingActs() : Promise.resolve([]),
      canViewInventory ? fetchWriteoffActs() : Promise.resolve([]),
    ]);

  return (
    <SalesPage
      user={user}
      orders={orders}
      catalogItems={catalogItems}
      products={products}
      incomingActs={incomingActs}
      writeoffActs={writeoffActs}
    />
  );
}
