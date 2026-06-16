import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { InventoryPage } from "@/modules/inventory/components/inventory-page";
import { type InventoryPageSearchParams } from "@/modules/inventory/inventory.page-model";
import { fetchInventoryWorkspace } from "@/modules/inventory/inventory.api";

export default async function InventoryRoutePage(props: {
  searchParams?: Promise<InventoryPageSearchParams>;
}) {
  const user = await requirePermission("view_inventory");
  const searchParams = await props.searchParams;
  const workspace = await fetchInventoryWorkspace();

  return (
    <InventoryPage
      user={user}
      canManageInventory={hasPermission(user, "manage_inventory")}
      products={workspace.products}
      responsibleOptions={workspace.responsibleOptions}
      incomingActs={workspace.incomingActs}
      inventorySessions={workspace.inventorySessions}
      writeoffActs={workspace.writeoffActs}
      employees={workspace.employees}
      techCards={workspace.techCards}
      techCardProducts={workspace.techCardProducts}
      searchParams={searchParams}
    />
  );
}
