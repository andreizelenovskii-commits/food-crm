"use client";

import { useState } from "react";
import type { TechCardFormKind } from "@/modules/tech-cards/components/tech-card-form";
import {
  INGREDIENT_TECH_CARD_CATEGORY,
  PRICE_TECH_CARD_CATEGORIES,
  TECH_CARD_CATEGORIES,
  type TechCardCategory,
  TECH_CARD_PIZZA_SIZES,
  type TechCardPizzaSize,
  TECH_CARD_ROLL_SIZES,
  type TechCardRollSize,
} from "@/modules/tech-cards/tech-cards.types";

const OUTPUT_UNITS = ["шт", "кг"] as const;
export type OutputUnit = (typeof OUTPUT_UNITS)[number];

export function TechCardMainFields({
  name,
  category,
  pizzaSize,
  rollSize,
  autoCreatePizzaVariants,
  outputQuantity,
  outputUnit,
  onNameChange,
  onCategoryChange,
  onPizzaSizeChange,
  onRollSizeChange,
  onAutoCreatePizzaVariantsChange,
  onOutputQuantityChange,
  onOutputUnitChange,
  cardKind,
  isEditMode,
}: {
  name: string;
  category: TechCardCategory | "";
  pizzaSize: TechCardPizzaSize | "";
  rollSize: TechCardRollSize | "";
  autoCreatePizzaVariants: boolean;
  outputQuantity: string;
  outputUnit: OutputUnit;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: TechCardCategory | "") => void;
  onPizzaSizeChange: (value: TechCardPizzaSize | "") => void;
  onRollSizeChange: (value: TechCardRollSize | "") => void;
  onAutoCreatePizzaVariantsChange: (value: boolean) => void;
  onOutputQuantityChange: (value: string) => void;
  onOutputUnitChange: (value: OutputUnit) => void;
  cardKind: TechCardFormKind;
  isEditMode: boolean;
}) {
  const categoryOptions = cardKind === "ingredient" ? TECH_CARD_CATEGORIES : PRICE_TECH_CARD_CATEGORIES;

  return (
    <>
      <label className="block space-y-2">
        <span className="text-xs font-semibold text-zinc-700">Название техкарты</span>
        <input
          name="name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Например: Пицца Маргарита 30 см"
          className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold text-zinc-700">Категория техкарты</span>
        {cardKind === "ingredient" ? (
          <div className="flex h-11 items-center justify-between rounded-[14px] border border-red-200 bg-red-50/60 px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5">
            <span>{INGREDIENT_TECH_CARD_CATEGORY}</span>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800">
              ингредиент
            </span>
            <input type="hidden" name="category" value={INGREDIENT_TECH_CARD_CATEGORY} />
          </div>
        ) : (
          <TechCardSelect
            name="category"
            value={category === INGREDIENT_TECH_CARD_CATEGORY ? "" : category}
            placeholder="Выбери категорию техкарты"
            options={categoryOptions}
            onChange={(nextCategory) => {
              onCategoryChange(nextCategory);

              if (nextCategory !== "Пиццы") {
                onPizzaSizeChange("");
              }

              if (nextCategory !== "Роллы") {
                onRollSizeChange("");
              }
            }}
          />
        )}
      </label>

      {category === "Пиццы" ? (
        <label className="block space-y-2">
          <span className="text-xs font-semibold text-zinc-700">Размер пиццы</span>
          <TechCardSelect
            name="pizzaSize"
            value={pizzaSize}
            placeholder="Выбери размер пиццы"
            options={TECH_CARD_PIZZA_SIZES}
            onChange={onPizzaSizeChange}
          />
          {pizzaSize === "30 см" ? (
            isEditMode ? (
              <span className="block text-xs leading-5 text-zinc-500">
                Варианты 26 см и 24 см создаются только при добавлении новой техкарты 30 см.
              </span>
            ) : (
              <label className="flex items-center justify-between gap-3 rounded-[16px] border border-red-950/10 bg-white/76 px-3 py-3 shadow-sm shadow-red-950/5">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-zinc-950">Создать 26 см и 24 см</span>
                  <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                    Ингредиенты уменьшатся на 15% от предыдущего размера.
                  </span>
                </span>
                <input type="hidden" name="autoCreatePizzaVariants" value={autoCreatePizzaVariants ? "true" : "false"} />
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoCreatePizzaVariants}
                  onClick={() => onAutoCreatePizzaVariantsChange(!autoCreatePizzaVariants)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    autoCreatePizzaVariants ? "bg-red-800" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      autoCreatePizzaVariants ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </label>
            )
          ) : null}
        </label>
      ) : (
        <input type="hidden" name="pizzaSize" value="" />
      )}

      {category === "Роллы" ? (
        <label className="block space-y-2">
          <span className="text-xs font-semibold text-zinc-700">Количество роллов</span>
          <TechCardSelect
            name="rollSize"
            value={rollSize}
            placeholder="Выбери количество"
            options={TECH_CARD_ROLL_SIZES}
            onChange={onRollSizeChange}
          />
          {rollSize === "8 шт" ? (
            <span className="block text-xs leading-5 text-zinc-500">
              Для 4 шт техкарта создастся автоматически: ингредиенты уменьшатся на 50%.
            </span>
          ) : null}
        </label>
      ) : (
        <input type="hidden" name="rollSize" value="" />
      )}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.72fr)]">
        <label className="block space-y-2">
          <span className="text-xs font-semibold text-zinc-700">Выход</span>
          <input
            name="outputQuantity"
            type="text"
            inputMode="decimal"
            value={outputQuantity}
            onChange={(event) => onOutputQuantityChange(event.target.value)}
            placeholder="1"
            className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
            required
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-700">Ед. выхода</span>
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_UNITS.map((unit) => {
              const isSelected = outputUnit === unit;

              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onOutputUnitChange(unit)}
                  className={`h-11 rounded-[14px] border px-4 text-sm font-semibold transition ${
                    isSelected
                      ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                      : "border-red-950/10 bg-white/90 text-zinc-700 hover:border-red-200 hover:bg-red-50/60 hover:text-red-900"
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

function TechCardSelect<TValue extends string>({
  name,
  value,
  placeholder,
  options,
  onChange,
}: {
  name: string;
  value: TValue | "";
  placeholder: string;
  options: readonly TValue[];
  onChange: (value: TValue | "") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-[14px] border px-4 text-left text-sm font-medium shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10 ${
          value
            ? "border-red-200 bg-red-50/60 text-zinc-950"
            : "border-red-950/10 bg-white/90 text-zinc-400"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value || placeholder}</span>
        <span className={`shrink-0 text-red-800 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-40 max-h-64 overflow-y-auto rounded-[16px] border border-red-950/10 bg-white/96 p-1.5 shadow-[0_18px_50px_rgba(127,29,29,0.16)] backdrop-blur-2xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`flex h-9 w-full items-center rounded-[11px] px-3 text-left text-sm font-semibold transition ${
              !value ? "bg-red-800 text-white" : "text-zinc-500 hover:bg-red-50 hover:text-red-900"
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => {
            const isSelected = value === option;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`mt-0.5 flex h-9 w-full items-center justify-between gap-3 rounded-[11px] px-3 text-left text-sm font-semibold transition ${
                  isSelected ? "bg-red-800 text-white" : "text-zinc-700 hover:bg-red-50 hover:text-red-900"
                }`}
              >
                <span>{option}</span>
                {isSelected ? <span aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
