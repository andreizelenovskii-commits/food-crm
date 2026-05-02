"use client";

import {
  TECH_CARD_CATEGORIES,
  type TechCardCategory,
  TECH_CARD_PIZZA_SIZES,
  type TechCardPizzaSize,
} from "@/modules/tech-cards/tech-cards.types";

const OUTPUT_UNITS = ["шт", "кг"] as const;
export type OutputUnit = (typeof OUTPUT_UNITS)[number];

export function TechCardMainFields({
  name,
  category,
  pizzaSize,
  outputQuantity,
  outputUnit,
  onNameChange,
  onCategoryChange,
  onPizzaSizeChange,
  onOutputQuantityChange,
  onOutputUnitChange,
}: {
  name: string;
  category: TechCardCategory | "";
  pizzaSize: TechCardPizzaSize | "";
  outputQuantity: string;
  outputUnit: OutputUnit;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: TechCardCategory | "") => void;
  onPizzaSizeChange: (value: TechCardPizzaSize | "") => void;
  onOutputQuantityChange: (value: string) => void;
  onOutputUnitChange: (value: OutputUnit) => void;
}) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Название техкарты</span>
        <input
          name="name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Например: Пицца Маргарита 30 см"
          className="w-full rounded-[12px] border border-zinc-300 px-5 py-3.5 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Категория техкарты</span>
        <div className="relative">
          <select
            name="category"
            value={category}
            onChange={(event) => {
              const nextCategory = event.target.value as TechCardCategory | "";
              onCategoryChange(nextCategory);

              if (nextCategory !== "Пиццы") {
                onPizzaSizeChange("");
              }
            }}
            className={`w-full appearance-none rounded-[12px] border px-5 py-3.5 pr-12 text-[15px] outline-none transition focus:ring-2 ${
              category
                ? "border-red-200 bg-red-50/60 text-zinc-950 focus:border-red-400 focus:ring-red-500/10"
                : "border-zinc-300 bg-white text-zinc-500 focus:border-zinc-500 focus:ring-zinc-950/5"
            }`}
            required
          >
            <option value="">Выбери категорию техкарты</option>
            {TECH_CARD_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-red-800">▾</span>
        </div>
      </label>

      {category === "Пиццы" ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Размер пиццы</span>
          <div className="relative">
            <select
              name="pizzaSize"
              value={pizzaSize}
              onChange={(event) => onPizzaSizeChange(event.target.value as TechCardPizzaSize | "")}
              className={`w-full appearance-none rounded-[12px] border px-5 py-3.5 pr-12 text-[15px] outline-none transition focus:ring-2 ${
                pizzaSize
                  ? "border-red-200 bg-red-50/60 text-zinc-950 focus:border-red-400 focus:ring-red-500/10"
                  : "border-zinc-300 bg-white text-zinc-500 focus:border-zinc-500 focus:ring-zinc-950/5"
              }`}
              required
            >
              <option value="">Выбери размер пиццы</option>
              {TECH_CARD_PIZZA_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-red-800">▾</span>
          </div>
        </label>
      ) : (
        <input type="hidden" name="pizzaSize" value="" />
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Выход</span>
          <input
            name="outputQuantity"
            type="number"
            min="1"
            step="1"
            value={outputQuantity}
            onChange={(event) => onOutputQuantityChange(event.target.value)}
            placeholder="1"
            className="w-full rounded-[12px] border border-zinc-300 px-5 py-3.5 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
        </label>

        <div className="space-y-3">
          <span className="text-sm font-medium text-zinc-700">Ед. выхода</span>
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_UNITS.map((unit) => {
              const isSelected = outputUnit === unit;

              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onOutputUnitChange(unit)}
                  className={`rounded-[12px] border px-4 py-3.5 text-sm font-medium transition ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                      : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {unit}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="outputUnit" value={outputUnit} />
        </div>
      </div>
    </>
  );
}
