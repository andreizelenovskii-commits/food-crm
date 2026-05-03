import { CATALOG_FIELD_CLASS_NAME } from "@/modules/catalog/components/catalog-item-form.model";
import {
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
  type TechCardPizzaSize,
} from "@/modules/tech-cards/tech-cards.types";

type TechCardOption = {
  id: number;
  name: string;
  category: string;
  pizzaSize: string | null;
};

export function CatalogTechCardFields({
  priceDefaultValue,
  selectedCategory,
  selectedPizzaSize,
  selectedTechCardId,
  techCardOptions,
  filteredTechCardOptions,
  onCategoryChange,
  onPizzaSizeChange,
  onTechCardIdChange,
}: {
  priceDefaultValue: string;
  selectedCategory: string;
  selectedPizzaSize: TechCardPizzaSize | "";
  selectedTechCardId: string;
  techCardOptions: TechCardOption[];
  filteredTechCardOptions: TechCardOption[];
  onCategoryChange: (value: string) => void;
  onPizzaSizeChange: (value: TechCardPizzaSize | "") => void;
  onTechCardIdChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Категория</span>
          <div className="relative">
            <select
              name="category"
              value={selectedCategory}
              onChange={(event) => {
                const nextCategory = event.target.value;
                onCategoryChange(nextCategory);
                onTechCardIdChange("");

                if (nextCategory !== "Пиццы") {
                  onPizzaSizeChange("");
                }
              }}
              className={`${CATALOG_FIELD_CLASS_NAME} appearance-none pr-12`}
              required
            >
              <option value="">Выбери категорию</option>
              {TECH_CARD_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </label>

        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Цена</span>
          <div className="relative">
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={priceDefaultValue}
              placeholder="0"
              className={`${CATALOG_FIELD_CLASS_NAME} pl-11`}
              required
            />
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-zinc-500">
              ₽
            </span>
          </div>
        </label>
      </div>

      {selectedCategory === "Пиццы" ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-700">Размер пиццы</span>
            <span className="text-xs text-zinc-500">Обязательный выбор</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {TECH_CARD_PIZZA_SIZES.map((size) => {
              const isSelected = selectedPizzaSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    onPizzaSizeChange(size);
                    onTechCardIdChange("");
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:text-zinc-950"
                  }`}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <TechCardSelect
        selectedCategory={selectedCategory}
        selectedTechCardId={selectedTechCardId}
        techCardOptions={techCardOptions}
        filteredTechCardOptions={filteredTechCardOptions}
        onPizzaSizeChange={onPizzaSizeChange}
        onTechCardIdChange={onTechCardIdChange}
      />
    </>
  );
}

function SelectChevron() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function TechCardSelect({
  selectedCategory,
  selectedTechCardId,
  techCardOptions,
  filteredTechCardOptions,
  onPizzaSizeChange,
  onTechCardIdChange,
}: {
  selectedCategory: string;
  selectedTechCardId: string;
  techCardOptions: TechCardOption[];
  filteredTechCardOptions: TechCardOption[];
  onPizzaSizeChange: (value: TechCardPizzaSize | "") => void;
  onTechCardIdChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <label className="block space-y-2.5">
        <span className="text-sm font-medium text-zinc-700">Технологическая карта</span>
        <div className="relative">
          <select
            name="technologicalCardId"
            value={selectedTechCardId}
            onChange={(event) => {
              const nextId = event.target.value;
              const nextTechCard = techCardOptions.find((option) => String(option.id) === nextId);
              onTechCardIdChange(nextId);

              if (selectedCategory === "Пиццы") {
                onPizzaSizeChange(
                  nextTechCard?.pizzaSize &&
                    TECH_CARD_PIZZA_SIZES.includes(nextTechCard.pizzaSize as TechCardPizzaSize)
                    ? (nextTechCard.pizzaSize as TechCardPizzaSize)
                    : "",
                );
              }
            }}
            className={`${CATALOG_FIELD_CLASS_NAME} appearance-none pr-12`}
            required
          >
            <option value="">Выбери техкарту</option>
            {filteredTechCardOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} - {option.category}
                {option.pizzaSize ? ` - ${option.pizzaSize}` : ""}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
        <p className="text-xs leading-5 text-zinc-500">
          Привязка к техкарте обязательна, чтобы прайс не расходился с производственной логикой.
          {selectedCategory === "Пиццы" ? " Для пиццы выбирается техкарта с конкретным размером." : ""}
        </p>
      </label>
    </div>
  );
}
