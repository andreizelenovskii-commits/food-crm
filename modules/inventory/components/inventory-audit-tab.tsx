import { InventoryAuditDialogs } from "@/modules/inventory/components/inventory-audit-dialogs";
import type {
  InventoryResponsibleOption,
  InventorySessionSummary,
  ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryAuditTab({
  products,
  responsibleOptions,
  sessions,
  canManageInventory,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  sessions: InventorySessionSummary[];
  canManageInventory: boolean;
}) {
  return (
    <div>
      <InventoryAuditDialogs
        products={products}
        responsibleOptions={responsibleOptions}
        sessions={sessions}
        canManageInventory={canManageInventory}
      />
    </div>
  );
}
