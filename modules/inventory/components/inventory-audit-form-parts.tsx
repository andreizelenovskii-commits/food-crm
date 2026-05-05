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
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">
          Рабочая сверка остатков
        </h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
          Внеси фактические остатки по товарам, сохрани сверку и система обновит текущие значения на складе.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <AuditStat label="Заполнено" value={touchedCount} />
        <AuditStat label="Расхождения" value={differenceCount} />
      </div>
    </div>
  );
}

function AuditStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/80 px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-zinc-950">{value}</p>
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
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-700">Поиск по товару</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Например: сыр, соус или PRD-00012"
            className="h-10 w-full rounded-[16px] border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              onCategoryChange("");
            }}
            className="h-10 rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Сбросить фильтр
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            !selectedCategory
              ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
              : "border border-red-100 bg-white/85 text-red-800 hover:border-red-200 hover:bg-red-50"
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
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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
      <div className="rounded-[18px] border border-dashed border-red-200 bg-white/70 px-4 py-3 text-xs text-zinc-500 sm:py-4">
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
        className="grid gap-3 rounded-[18px] border border-red-950/10 bg-white/74 p-3 shadow-sm shadow-red-950/5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-center"
      >
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">{product.name}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Категория: {product.category ?? "Без категории"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-red-950/10">
              Система: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
            </span>
            {product.sku ? (
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-red-950/10">
                {product.sku}
              </span>
            ) : null}
            {hasValue ? (
              <span className={`rounded-full bg-white px-3 py-1 text-[11px] font-medium ring-1 ring-red-950/10 ${differenceTone}`}>
                {difference === 0
                  ? "Без расхождения"
                  : difference > 0
                    ? `Излишек: +${formatInventoryQuantity(difference)} ${product.unit}`
                    : `Недостача: ${formatInventoryQuantity(difference)} ${product.unit}`}
              </span>
            ) : null}
          </div>
        </div>

        <label className="space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-700">Фактический остаток</span>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(event) => onDraftChange(product.id, event.target.value)}
              placeholder={formatInventoryQuantity(product.stockQuantity)}
              disabled={!canManageInventory || isPending}
              className="h-10 w-full rounded-[16px] border border-red-950/10 bg-white px-4 pr-14 text-xs font-medium text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10 disabled:cursor-not-allowed disabled:bg-red-50 disabled:text-zinc-500"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-zinc-500">
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
    <div className="flex flex-col gap-3 rounded-[18px] border border-red-950/10 bg-white/76 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-zinc-600">
        {canManageInventory
          ? "Сохраняются только позиции, в которых ты ввёл фактический остаток."
          : "У твоей роли нет прав на проведение инвентаризации."}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onClearDraft}
          disabled={touchedCount === 0 || isPending}
          className="h-9 rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Очистить черновик
        </button>
        {canManageInventory ? (
          <button
            type="submit"
            disabled={touchedCount === 0 || isPending}
            className="h-9 rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300"
          >
            {isPending ? "Сохраняем..." : "Провести инвентаризацию"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
