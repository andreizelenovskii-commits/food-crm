"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { PaginatedList } from "@/components/ui/paginated-list";
import type { SelectedComponent } from "@/modules/tech-cards/components/tech-card-draft";
import type { TechCardItem } from "@/modules/tech-cards/tech-cards.types";

export function TechCardComponentDialog({
  componentQuery,
  selectedCategory,
  availableCategories,
  filteredComponents,
  selectedComponents,
  pendingComponentIds,
  onQueryChange,
  onCategoryChange,
  onTogglePending,
  onRemoveSelected,
  onResetPending,
  onAddPending,
  onClose,
}: {
  componentQuery: string;
  selectedCategory: string;
  availableCategories: string[];
  filteredComponents: TechCardItem[];
  selectedComponents: SelectedComponent[];
  pendingComponentIds: string[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTogglePending: (techCardId: string) => void;
  onRemoveSelected: (techCardId: string) => void;
  onResetPending: () => void;
  onAddPending: () => void;
  onClose: () => void;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-zinc-950/70 px-4 py-4 backdrop-blur-md" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Выбор техкарт для комбинированной карты"
        className="flex max-h-[min(760px,calc(100dvh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(24,24,27,0.34)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-red-950/10 bg-[linear-gradient(135deg,#fff_0%,#fff6f5_100%)] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Состав комбо</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Выбор готовых техкарт</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Найди готовые позиции, отметь нужные и добавь их в состав.
              </p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Закрыть
            </button>
          </div>

          <input
            type="search"
            value={componentQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Найти техкарту по названию, категории или размеру"
            className="mt-4 h-11 w-full rounded-[14px] border border-red-950/10 bg-white px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
            autoFocus
          />

          <div className="mt-3 flex gap-2 overflow-x-auto rounded-[14px] border border-red-950/10 bg-white/80 p-1.5">
            <CategoryButton active={!selectedCategory} onClick={() => onCategoryChange("")}>Все категории</CategoryButton>
            {availableCategories.map((category) => (
              <CategoryButton key={category} active={selectedCategory === category} onClick={() => onCategoryChange(category)}>
                {category}
              </CategoryButton>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-red-50/25 px-4 py-4 sm:px-5">
          {filteredComponents.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-red-950/14 bg-white px-4 py-5 text-sm text-zinc-500">
              Ничего не найдено. Попробуй другой запрос.
            </div>
          ) : (
            <PaginatedList itemLabel="техкарт" className="grid gap-2.5" pageSize={7}>
              {filteredComponents.map((component) => {
                const componentId = String(component.id);
                const isSelected = selectedComponents.some((item) => item.techCardId === componentId);
                const isPendingSelected = pendingComponentIds.includes(componentId);

                return (
                  <ComponentPickerRow
                    key={component.id}
                    component={component}
                    isSelected={isSelected}
                    isPendingSelected={isPendingSelected}
                    onToggle={() => onTogglePending(componentId)}
                    onRemove={() => onRemoveSelected(componentId)}
                  />
                );
              })}
            </PaginatedList>
          )}
        </div>

        <div className="shrink-0 border-t border-red-950/10 bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600">
              Отмечено для добавления: <span className="font-semibold text-zinc-950">{pendingComponentIds.length}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onResetPending} disabled={pendingComponentIds.length === 0} className="h-10 rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                Сбросить выбор
              </button>
              <button type="button" onClick={onAddPending} disabled={pendingComponentIds.length === 0} className="h-10 rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300">
                Добавить выбранные
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CategoryButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 shrink-0 rounded-[10px] px-3 text-xs font-semibold transition ${
        active ? "bg-red-800 text-white shadow-sm shadow-red-950/15" : "text-zinc-500 hover:bg-red-50 hover:text-red-900"
      }`}
    >
      {children}
    </button>
  );
}

function ComponentPickerRow({
  component,
  isSelected,
  isPendingSelected,
  onToggle,
  onRemove,
}: {
  component: TechCardItem;
  isSelected: boolean;
  isPendingSelected: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2.5 rounded-[14px] border px-3 py-2 shadow-sm shadow-red-950/5 transition ${isPendingSelected ? "border-red-200 bg-red-50/80" : "border-red-950/10 bg-white/84 hover:border-red-100"}`}>
      <label className="flex min-w-0 flex-1 items-start gap-3">
        <input type="checkbox" checked={isSelected || isPendingSelected} disabled={isSelected} onChange={onToggle} className="mt-0.5 h-4 w-4 rounded border-red-200 text-red-700 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-5 text-zinc-950">{component.name}</p>
          <p className="text-xs leading-4 text-zinc-500">
            {component.category}
            {component.pizzaSize ? ` · ${component.pizzaSize}` : ""}
            {component.rollSize ? ` · ${component.rollSize}` : ""}
          </p>
          <p className="text-xs leading-4 text-zinc-400">
            Выход: {formatQuantity(component.outputQuantity)} {component.outputUnit}
          </p>
        </div>
      </label>
      {isSelected ? (
        <button type="button" onClick={onRemove} className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-red-800 ring-1 ring-zinc-200 transition hover:bg-red-800 hover:text-white hover:ring-red-800">
          Убрать
        </button>
      ) : (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isPendingSelected ? "bg-red-800 text-white" : "bg-white text-zinc-500 ring-1 ring-red-950/10"}`}>
          {isPendingSelected ? "Выбрано" : "Можно выбрать"}
        </span>
      )}
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 4,
  }).format(value);
}
