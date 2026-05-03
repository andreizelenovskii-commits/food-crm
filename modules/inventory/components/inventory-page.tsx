import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { InventoryAuditTab } from "@/modules/inventory/components/inventory-audit-tab";
import { InventoryIncomingPanel } from "@/modules/inventory/components/inventory-incoming-panel";
import { InventoryRecipesTab } from "@/modules/inventory/components/inventory-recipes-tab";
import { InventoryWriteoffPanel } from "@/modules/inventory/components/inventory-writeoff-panel";
import { InventoryProductsTab } from "@/modules/inventory/components/inventory-products-tab";
import {
  buildInventoryPageViewModel,
  INVENTORY_TABS,
  type InventoryPageProps,
} from "@/modules/inventory/inventory.page-model";

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
    selectedCategory,
    selectedRecipeCategory,
    totalStock,
    totalValueCents,
    filteredProducts,
    categorySummaries,
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
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-white/80 blur-3xl" />

        <section className="relative mb-4 rounded-[22px] border border-white/70 bg-white/74 p-2 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl">
          <div className="flex gap-2 overflow-x-auto">
            {INVENTORY_TABS.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <Link
                  key={tab.key}
                  href={tab.key === "products" ? "/dashboard/inventory" : `/dashboard/inventory?tab=${tab.key}`}
                  className={`inline-flex h-9 shrink-0 items-center rounded-full px-4 text-xs font-semibold transition ${
                    isActive
                      ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
                      : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="relative">
          {activeTab === "products" ? (
            <InventoryProductsTab
              products={products}
              filteredProducts={filteredProducts}
              lowStockProducts={lowStockProducts}
              categorySummaries={categorySummaries}
              rawQuery={rawQuery}
              selectedCategory={selectedCategory}
              totalStock={totalStock}
              totalValueCents={totalValueCents}
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
