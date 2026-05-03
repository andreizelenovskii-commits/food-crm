import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { formatMoney } from "@/modules/orders/components/order-create-utils";

export function OrderCreateCatalogSection({
  isInternal,
  catalogQuery,
  selectedCategory,
  availableCategories,
  filteredCatalogItems,
  selectedItems,
  onSwitchOrderType,
  onCatalogQueryChange,
  onCategoryChange,
  onQuantityChange,
}: {
  isInternal: boolean;
  catalogQuery: string;
  selectedCategory: string;
  availableCategories: string[];
  filteredCatalogItems: CatalogItem[];
  selectedItems: Record<number, number>;
  onSwitchOrderType: (value: boolean) => void;
  onCatalogQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onQuantityChange: (catalogItemId: number, quantity: number) => void;
}) {
  return (
    <div className="space-y-5">
      <OrderTypeSwitch isInternal={isInternal} onSwitchOrderType={onSwitchOrderType} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">Позиции заказа</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Сейчас видны только позиции из {isInternal ? "внутреннего" : "клиентского"} прайса.
            </p>
          </div>
        </div>

        <input
          type="search"
          value={catalogQuery}
          onChange={(event) => onCatalogQueryChange(event.target.value)}
          placeholder="Поиск по названию, категории или размеру"
          className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />

        <CategoryChips
          selectedCategory={selectedCategory}
          availableCategories={availableCategories}
          onCategoryChange={onCategoryChange}
        />

        <div className="max-h-104 space-y-3 overflow-y-auto pr-1">
          {filteredCatalogItems.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
              Ничего не найдено по выбранной категории или поисковому запросу.
            </div>
          ) : (
            filteredCatalogItems.map((item) => (
              <CatalogOrderItemRow
                key={item.id}
                item={item}
                quantity={selectedItems[item.id] ?? 0}
                onQuantityChange={onQuantityChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OrderTypeSwitch({
  isInternal,
  onSwitchOrderType,
}: {
  isInternal: boolean;
  onSwitchOrderType: (value: boolean) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-700">Тип заказа</span>
        <span className="text-xs text-zinc-500">От него зависит доступный прайс</span>
      </div>
      <div className="rounded-[22px] border border-red-100 bg-red-50/60 p-1.5 shadow-sm shadow-red-950/5">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {[
            { value: false, title: "Клиентский заказ", note: "Показывает только позиции клиентского прайса." },
            { value: true, title: "Внутренний заказ", note: "Показывает только позиции внутреннего прайса." },
          ].map((option) => {
            const isSelected = isInternal === option.value;

            return (
              <button
                key={option.title}
                type="button"
                onClick={() => onSwitchOrderType(option.value)}
                className={`rounded-[18px] px-4 py-3 text-left transition ${
                  isSelected
                    ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "bg-transparent text-zinc-600 hover:bg-white/80 hover:text-red-800"
                }`}
              >
                <span className="block text-sm font-semibold">{option.title}</span>
                <span className={`mt-1 block text-xs ${isSelected ? "text-red-50/80" : "text-zinc-500"}`}>{option.note}</span>
              </button>
            );
          })}
        </div>
      </div>
      <input type="hidden" name="isInternal" value={String(isInternal)} />
    </div>
  );
}

function CategoryChips({
  selectedCategory,
  availableCategories,
  onCategoryChange,
}: {
  selectedCategory: string;
  availableCategories: string[];
  onCategoryChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onCategoryChange("")}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          !selectedCategory
            ? "bg-red-800 text-white"
            : "border border-red-100 bg-white text-red-800 hover:border-red-200 hover:bg-red-50"
        }`}
      >
        Все категории
      </button>
      {availableCategories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            selectedCategory === category
              ? "bg-red-800 text-white"
              : "border border-red-100 bg-white text-red-800 hover:border-red-200 hover:bg-red-50"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

function CatalogOrderItemRow({
  item,
  quantity,
  onQuantityChange,
}: {
  item: CatalogItem;
  quantity: number;
  onQuantityChange: (catalogItemId: number, quantity: number) => void;
}) {
  return (
    <div className="rounded-[18px] border border-red-100 bg-white/85 p-4 shadow-sm shadow-red-950/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-950">{item.name}</h4>
            {item.category ? <CatalogBadge>{item.category}</CatalogBadge> : null}
            {item.pizzaSize ? <CatalogBadge>{item.pizzaSize}</CatalogBadge> : null}
          </div>
          {item.description ? <p className="text-xs leading-5 text-zinc-500">{item.description}</p> : null}
          <p className="text-sm font-medium text-zinc-900">{formatMoney(item.priceCents)}</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <QuantityButton onClick={() => onQuantityChange(item.id, quantity - 1)} label="-" />
          <div className="flex h-9 min-w-12 items-center justify-center rounded-2xl border border-red-100 bg-white px-3 text-sm font-semibold text-zinc-950">
            {quantity}
          </div>
          <QuantityButton onClick={() => onQuantityChange(item.id, quantity + 1)} label="+" />
        </div>
      </div>
    </div>
  );
}

function CatalogBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-800 ring-1 ring-red-100">
      {children}
    </span>
  );
}

function QuantityButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-2xl border border-red-100 bg-white text-lg text-red-800 transition hover:border-red-200 hover:bg-red-50"
    >
      {label}
    </button>
  );
}
