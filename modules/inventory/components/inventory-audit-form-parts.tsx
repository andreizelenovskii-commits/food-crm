import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryAuditHeader({
  touchedCount,
  differenceCount,
}: {
  touchedCount: number;
  differenceCount: number;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-zinc-950">
          Рабочая сверка остатков
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-zinc-600">
          Внеси фактические остатки по товарам, сохрани сверку и система обновит текущие значения на складе.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <AuditStat label="Заполнено" value={touchedCount} />
        <AuditStat label="Расхождения" value={differenceCount} />
      </div>
    </div>
  );
}

function AuditStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{value}</p>
    </div>
  );
}

export function InventoryAuditFilters({
  query,
  selectedCategory,
  categorySummaries,
  onQueryChange,
  onCategoryChange,
}: {
  query: string;
  selectedCategory: ProductCategory | "";
  categorySummaries: Array<{ category: ProductCategory; count: number }>;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: ProductCategory | "") => void;
}) {
  return (
    <>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Поиск по товару</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Например: сыр, соус или PRD-00012"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              onCategoryChange("");
            }}
            className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Сбросить фильтр
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onCategoryChange("")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !selectedCategory
              ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
              : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
          }`}
        >
          Все категории
        </button>
        {categorySummaries.map((item) => (
          <CategoryButton
            key={item.category}
            item={item}
            isActive={selectedCategory === item.category}
            onClick={() => onCategoryChange(item.category)}
          />
        ))}
      </div>
    </>
  );
}

function CategoryButton({
  item,
  isActive,
  onClick,
}: {
  item: { category: ProductCategory; count: number };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
          : "border border-red-100 bg-red-50/70 text-red-800 hover:border-red-200 hover:bg-red-100"
      }`}
    >
      {item.category} {item.count}
    </button>
  );
}

export function InventoryAuditProductRows({
  products,
  draft,
  canManageInventory,
  isPending,
  onDraftChange,
}: {
  products: ProductItem[];
  draft: Record<string, string>;
  canManageInventory: boolean;
  isPending: boolean;
  onDraftChange: (productId: number, value: string) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 px-5 py-4 sm:py-5 text-sm text-zinc-500">
        По этому фильтру товары не найдены.
      </div>
    );
  }

  return products.map((product) => {
    const value = draft[String(product.id)] ?? "";
    const hasValue = value.length > 0;
    const difference =
      hasValue && Number(value) !== product.stockQuantity ? Number(value) - product.stockQuantity : 0;
    const differenceTone =
      difference > 0 ? "text-red-800" : difference < 0 ? "text-red-700" : "text-zinc-500";

    return (
      <article
        key={product.id}
        className="grid gap-4 rounded-[14px] border border-zinc-200 bg-zinc-50/80 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-center"
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-[1.1rem] font-semibold text-zinc-950">{product.name}</h3>
            <p className="text-sm text-zinc-500">Категория: {product.category ?? "Без категории"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
              Система: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
            </span>
            {product.sku ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-zinc-200">
                {product.sku}
              </span>
            ) : null}
            {hasValue ? (
              <span className={`rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-zinc-200 ${differenceTone}`}>
                {difference === 0
                  ? "Без расхождения"
                  : difference > 0
                    ? `Излишек: +${formatInventoryQuantity(difference)} ${product.unit}`
                    : `Недостача: ${formatInventoryQuantity(difference)} ${product.unit}`}
              </span>
            ) : null}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Фактический остаток</span>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(event) => onDraftChange(product.id, event.target.value)}
              placeholder={formatInventoryQuantity(product.stockQuantity)}
              disabled={!canManageInventory || isPending}
              className="w-full rounded-[12px] border border-zinc-300 bg-white px-4 py-3 pr-16 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-zinc-500">
              {product.unit}
            </span>
          </div>
        </label>
      </article>
    );
  });
}

export function InventoryAuditFooter({
  canManageInventory,
  isPending,
  touchedCount,
  onClearDraft,
}: {
  canManageInventory: boolean;
  isPending: boolean;
  touchedCount: number;
  onClearDraft: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-zinc-600">
        {canManageInventory
          ? "Сохраняются только позиции, в которых ты ввёл фактический остаток."
          : "У твоей роли нет прав на проведение инвентаризации."}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onClearDraft}
          disabled={touchedCount === 0 || isPending}
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Очистить черновик
        </button>
        {canManageInventory ? (
          <button
            type="submit"
            disabled={touchedCount === 0 || isPending}
            className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isPending ? "Сохраняем..." : "Провести инвентаризацию"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
