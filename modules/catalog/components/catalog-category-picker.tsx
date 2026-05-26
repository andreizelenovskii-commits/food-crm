"use client";

import { useState } from "react";

type CatalogCategoryOption = {
  category: string;
  count: number;
};

export function CatalogCategoryPicker({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: CatalogCategoryOption[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find((item) => item.category === value);
  const options = [{ category: "", count: null }, ...categories] as Array<{
    category: string;
    count: number | null;
  }>;

  return (
    <div
      className="relative min-w-0 xl:w-64"
      onBlur={() => {
        window.setTimeout(() => setIsOpen(false), 120);
      }}
    >
      <span className="foodlike-kicker">Категория</span>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={[
          "mt-2 flex h-11 w-full items-center justify-between gap-3 rounded-full border bg-white px-4 text-left text-sm font-semibold text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition",
          isOpen
            ? "border-red-300 ring-2 ring-red-800/10"
            : "border-red-950/10 hover:border-red-200",
        ].join(" ")}
        aria-expanded={isOpen}
      >
        <span className="min-w-0 truncate">
          {selectedCategory ? `${selectedCategory.category} · ${selectedCategory.count}` : "Все категории"}
        </span>
        <span
          className={[
            "flex size-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-800 transition",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        >
          ↓
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[18px] border border-red-100 bg-white/98 p-1.5 shadow-[0_22px_60px_rgba(90,12,20,0.16)] backdrop-blur-xl">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const isActive = option.category === value;
              const label = option.category || "Все категории";

              return (
                <button
                  key={option.category || "all"}
                  type="button"
                  onClick={() => {
                    onChange(option.category);
                    setIsOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold transition",
                    isActive
                      ? "bg-red-800 text-white"
                      : "text-zinc-800 hover:bg-red-50 hover:text-red-900",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate">{label}</span>
                  {option.count !== null ? (
                    <span
                      className={[
                        "shrink-0 rounded-full px-2 py-0.5 text-xs",
                        isActive ? "bg-white/18 text-white" : "bg-red-50 text-red-800",
                      ].join(" ")}
                    >
                      {option.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
