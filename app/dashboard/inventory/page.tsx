import { InventoryPage } from "@/modules/inventory/components/inventory-page";
import { type InventoryPageSearchParams } from "@/modules/inventory/inventory.page-model";
import { fetchInventoryWorkspace } from "@/modules/inventory/inventory.api";

export default async function InventoryRoutePage(props: {
  searchParams?: Promise<InventoryPageSearchParams>;
}) {
  const searchParams = await props.searchParams;
  const workspace = await fetchInventoryWorkspace();

  return (
    <InventoryPage
      canManageInventory={true}
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
