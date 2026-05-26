"use client";

import { useMemo, useState } from "react";
import { CATALOG_FIELD_CLASS_NAME } from "@/modules/catalog/components/catalog-item-form.model";
import { CATALOG_SITE_CATEGORIES } from "@/modules/catalog/catalog.types";
import { matchesSmartSearch } from "@/shared/lib/smart-search";

type TechCardOption = {
  id: number;
  name: string;
  category: string;
  pizzaSize: string | null;
  rollSize: string | null;
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
  const categoryOptions = CATALOG_SITE_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <CatalogDropdown
          name="category"
          label="Категория на сайте"
          placeholder="Выбери категорию сайта"
          value={selectedCategory}
          options={categoryOptions}
          onChange={(nextCategory) => {
            onCategoryChange(nextCategory);
            onTechCardIdChange("");
          }}
        />

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

function SelectChevron({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <span className="pointer-events-none flex items-center text-zinc-400">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        aria-hidden="true"
      >
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
  const techCardOptions = filteredTechCardOptions.map((option) => ({
    value: String(option.id),
    label: [
      option.name,
      option.category,
      option.pizzaSize,
      option.rollSize,
    ].filter(Boolean).join(" - "),
  }));

  return (
    <div className="grid gap-4">
      <div className="block space-y-2.5">
        <CatalogDropdown
          name="technologicalCardId"
          label="Технологическая карта"
          placeholder="Выбери техкарту"
          value={selectedTechCardId}
          options={techCardOptions}
          searchable
          onChange={onTechCardIdChange}
        />
        <p className="text-xs leading-5 text-zinc-500">
          Привязка к техкарте обязательна, а категория выше отвечает за размещение позиции на сайте.
        </p>
      </div>
    </div>
  );
}

export function CatalogDropdown({
  name,
  label,
  placeholder,
  value,
  options,
  searchable = false,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  searchable?: boolean;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = options.find((option) => option.value === value);
  const visibleOptions = useMemo(() => {
    if (!query.trim()) {
      return options;
    }

    return options.filter((option) => matchesSmartSearch(option.label, query));
  }, [options, query]);

  return (
    <div className="relative space-y-2.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input name={name} type="hidden" value={value} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`${CATALOG_FIELD_CLASS_NAME} flex items-center justify-between gap-3 pr-4 text-left`}
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? "truncate text-zinc-950" : "truncate text-zinc-400"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <SelectChevron isOpen={isOpen} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-[18px] border border-red-950/10 bg-white shadow-[0_18px_60px_rgba(127,29,29,0.16)]">
          {searchable ? (
            <div className="border-b border-red-950/10 p-2">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти"
                className="h-9 w-full rounded-full border border-red-950/10 bg-red-50/35 px-3 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                autoFocus
              />
            </div>
          ) : null}

          <div className="max-h-64 overflow-y-auto p-1.5">
            <DropdownOption
              label={placeholder}
              active={!value}
              onClick={() => {
                onChange("");
                setQuery("");
                setIsOpen(false);
              }}
            />
            {visibleOptions.map((option) => (
              <DropdownOption
                key={option.value}
                label={option.label}
                active={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setQuery("");
                  setIsOpen(false);
                }}
              />
            ))}
            {visibleOptions.length === 0 ? (
              <p className="px-3 py-5 text-center text-sm text-zinc-500">Ничего не найдено</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DropdownOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-10 w-full items-center rounded-[14px] px-3 text-left text-sm font-semibold transition",
        active
          ? "bg-red-50 text-red-800"
          : "text-zinc-700 hover:bg-red-50/70 hover:text-red-900",
      ].join(" ")}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
