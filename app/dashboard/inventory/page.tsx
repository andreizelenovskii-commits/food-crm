import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { fetchEmployees } from "@/modules/employees/employees.api";
import { InventoryPage } from "@/modules/inventory/components/inventory-page";
import { type InventoryPageSearchParams } from "@/modules/inventory/inventory.page-model";
import {
  fetchInventoryResponsibleOptions,
  fetchIncomingActs,
  fetchInventorySessions,
  fetchProducts,
  fetchWriteoffActs,
} from "@/modules/inventory/inventory.api";
import {
  fetchTechCardProductOptions,
  fetchTechCards,
} from "@/modules/tech-cards/tech-cards.api";

export default async function InventoryRoutePage(props: {
  searchParams?: Promise<InventoryPageSearchParams>;
}) {
  const user = await requirePermission("view_inventory");
  const searchParams = await props.searchParams;
  const [
    products,
    responsibleOptions,
    incomingActs,
    inventorySessions,
    writeoffActs,
    employees,
    techCards,
    techCardProducts,
  ] = await Promise.all([
    fetchProducts(),
    fetchInventoryResponsibleOptions(),
    fetchIncomingActs(),
    fetchInventorySessions(),
    fetchWriteoffActs(),
    fetchEmployees(),
    fetchTechCards(),
    fetchTechCardProductOptions(),
  ]);

  return (
    <InventoryPage
      user={user}
      canManageInventory={hasPermission(user, "manage_inventory")}
      products={products}
      responsibleOptions={responsibleOptions}
      incomingActs={incomingActs}
      inventorySessions={inventorySessions}
      writeoffActs={writeoffActs}
      employees={employees}
      techCards={techCards}
      techCardProducts={techCardProducts}
      searchParams={searchParams}
    />
  );
}
