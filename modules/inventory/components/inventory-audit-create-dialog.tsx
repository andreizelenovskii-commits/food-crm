import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import {
  AuditDialogFrame,
  AuditDialogHeader,
  AuditMessage,
  type InventoryFormAction,
} from "@/modules/inventory/components/inventory-audit-common";
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
  selectedCategory,
  query,
  notes,
  canManageInventory,
  isCreatePending,
  errorMessage,
  successMessage,
  createFormAction,
  onClose,
  onQueryChange,
  onCategoryChange,
  onResponsibleChange,
  onNotesChange,
  onToggleProduct,
}: {
  products: ProductItem[];
  filteredProducts: ProductItem[];
  categorySummaries: Array<{ category: ProductCategory; count: number }>;
  selectedProducts: ProductItem[];
  selectedProductIds: number[];
  responsibleOptions: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  selectedCategory: ProductCategory | "";
  query: string;
  notes: string;
  canManageInventory: boolean;
  isCreatePending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  createFormAction: InventoryFormAction;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: ProductCategory | "") => void;
  onResponsibleChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onToggleProduct: (productId: number) => void;
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
        <section className="space-y-3 rounded-[22px] border border-white/70 bg-white/76 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-700">Поиск по товарам</span>
              <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Например: сыр, кетчуп или PRD-00017" className="h-10 w-full rounded-[16px] border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10" />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-700">Ответственный</span>
              <select name="responsibleEmployeeId" value={selectedResponsibleId} onChange={(event) => onResponsibleChange(event.target.value)} className="h-10 w-full rounded-[16px] border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10" required>
                <option value="">Выбери сотрудника</option>
                {responsibleOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} • {employee.role}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-700">Комментарий к инвентаризации</span>
            <textarea name="notes" rows={2} value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Например: вечерняя ревизия по молочной группе и соусам" className="w-full rounded-[16px] border border-red-950/10 bg-white/85 px-4 py-2.5 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10" />
          </label>
          <CategoryChips
            products={products}
            categorySummaries={categorySummaries}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
          <CreateProductList
            products={filteredProducts}
            selectedProductIds={selectedProductIds}
            onToggleProduct={onToggleProduct}
          />
        </section>

        <CreateSummary
          selectedProducts={selectedProducts}
          selectedResponsibleLabel={
            selectedResponsible ? `${selectedResponsible.name} • ${selectedResponsible.role}` : "Не выбран"
          }
          selectedResponsibleId={selectedResponsibleId}
          canManageInventory={canManageInventory}
          isCreatePending={isCreatePending}
        />
      </form>
    </AuditDialogFrame>
  );
}

function CategoryChips({
  categorySummaries,
  selectedCategory,
  onCategoryChange,
}: {
  products: ProductItem[];
  categorySummaries: Array<{ category: ProductCategory; count: number }>;
  selectedCategory: ProductCategory | "";
  onCategoryChange: (value: ProductCategory | "") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onCategoryChange("")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${!selectedCategory ? "bg-red-800 text-white shadow-sm shadow-red-950/20" : "border border-red-100 bg-white/85 text-red-800 hover:border-red-200 hover:bg-red-50"}`}>
        Все категории
      </button>
      {categorySummaries.map((item) => (
        <button key={item.category} type="button" onClick={() => onCategoryChange(item.category)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${selectedCategory === item.category ? "bg-red-800 text-white shadow-sm shadow-red-950/20" : "border border-red-100 bg-red-50/70 text-red-800 hover:border-red-200 hover:bg-red-100"}`}>
          {item.category} {item.count}
        </button>
      ))}
    </div>
  );
}

function CreateProductList({
  products,
  selectedProductIds,
  onToggleProduct,
}: {
  products: ProductItem[];
  selectedProductIds: number[];
  onToggleProduct: (productId: number) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-red-200 bg-white/70 px-4 py-3 text-xs text-zinc-500 sm:py-4">
        По этому фильтру товары не найдены.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => {
        const isSelected = selectedProductIds.includes(product.id);

        return (
          <button key={product.id} type="button" onClick={() => onToggleProduct(product.id)} className={`grid w-full gap-3 rounded-[16px] border px-3 py-2.5 text-left transition lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center ${isSelected ? "border-red-200 bg-red-50/85" : "border-red-950/10 bg-white/70 hover:border-red-200 hover:bg-white"}`}>
            <span className={`mt-0.5 h-4 w-4 rounded-full border ${isSelected ? "border-red-800 bg-red-800" : "border-red-200 bg-white"}`} />
            <div>
              <div className="text-sm font-semibold text-zinc-950">{product.name}</div>
              <div className="mt-0.5 text-xs text-zinc-500">
                {product.category ?? "Без категории"}
                {product.sku ? ` • ${product.sku}` : ""}
              </div>
            </div>
            <div className="text-xs font-semibold text-zinc-600">
              Остаток: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CreateSummary({
  selectedProducts,
  selectedResponsibleLabel,
  selectedResponsibleId,
  canManageInventory,
  isCreatePending,
}: {
  selectedProducts: ProductItem[];
  selectedResponsibleLabel: string;
  selectedResponsibleId: string;
  canManageInventory: boolean;
  isCreatePending: boolean;
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
      </div>
      <div className="max-h-[46vh] space-y-2 overflow-y-auto rounded-[18px] border border-red-950/10 bg-white/60 p-2">
        {selectedProducts.length === 0 ? (
          <p className="px-2 py-3 text-xs leading-5 text-zinc-500">Пока лист пустой. Выбери товары слева, и они появятся в итоговой ведомости.</p>
        ) : (
          selectedProducts.map((product) => (
            <div key={product.id} className="rounded-[16px] border border-red-950/10 bg-white/84 px-3 py-2.5">
              <input type="hidden" name="productId" value={product.id} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-950">{product.name}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{product.category ?? "Без категории"}{product.sku ? ` • ${product.sku}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">Остаток</p>
                  <p className="mt-0.5 text-xs font-semibold text-zinc-950">{formatInventoryQuantity(product.stockQuantity)} {product.unit}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {!canManageInventory ? <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-4 py-3 text-xs text-zinc-500">У твоей роли нет прав на создание инвентаризации.</div> : null}
      <button type="submit" disabled={!canManageInventory || isCreatePending || selectedProducts.length === 0 || !selectedResponsibleId} className="h-10 w-full rounded-full bg-red-800 px-5 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
        {isCreatePending ? "Создаём лист..." : "Создать инвентаризацию"}
      </button>
    </section>
  );
}

function SummaryStat({ label, value, compact = false }: { label: string; value: React.ReactNode; compact?: boolean }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/80 px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className={`mt-1 font-semibold text-zinc-950 ${compact ? "truncate text-xs" : "text-lg tracking-[-0.03em]"}`}>{value}</p>
    </div>
  );
}
