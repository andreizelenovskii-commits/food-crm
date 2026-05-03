import {
  CATALOG_PRICE_LIST_LABELS,
  CATALOG_PRICE_LIST_TYPES,
  type CatalogPriceListType,
} from "@/modules/catalog/catalog.types";

export function CatalogPriceListPicker({
  selectedPriceListType,
  onChange,
}: {
  selectedPriceListType: CatalogPriceListType | "";
  onChange: (value: CatalogPriceListType) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-700">Куда добавить позицию</span>
        <span className="text-xs text-zinc-500">Обязательный выбор</span>
      </div>

      <div className="rounded-[22px] border border-zinc-200 bg-zinc-50/90 p-1.5">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {CATALOG_PRICE_LIST_TYPES.map((priceListType) => {
            const isSelected = selectedPriceListType === priceListType;

            return (
              <button
                key={priceListType}
                type="button"
                onClick={() => onChange(priceListType)}
                className={`rounded-[18px] px-4 py-3 text-left transition ${
                  isSelected
                    ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-950/10"
                    : "bg-transparent text-zinc-600 hover:bg-white/70 hover:text-zinc-950"
                }`}
                aria-pressed={isSelected}
              >
                <span className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition ${
                    isSelected ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-300 bg-white text-zinc-400"
                  }`}>
                    {priceListType === "CLIENT" ? "C" : "I"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {CATALOG_PRICE_LIST_LABELS[priceListType]}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {priceListType === "CLIENT"
                        ? "Для клиентского прайса и внешней витрины."
                        : "Для внутренней работы и служебного прайса."}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <input name="priceListType" type="hidden" value={selectedPriceListType} />
    </div>
  );
}
