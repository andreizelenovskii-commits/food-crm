import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import {
  WRITEOFF_REASONS,
  type InventoryResponsibleOption,
  type ProductItem,
  type WriteoffReason,
} from "@/modules/inventory/inventory.types";
import {
  formatMoney,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";

export type WriteoffDraftProduct = {
  product: ProductItem;
  quantity: string;
};

export function WriteoffFormMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </div>
  );
}

export function WriteoffResponsiblePicker({
  options,
  selectedResponsibleId,
  onChange,
}: {
  options: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff4f2_100%)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Ответственный</p>
          <h3 className="mt-2 text-base font-semibold text-zinc-950">Кто оформляет списание</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-zinc-200">
          Обязательно
        </span>
      </div>
      <input type="hidden" name="responsibleEmployeeId" value={selectedResponsibleId} />
      <div className="mt-4 grid gap-2">
        {options.map((option) => {
          const isActive = selectedResponsibleId === String(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(String(option.id))}
              className={`rounded-[22px] border px-4 py-3 text-left transition ${isActive ? "border-zinc-950 bg-zinc-950 text-white shadow-sm shadow-zinc-950/10" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"}`}
            >
              <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>{option.name}</p>
              <p className={`mt-1 text-sm ${isActive ? "text-white/70" : "text-zinc-500"}`}>{option.role}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function WriteoffReasonPicker({
  reason,
  onChange,
}: {
  reason: WriteoffReason;
  onChange: (value: WriteoffReason) => void;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#fff7f4_0%,#fff0ef_100%)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Причина списания</p>
      <h3 className="mt-2 text-base font-semibold text-zinc-950">Почему уходит товар</h3>
      <input type="hidden" name="reason" value={reason} />
      <div className="mt-4 flex flex-wrap gap-2">
        {WRITEOFF_REASONS.map((item) => {
          const isActive = reason === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-rose-600 text-white shadow-sm shadow-rose-700/20" : "border border-rose-100 bg-white text-rose-800 hover:border-rose-200 hover:bg-rose-50"}`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function WriteoffDraftProducts({
  selectedProducts,
  onOpenSearch,
  onQuantityChange,
  onRemoveProduct,
}: {
  selectedProducts: WriteoffDraftProduct[];
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onRemoveProduct: (productId: number) => void;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Состав акта</p>
          <h3 className="mt-2 text-base font-semibold text-zinc-950">Выбранные товары</h3>
        </div>
        <button type="button" onClick={onOpenSearch} className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
          Добавить товар
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {selectedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
            Пока в акт ничего не добавлено.
          </div>
        ) : (
          selectedProducts.map((item) => (
            <WriteoffDraftProductCard
              key={item.product.id}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemoveProduct={onRemoveProduct}
            />
          ))
        )}
      </div>
    </section>
  );
}

function WriteoffDraftProductCard({
  item,
  onQuantityChange,
  onRemoveProduct,
}: {
  item: WriteoffDraftProduct;
  onQuantityChange: (productId: number, value: string) => void;
  onRemoveProduct: (productId: number) => void;
}) {
  const { product, quantity } = item;
  const parsedQuantity = parseQuantity(quantity);
  const projectedStock = quantity ? product.stockQuantity - parsedQuantity : product.stockQuantity;
  const projectedTone = projectedStock < 0 ? "text-red-700" : projectedStock === 0 ? "text-amber-600" : "text-zinc-600";

  return (
    <article className="grid gap-4 rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-zinc-950">{product.name}</h4>
            {product.sku ? <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-zinc-200">{product.sku}</span> : null}
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800 ring-1 ring-amber-200">
              Списание в {product.unit}
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            {product.category ?? "Без категории"} • Сейчас: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
          </p>
          <p className={`text-sm font-medium ${projectedTone}`}>
            После списания: {formatInventoryQuantity(projectedStock)} {product.unit}
          </p>
          <p className="text-sm font-medium text-zinc-700">
            Сумма списания: {formatMoney(parsedQuantity * product.priceCents)}
          </p>
        </div>
        <button type="button" onClick={() => onRemoveProduct(product.id)} className="shrink-0 rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
          Убрать
        </button>
      </div>

      <label className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-700">Количество к списанию, {product.unit}</span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Ед. изм. из склада: {product.unit}
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={quantity}
            onChange={(event) => onQuantityChange(product.id, event.target.value)}
            placeholder="0"
            className="w-full rounded-[20px] border border-zinc-300 bg-white px-4 py-3 pr-16 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-zinc-500">
            {product.unit}
          </span>
        </div>
      </label>
    </article>
  );
}

export function WriteoffCreateFooter({
  draftEntriesCount,
  draftTotalCents,
  selectedResponsibleId,
  canManageInventory,
  isCreatePending,
  onClearDraft,
}: {
  draftEntriesCount: number;
  draftTotalCents: number;
  selectedResponsibleId: string;
  canManageInventory: boolean;
  isCreatePending: boolean;
  onClearDraft: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-zinc-200 bg-zinc-50 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {canManageInventory ? "Акт можно провести даже если после списания остаток уйдёт в минус." : "У твоей роли нет прав на создание актов списания."}
        </p>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Итого по акту</p>
          <p className="mt-2 text-xl font-semibold text-zinc-950">{formatMoney(draftTotalCents)}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClearDraft} disabled={draftEntriesCount === 0 || isCreatePending} className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50">
          Очистить
        </button>
        {canManageInventory ? (
          <button type="submit" disabled={draftEntriesCount === 0 || !selectedResponsibleId || isCreatePending} className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400">
            {isCreatePending ? "Создаём..." : "Создать акт"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
