import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import { InventoryAuditTab } from "@/modules/inventory/components/inventory-audit-tab";
import { InventoryIncomingPanel } from "@/modules/inventory/components/inventory-incoming-panel";
import { InventoryProductsDialogButton } from "@/modules/inventory/components/inventory-products-dialog-button";
import { InventoryRecipesTab } from "@/modules/inventory/components/inventory-recipes-tab";
import { InventorySuppliersTab } from "@/modules/inventory/components/inventory-suppliers-tab";
import { InventoryWriteoffPanel } from "@/modules/inventory/components/inventory-writeoff-panel";
import { InventoryProductsTab } from "@/modules/inventory/components/inventory-products-tab";
import {
  buildInventoryPageViewModel,
  type InventoryTab,
  type InventoryPageProps,
} from "@/modules/inventory/inventory.page-model";

const INVENTORY_TAB_TITLES: Record<InventoryTab, string> = {
  products: "Товары и остатки",
  incoming: "Поступление товара",
  suppliers: "Поставщики",
  writeoff: "Списание товара",
  audit: "Инвентаризация",
  recipes: "Технологические карты",
};

export function InventoryPage({
  user,
  canManageInventory,
  products,
  responsibleOptions,
  incomingActs,
  inventorySessions,
  writeoffActs,
  employees,
  techCards,
  techCardProducts,
  searchParams,
}: InventoryPageProps) {
  const {
    activeTab,
    rawQuery,
    selectedRecipeCategory,
    lowStockProducts,
    lowStockCount,
    zeroStockCount,
    filteredTechCards,
    recipeCategorySummaries,
    clearRecipeDraft,
  } = buildInventoryPageViewModel({
    products,
    techCards,
    searchParams,
  });

  return (
    <PageShell
      title="Склад"
      description="Здесь хранится всё по складу: товары, остатки, средняя закупочная цена и движение."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff2f2_46%,#f8eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-white/80 blur-3xl" />

        <div className="relative grid gap-4 xl:grid-cols-[minmax(300px,0.86fr)_minmax(420px,1.14fr)]">
          <GlassPanel className="foodlike-float-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-800/75">
              FoodLike inventory
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
              {INVENTORY_TAB_TITLES[activeTab]}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
              Управляй остатками, приходами, списаниями и ревизиями из одной
              спокойной рабочей зоны. Вкладки склада теперь раскрываются в
              левом меню рядом с модулем.
            </p>
          </GlassPanel>

          <InventoryProductsDialogButton
            products={products}
            canManageInventory={canManageInventory}
          />
        </div>

        <div className="relative mt-4">
          {activeTab === "products" ? (
            <InventoryProductsTab
              products={products}
              lowStockProducts={lowStockProducts}
              rawQuery={rawQuery}
              canManageInventory={canManageInventory}
            />
          ) : null}

          {activeTab === "incoming" ? (
            <InventoryIncomingPanel
              products={products}
              responsibleOptions={responsibleOptions}
              acts={incomingActs}
              canManageInventory={canManageInventory}
            />
          ) : null}

          {activeTab === "suppliers" ? (
            <InventorySuppliersTab />
          ) : null}

          {activeTab === "writeoff" ? (
            <InventoryWriteoffPanel
              products={products}
              responsibleOptions={responsibleOptions}
              acts={writeoffActs}
              canManageInventory={canManageInventory}
            />
          ) : null}

          {activeTab === "audit" ? (
            <InventoryAuditTab
              products={products}
              responsibleOptions={responsibleOptions}
              sessions={inventorySessions}
              employees={employees}
              canManageInventory={canManageInventory}
              lowStockCount={lowStockCount}
              zeroStockCount={zeroStockCount}
            />
          ) : null}

          {activeTab === "recipes" ? (
            <InventoryRecipesTab
              products={products}
              techCards={techCards}
              techCardProducts={techCardProducts}
              filteredTechCards={filteredTechCards}
              recipeCategorySummaries={recipeCategorySummaries}
              selectedRecipeCategory={selectedRecipeCategory}
              clearRecipeDraft={clearRecipeDraft}
              canManageInventory={canManageInventory}
            />
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
