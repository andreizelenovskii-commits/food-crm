import { CATALOG_FIELD_CLASS_NAME } from "@/modules/catalog/components/catalog-item-form.model";
import { CATALOG_SITE_CATEGORIES } from "@/modules/catalog/catalog.types";

type TechCardOption = {
  id: number;
  name: string;
  category: string;
  pizzaSize: string | null;
};

export function CatalogTechCardFields({
  priceDefaultValue,
  selectedCategory,
  selectedTechCardId,
  filteredTechCardOptions,
  onCategoryChange,
  onTechCardIdChange,
}: {
  priceDefaultValue: string;
  selectedCategory: string;
  selectedTechCardId: string;
  filteredTechCardOptions: TechCardOption[];
  onCategoryChange: (value: string) => void;
  onTechCardIdChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Категория на сайте</span>
          <div className="relative">
            <select
              name="category"
              value={selectedCategory}
              onChange={(event) => {
                const nextCategory = event.target.value;
                onCategoryChange(nextCategory);
                onTechCardIdChange("");
              }}
              className={`${CATALOG_FIELD_CLASS_NAME} appearance-none pr-12`}
              required
            >
              <option value="">Выбери категорию сайта</option>
              {CATALOG_SITE_CATEGORIES.map((category) => (
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

      <TechCardSelect
        selectedTechCardId={selectedTechCardId}
        filteredTechCardOptions={filteredTechCardOptions}
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
  selectedTechCardId,
  filteredTechCardOptions,
  onTechCardIdChange,
}: {
  selectedTechCardId: string;
  filteredTechCardOptions: TechCardOption[];
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
              onTechCardIdChange(event.target.value);
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
          Привязка к техкарте обязательна, а категория выше отвечает за размещение позиции на сайте.
        </p>
      </label>
    </div>
  );
}
