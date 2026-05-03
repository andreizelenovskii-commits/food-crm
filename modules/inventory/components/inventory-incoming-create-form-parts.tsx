import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  InventoryResponsibleOption,
  ProductItem,
} from "@/modules/inventory/inventory.types";
import {
  formatMoney,
  formatPriceInput,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";

export type IncomingDraftProduct = {
  product: ProductItem;
  quantity: string;
  price: string;
};

export function IncomingFormMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </div>
  );
}

export function IncomingResponsiblePicker({
  options,
  selectedResponsibleId,
  onChange,
}: {
  options: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f1_100%)] p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Ответственный</p>
        <h3 className="mt-2 text-base font-semibold text-zinc-950">Кто оформляет поступление</h3>
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

export function IncomingDraftProducts({
  selectedProducts,
  onOpenSearch,
  onQuantityChange,
  onPriceChange,
  onRemoveProduct,
}: {
  selectedProducts: IncomingDraftProduct[];
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onPriceChange: (productId: number, value: string) => void;
  onRemoveProduct?: (productId: number) => void;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Состав поставки</p>
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
            <IncomingDraftProductCard
              key={item.product.id}
              item={item}
              onQuantityChange={onQuantityChange}
              onPriceChange={onPriceChange}
              onRemoveProduct={onRemoveProduct}
            />
          ))
        )}
      </div>
    </section>
  );
}

function IncomingDraftProductCard({
  item,
  onQuantityChange,
  onPriceChange,
  onRemoveProduct,
}: {
  item: IncomingDraftProduct;
  onQuantityChange: (productId: number, value: string) => void;
  onPriceChange: (productId: number, value: string) => void;
  onRemoveProduct?: (productId: number) => void;
}) {
  const { product, quantity, price } = item;
  const parsedQuantity = parseQuantity(quantity);
  const parsedPriceCents = Math.round(parseQuantity(price) * 100);
  const projectedStock = product.stockQuantity + parsedQuantity;

  return (
    <article className="grid gap-4 rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-zinc-950">{product.name}</h4>
            <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800 ring-1 ring-red-200">
              Приход в {product.unit}
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            {product.category ?? "Без категории"} • Сейчас: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
          </p>
          <p className="text-sm font-medium text-zinc-700">
            После завершения: {formatInventoryQuantity(projectedStock)} {product.unit}
          </p>
          <p className="text-sm font-medium text-zinc-700">
            Сумма поставки: {formatMoney(parsedQuantity * parsedPriceCents)}
          </p>
        </div>
        {onRemoveProduct ? (
          <button type="button" onClick={() => onRemoveProduct(product.id)} className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50">
            Убрать
          </button>
        ) : null}
      </div>
      <IncomingDraftInput label={`Количество к поступлению, ${product.unit}`} value={quantity} suffix={product.unit} placeholder="0" onChange={(value) => onQuantityChange(product.id, value)} />
      <IncomingDraftInput label={`Закупочная цена за ${product.unit}`} value={price} suffix="RUB" placeholder={formatPriceInput(product.priceCents)} onChange={(value) => onPriceChange(product.id, value)} />
    </article>
  );
}

function IncomingDraftInput({
  label,
  value,
  suffix,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  suffix: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <div className="relative">
        <input type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-[20px] border border-zinc-300 bg-white px-4 py-3 pr-16 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5" />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-zinc-500">
          {suffix}
        </span>
      </div>
    </label>
  );
}

export function IncomingCreateFooter({
  draftEntriesCount,
  draftTotalCents,
  selectedResponsibleId,
  canManageInventory,
  isCreatePending,
}: {
  draftEntriesCount: number;
  draftTotalCents: number;
  selectedResponsibleId: string;
  canManageInventory: boolean;
  isCreatePending: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-zinc-200 bg-zinc-50 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {canManageInventory
            ? "После завершения акта средняя закупочная цена товара на складе пересчитается автоматически."
            : "У твоей роли нет прав на создание актов поступления."}
        </p>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Итого по акту</p>
          <p className="mt-2 text-xl font-semibold text-zinc-950">{formatMoney(draftTotalCents)}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        {canManageInventory ? (
          <button type="submit" disabled={draftEntriesCount === 0 || !selectedResponsibleId || isCreatePending} className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400">
            {isCreatePending ? "Создаём..." : "Создать акт"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
