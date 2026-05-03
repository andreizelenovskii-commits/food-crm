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
      {errorMessage ? <div className="mb-5"><AuditMessage>{errorMessage}</AuditMessage></div> : null}
      {successMessage ? <div className="mb-5"><AuditMessage>{successMessage}</AuditMessage></div> : null}

      <form action={canManageInventory ? createFormAction : undefined} className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
        <section className="space-y-5 rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700">Поиск по товарам</span>
              <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Например: сыр, кетчуп или PRD-00017" className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700">Ответственный</span>
              <select name="responsibleEmployeeId" value={selectedResponsibleId} onChange={(event) => onResponsibleChange(event.target.value)} className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5" required>
                <option value="">Выбери сотрудника</option>
                {responsibleOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} • {employee.role}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700">Комментарий к инвентаризации</span>
            <textarea name="notes" rows={3} value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Например: вечерняя ревизия по молочной группе и соусам" className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5" />
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
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => onCategoryChange("")} className={`rounded-full px-4 py-2 text-sm font-medium transition ${!selectedCategory ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10" : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"}`}>
        Все категории
      </button>
      {categorySummaries.map((item) => (
        <button key={item.category} type="button" onClick={() => onCategoryChange(item.category)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === item.category ? "bg-red-800 text-white shadow-sm shadow-red-950/20" : "border border-red-100 bg-red-50/70 text-red-800 hover:border-red-200 hover:bg-red-100"}`}>
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
      <div className="rounded-[12px] border border-dashed border-zinc-300 bg-zinc-50 px-5 py-4 text-sm text-zinc-500 sm:py-5">
        По этому фильтру товары не найдены.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const isSelected = selectedProductIds.includes(product.id);

        return (
          <button key={product.id} type="button" onClick={() => onToggleProduct(product.id)} className={`grid w-full gap-4 rounded-[12px] border px-5 py-4 text-left transition lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center ${isSelected ? "border-red-200 bg-red-50/80" : "border-zinc-200 bg-zinc-50/80 hover:border-zinc-300 hover:bg-white"}`}>
            <span className={`mt-1 h-5 w-5 rounded-full border ${isSelected ? "border-red-800 bg-red-800" : "border-zinc-300 bg-white"}`} />
            <div className="space-y-1">
              <div className="text-[1rem] font-semibold text-zinc-950">{product.name}</div>
              <div className="text-sm text-zinc-500">
                {product.category ?? "Без категории"}
                {product.sku ? ` • ${product.sku}` : ""}
              </div>
            </div>
            <div className="text-sm font-medium text-zinc-600">
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
    <section className="space-y-5 rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Итоговый лист</p>
        <h4 className="text-[1.25rem] font-semibold tracking-[-0.02em] text-zinc-950">Что войдёт в инвентаризацию</h4>
        <p className="text-sm leading-6 text-zinc-600">После создания лист зафиксирует выбранные товары и программные остатки на момент старта.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryStat label="Товаров" value={selectedProducts.length} />
        <SummaryStat label="Ответственный" value={selectedResponsibleLabel} compact />
      </div>
      <div className="space-y-3 rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
        {selectedProducts.length === 0 ? (
          <p className="text-sm leading-6 text-zinc-500">Пока лист пустой. Выбери товары слева, и они появятся в итоговой ведомости.</p>
        ) : (
          selectedProducts.map((product) => (
            <div key={product.id} className="rounded-[20px] border border-zinc-200 bg-white px-4 py-3">
              <input type="hidden" name="productId" value={product.id} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{product.category ?? "Без категории"}{product.sku ? ` • ${product.sku}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Программный остаток</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{formatInventoryQuantity(product.stockQuantity)} {product.unit}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {!canManageInventory ? <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">У твоей роли нет прав на создание инвентаризации.</div> : null}
      <button type="submit" disabled={!canManageInventory || isCreatePending || selectedProducts.length === 0 || !selectedResponsibleId} className="w-full rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400">
        {isCreatePending ? "Создаём лист..." : "Создать инвентаризацию"}
      </button>
    </section>
  );
}

function SummaryStat({ label, value, compact = false }: { label: string; value: React.ReactNode; compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className={`mt-2 font-medium text-zinc-950 ${compact ? "text-sm" : "text-2xl tracking-[-0.03em]"}`}>{value}</p>
    </div>
  );
}
