import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import { InventoryProductLiveSearch } from "@/modules/inventory/components/inventory-product-live-search";
import { LowStockPanel } from "@/modules/inventory/components/low-stock-panel";
import type { ProductItem } from "@/modules/inventory/inventory.types";

export function InventoryProductsTab({
  products,
  lowStockProducts,
  rawQuery,
  canManageInventory,
}: {
  products: ProductItem[];
  lowStockProducts: ProductItem[];
  rawQuery: string;
  canManageInventory: boolean;
}) {
  return (
    <div className="space-y-4">
      <GlassPanel className="p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Поиск
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">
            По названию товара
          </h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Начни вводить название, и подходящие товары сразу появятся под строкой.
          </p>
        </div>

        <InventoryProductLiveSearch
          initialQuery={rawQuery}
          products={products}
          canManageInventory={canManageInventory}
        />
      </GlassPanel>

      <LowStockPanel products={lowStockProducts} />
    </div>
  );
}
