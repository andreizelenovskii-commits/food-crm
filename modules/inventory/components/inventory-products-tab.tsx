import { ModuleIcon } from "@/components/ui/module-icon";
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
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="box" className="h-5 w-5" />
          </span>
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
        </div>

        <InventoryProductLiveSearch
          initialQuery={rawQuery}
          products={products}
          canManageInventory={canManageInventory}
        />
      </GlassPanel>

      <LowStockPanel products={lowStockProducts} canManageInventory={canManageInventory} />
    </div>
  );
}
