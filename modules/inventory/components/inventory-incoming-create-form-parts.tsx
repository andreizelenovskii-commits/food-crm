"use client";

import { useState } from "react";
import { ModuleIcon } from "@/components/ui/module-icon";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  InventoryResponsibleOption,
  ProductItem,
} from "@/modules/inventory/inventory.types";
import {
  formatMoney,
  formatPriceInput,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";

export type IncomingDraftProduct = {
  product: ProductItem;
  quantity: string;
  price: string;
};

export function IncomingFormMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-[16px] border border-red-100 bg-red-50/80 px-3 py-2 text-xs font-semibold leading-5 text-red-800 shadow-sm shadow-red-950/5">
      {children}
    </div>
  );
}

export function IncomingResponsiblePicker({
  options,
  selectedResponsibleId,
  onChange,
}: {
  options: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  onChange: (value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedOption = options.find((option) => selectedResponsibleId === String(option.id));
  const visibleOptions = selectedOption && !isExpanded ? [selectedOption] : options;

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsExpanded(false);
  };

  return (
    <section className="rounded-[16px] border border-red-950/10 bg-white/62 p-2.5">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-red-800 text-white shadow-sm shadow-red-950/15">
          <ModuleIcon name="badge" className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/60">Ответственный</p>
          <h3 className="mt-0.5 text-sm font-semibold text-zinc-950">Кто оформляет поступление</h3>
        </div>
      </div>
      <input type="hidden" name="responsibleEmployeeId" value={selectedResponsibleId} />
      <div className="mt-2 grid gap-1.5">
        {visibleOptions.map((option) => {
          const isActive = selectedResponsibleId === String(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(String(option.id))}
              className={`rounded-[14px] border px-3 py-2 text-left shadow-sm shadow-red-950/5 transition ${isActive ? "border-red-800 bg-red-800 text-white" : "border-red-100 bg-white/85 hover:border-red-200 hover:bg-white"}`}
            >
              <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>{option.name}</p>
              <p className={`mt-0.5 text-[11px] ${isActive ? "text-white/70" : "text-zinc-500"}`}>{option.role}</p>
            </button>
          );
        })}
        {selectedOption && !isExpanded ? (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex h-8 items-center justify-center rounded-full border border-red-100 bg-white/85 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Изменить ответственного
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function IncomingDraftProducts({
  selectedProducts,
  onOpenSearch,
  onQuantityChange,
  onPriceChange,
  onRemoveProduct,
}: {
  selectedProducts: IncomingDraftProduct[];
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onPriceChange: (productId: number, value: string) => void;
  onRemoveProduct?: (productId: number) => void;
}) {
  return (
    <section className="rounded-[16px] border border-red-950/10 bg-white/62 p-2.5">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="box" className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/60">Состав поставки</p>
            <h3 className="mt-0.5 text-sm font-semibold text-zinc-950">Выбранные товары</h3>
          </div>
        </div>
        <button type="button" onClick={onOpenSearch} className="inline-flex h-8 shrink-0 items-center rounded-full border border-red-100 bg-white/85 px-3.5 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
          Добавить товар
        </button>
      </div>

      <div className="mt-2.5 space-y-2">
        {selectedProducts.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-red-200 bg-white/55 px-3 py-3 text-xs text-zinc-500">
            Пока в акт ничего не добавлено.
          </div>
        ) : (
          selectedProducts.map((item) => (
            <IncomingDraftProductCard
              key={item.product.id}
              item={item}
              onQuantityChange={onQuantityChange}
              onPriceChange={onPriceChange}
              onRemoveProduct={onRemoveProduct}
            />
          ))
        )}
      </div>
    </section>
  );
}

function IncomingDraftProductCard({
  item,
  onQuantityChange,
  onPriceChange,
  onRemoveProduct,
}: {
  item: IncomingDraftProduct;
  onQuantityChange: (productId: number, value: string) => void;
  onPriceChange: (productId: number, value: string) => void;
  onRemoveProduct?: (productId: number) => void;
}) {
  const { product, quantity, price } = item;
  const parsedQuantity = parseQuantity(quantity);
  const parsedPriceCents = Math.round(parseQuantity(price) * 100);
  const projectedStock = product.stockQuantity + parsedQuantity;

  return (
    <article className="grid gap-3 rounded-[15px] border border-red-950/10 bg-white/78 p-2.5 shadow-sm shadow-red-950/5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-sm font-semibold text-zinc-950">{product.name}</h4>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800 ring-1 ring-red-200">
              Приход в {product.unit}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            {product.category ?? "Без категории"} • Сейчас: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
          </p>
          <p className="text-[11px] font-medium text-zinc-700">После: {formatInventoryQuantity(projectedStock)} {product.unit}</p>
          <p className="text-[11px] font-medium text-zinc-700">Сумма: {formatMoney(parsedQuantity * parsedPriceCents)}</p>
        </div>
        {onRemoveProduct ? (
          <button type="button" onClick={() => onRemoveProduct(product.id)} className="inline-flex h-7 items-center rounded-full border border-red-100 bg-white px-2.5 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Убрать
          </button>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <IncomingDraftInput label={`Кол-во, ${product.unit}`} value={quantity} suffix={product.unit} placeholder="0" onChange={(value) => onQuantityChange(product.id, value)} />
        <IncomingDraftInput label={`Закупочная цена`} value={price} suffix="RUB" placeholder={formatPriceInput(product.priceCents)} onChange={(value) => onPriceChange(product.id, value)} />
      </div>
    </article>
  );
}

function IncomingDraftInput({
  label,
  value,
  suffix,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  suffix: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-semibold text-zinc-700">{label}</span>
      <div className="relative">
        <input type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 pr-16 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10" />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-zinc-500">
          {suffix}
        </span>
      </div>
    </label>
  );
}

export function IncomingCreateFooter({
  draftEntriesCount,
  draftTotalCents,
  selectedResponsibleId,
  selectedSupplierName,
  canManageInventory,
  isCreatePending,
}: {
  draftEntriesCount: number;
  draftTotalCents: number;
  selectedResponsibleId: string;
  selectedSupplierName: string;
  canManageInventory: boolean;
  isCreatePending: boolean;
}) {
  const isDisabled =
    draftEntriesCount === 0 || !selectedResponsibleId || !selectedSupplierName || isCreatePending;

  return (
    <div className="flex flex-col gap-2.5 rounded-[16px] border border-red-950/10 bg-white/62 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p className="text-xs leading-5 text-zinc-500">
          {canManageInventory
            ? "После завершения акта средняя закупочная цена товара на складе пересчитается автоматически."
            : "У твоей роли нет прав на создание актов поступления."}
        </p>
        <div className="rounded-[14px] border border-red-950/10 bg-white/80 px-3 py-2 shadow-sm shadow-red-950/5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Итого по акту</p>
          <p className="mt-0.5 text-base font-semibold text-zinc-950">{formatMoney(draftTotalCents)}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {canManageInventory ? (
          <button type="submit" disabled={isDisabled} className="inline-flex h-9 items-center rounded-full bg-red-800 px-4 text-sm font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
            {isCreatePending ? "Создаём..." : "Создать акт"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
