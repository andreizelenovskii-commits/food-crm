import {
  AuditDialogFrame,
  AuditDialogHeader,
  AuditMessage,
  type InventoryFormAction,
} from "@/modules/inventory/components/inventory-audit-common";
import { InventoryAuditProductPicker } from "@/modules/inventory/components/inventory-audit-product-picker";
import { InventoryAuditResponsiblePicker } from "@/modules/inventory/components/inventory-audit-responsible-picker";
import { InventoryAuditSelectedProductsDialog } from "@/modules/inventory/components/inventory-audit-selected-products-dialog";
import type {
  InventoryResponsibleOption,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryAuditCreateDialog({
  products,
  filteredProducts,
  categorySummaries,
  selectedProducts,
  selectedProductIds,
  responsibleOptions,
  selectedResponsibleId,
  query,
  auditType,
  canManageInventory,
  isCreatePending,
  errorMessage,
  successMessage,
  createFormAction,
  onClose,
  onQueryChange,
  onResponsibleChange,
  onAuditTypeChange,
  onToggleProduct,
  onSelectProducts,
  onClearProducts,
}: {
  products: ProductItem[];
  filteredProducts: ProductItem[];
  categorySummaries: Array<{ category: ProductCategory; count: number }>;
  selectedProducts: ProductItem[];
  selectedProductIds: number[];
  responsibleOptions: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  query: string;
  auditType: string;
  canManageInventory: boolean;
  isCreatePending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  createFormAction: InventoryFormAction;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onResponsibleChange: (value: string) => void;
  onAuditTypeChange: (value: string) => void;
  onToggleProduct: (productId: number) => void;
  onSelectProducts: (productIds: number[]) => void;
  onClearProducts: () => void;
}) {
  const selectedResponsible = responsibleOptions.find((item) => String(item.id) === selectedResponsibleId);

  return (
    <AuditDialogFrame title="Создать инвентаризацию" onClose={onClose}>
      <AuditDialogHeader
        eyebrow="Новая инвентаризация"
        title="Сбор итогового листа"
        description="Собери список товаров, назначь сотрудника и зафиксируй остатки системы на момент создания инвентаризации."
        onClose={onClose}
      />
      {errorMessage ? <div className="mb-4"><AuditMessage>{errorMessage}</AuditMessage></div> : null}
      {successMessage ? <div className="mb-4"><AuditMessage>{successMessage}</AuditMessage></div> : null}

      <form action={canManageInventory ? createFormAction : undefined} className="grid gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(340px,0.62fr)]">
        <section className="space-y-3 rounded-[22px] border border-white/70 bg-white/72 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
            <div className="md:row-span-3">
              <InventoryAuditProductPicker
                query={query}
                products={filteredProducts}
                allProducts={products}
                categorySummaries={categorySummaries}
                selectedProductIds={selectedProductIds}
                onQueryChange={onQueryChange}
                onToggleProduct={onToggleProduct}
                onSelectProducts={onSelectProducts}
              />
            </div>
            <InventoryAuditResponsiblePicker
              options={responsibleOptions}
              selectedResponsibleId={selectedResponsibleId}
              onChange={onResponsibleChange}
            />
          </div>
          <AuditTypePicker selectedType={auditType} onChange={onAuditTypeChange} />
        </section>

        <CreateSummary
          selectedProducts={selectedProducts}
          selectedResponsibleLabel={
            selectedResponsible ? `${selectedResponsible.name} • ${selectedResponsible.role}` : "Не выбран"
          }
          selectedResponsibleId={selectedResponsibleId}
          auditType={auditType}
          canManageInventory={canManageInventory}
          isCreatePending={isCreatePending}
          onRemoveProduct={onToggleProduct}
          onClearProducts={onClearProducts}
        />
      </form>
    </AuditDialogFrame>
  );
}

function AuditTypePicker({
  selectedType,
  onChange,
}: {
  selectedType: string;
  onChange: (value: string) => void;
}) {
  const options = ["Плановая инвентаризация", "Внеплановая инвентаризация"];

  return (
    <div className="space-y-1.5 rounded-[20px] border border-red-950/10 bg-white/62 p-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Тип инвентаризации</span>
      <input type="hidden" name="notes" value={selectedType} />
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedType === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={["h-9 rounded-full border px-4 text-[13px] font-medium tracking-[-0.01em] transition", isSelected ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15" : "border-red-100 bg-white/90 text-red-800 hover:border-red-200 hover:bg-red-50"].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CreateSummary({
  selectedProducts,
  selectedResponsibleLabel,
  selectedResponsibleId,
  auditType,
  canManageInventory,
  isCreatePending,
  onRemoveProduct,
  onClearProducts,
}: {
  selectedProducts: ProductItem[];
  selectedResponsibleLabel: string;
  selectedResponsibleId: string;
  auditType: string;
  canManageInventory: boolean;
  isCreatePending: boolean;
  onRemoveProduct: (productId: number) => void;
  onClearProducts: () => void;
}) {
  return (
    <section className="space-y-3 rounded-[22px] border border-white/70 bg-white/76 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Итоговый лист</p>
        <h4 className="mt-1 text-base font-semibold tracking-[-0.02em] text-zinc-950">Что войдёт в инвентаризацию</h4>
        <p className="mt-1 text-xs leading-5 text-zinc-600">Лист зафиксирует выбранные товары и программные остатки на момент старта.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <SummaryStat label="Товаров" value={selectedProducts.length} />
        <SummaryStat label="Ответственный" value={selectedResponsibleLabel} compact />
        <SummaryStat label="Тип" value={auditType || "Не выбран"} compact />
      </div>
      <InventoryAuditSelectedProductsDialog
        products={selectedProducts}
        onRemoveProduct={onRemoveProduct}
        onClearProducts={onClearProducts}
      />
      {!canManageInventory ? <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-4 py-3 text-xs text-zinc-500">У твоей роли нет прав на создание инвентаризации.</div> : null}
      <button type="submit" disabled={!canManageInventory || isCreatePending || selectedProducts.length === 0 || !selectedResponsibleId || !auditType} className="h-10 w-full rounded-full bg-red-800 px-5 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
        {isCreatePending ? "Создаём лист..." : "Создать инвентаризацию"}
      </button>
    </section>
  );
}

function SummaryStat({ label, value, compact = false }: { label: string; value: React.ReactNode; compact?: boolean }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/80 px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className={`mt-1 font-semibold leading-4 text-zinc-950 ${compact ? "text-xs" : "text-lg tracking-[-0.03em]"}`}>{value}</p>
    </div>
  );
}
