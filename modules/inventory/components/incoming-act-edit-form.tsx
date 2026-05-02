"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type WriteoffActCreateFormState,
  updateIncomingActAction,
} from "@/modules/inventory/inventory.actions";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";
import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2).replace(/\.00$/, "");
}

function parseQuantity(value: string) {
  const normalized = value.replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeDecimalDraft(value: string) {
  const normalized = value.replace(/[^\d.,]/g, "").replace(".", ",");
  const [integerPart = "", ...rest] = normalized.split(",");
  const fractionalPart = rest.join("").slice(0, 2);

  if (!rest.length) {
    return integerPart;
  }

  return `${integerPart},${fractionalPart}`;
}

export function IncomingActEditForm({
  act,
  products,
  responsibleOptions,
}: {
  act: IncomingActSummary;
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
}) {
  const router = useRouter();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [supplierName, setSupplierName] = useState(act.supplierName ?? "");
  const [selectedResponsibleId, setSelectedResponsibleId] = useState(String(act.responsibleEmployeeId));
  const [notes, setNotes] = useState(act.notes ?? "");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    act.items.map((item) => item.productId),
  );
  const [draft, setDraft] = useState<Record<number, string>>(
    Object.fromEntries(act.items.map((item) => [item.productId, String(item.quantity).replace(".", ",")])),
  );
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>(
    Object.fromEntries(act.items.map((item) => [item.productId, formatPriceInput(item.priceCents)])),
  );
  const initialState: WriteoffActCreateFormState = {
    errorMessage: null,
    successMessage: null,
    createdActId: act.id,
  };
  const [state, formAction, isPending] = useActionState(
    updateIncomingActAction,
    initialState,
  );

  useEffect(() => {
    if (!state.successMessage) {
      return;
    }

    router.replace("/dashboard/inventory?tab=incoming", { scroll: false });
    router.refresh();
  }, [router, state.successMessage]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = !selectedCategory || product.category === selectedCategory;

        if (!matchesCategory) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return (
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.sku?.toLowerCase().includes(normalizedQuery) ||
          product.category?.toLowerCase().includes(normalizedQuery)
        );
      }),
    [normalizedQuery, products, selectedCategory],
  );

  const filteredProductsByCategory = useMemo(() => {
    const groups = filteredProducts.reduce<Record<string, ProductItem[]>>((acc, product) => {
      const key = product.category ?? "Без категории";
      acc[key] = [...(acc[key] ?? []), product];
      return acc;
    }, {});

    return Object.entries(groups).sort(([left], [right]) => left.localeCompare(right, "ru"));
  }, [filteredProducts]);

  const selectedProducts = useMemo(
    () =>
      selectedProductIds
        .map((productId) => {
          const product = products.find((item) => item.id === productId);

          if (!product) {
            return null;
          }

          return {
            product,
            quantity: draft[productId] ?? "",
            price: draftPrices[productId] ?? formatPriceInput(product.priceCents),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [draft, draftPrices, products, selectedProductIds],
  );

  const draftEntries = useMemo(
    () =>
      selectedProducts.flatMap(({ product, quantity, price }) => {
        const trimmedQuantity = quantity.trim();
        const trimmedPrice = price.trim();

        if (!trimmedQuantity || !trimmedPrice) {
          return [];
        }

        return [{ productId: String(product.id), quantity: trimmedQuantity, price: trimmedPrice }];
      }),
    [selectedProducts],
  );

  const draftTotalCents = useMemo(
    () =>
      selectedProducts.reduce((sum, item) => {
        const quantity = parseQuantity(item.quantity);
        const priceCents = Math.round(parseQuantity(item.price) * 100);

        if (quantity <= 0) {
          return sum;
        }

        return sum + quantity * priceCents;
      }, 0),
    [selectedProducts],
  );

  const setDraftValue = (productId: number, value: string) => {
    setDraft((current) => ({
      ...current,
      [productId]: normalizeDecimalDraft(value),
    }));
  };

  const setDraftPriceValue = (productId: number, value: string) => {
    setDraftPrices((current) => ({
      ...current,
      [productId]: normalizeDecimalDraft(value),
    }));
  };

  const addProductToDraft = (productId: number) => {
    setSelectedProductIds((current) => (current.includes(productId) ? current : [...current, productId]));
    setDraft((current) => (productId in current ? current : { ...current, [productId]: "" }));
    setDraftPrices((current) => {
      if (productId in current) {
        return current;
      }

      const product = products.find((item) => item.id === productId);
      return { ...current, [productId]: formatPriceInput(product?.priceCents ?? 0) };
    });
  };

  const removeProductFromDraft = (productId: number) => {
    setSelectedProductIds((current) => current.filter((id) => id !== productId));
    setDraft((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
    setDraftPrices((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  return (
    <>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="actId" value={act.id} />

        <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f1_100%)] p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Редактирование акта
              </p>
              <h2 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-zinc-950">
                Акт поступления #{act.id}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-zinc-600">
                Меняй состав поставки, ответственного и цены, пока акт не завершён и остатки ещё не проведены по складу.
              </p>
            </div>
            <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Строк</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-950">{selectedProducts.length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Итого</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-950">{formatMoney(draftTotalCents)}</p>
              </div>
            </div>
          </div>
        </section>

        {state.errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.errorMessage}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5">
            <section className="rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Ответственный
                </p>
                <h3 className="text-lg font-semibold text-zinc-950">Кто оформляет поступление</h3>
              </div>
              <input type="hidden" name="responsibleEmployeeId" value={selectedResponsibleId} />
              <div className="mt-4 grid gap-2">
                {responsibleOptions.map((option) => {
                  const isActive = selectedResponsibleId === String(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedResponsibleId(String(option.id))}
                      className={`rounded-[22px] border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>
                        {option.name}
                      </p>
                      <p className={`mt-1 text-sm ${isActive ? "text-white/70" : "text-zinc-500"}`}>
                        {option.role}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
              <div className="grid gap-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Поставщик</span>
                  <input
                    name="supplierName"
                    type="text"
                    value={supplierName}
                    onChange={(event) => setSupplierName(event.target.value)}
                    placeholder="Например: Фермерский двор"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Комментарий</span>
                  <textarea
                    name="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    placeholder="Например: поставка по вечерней закупке"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                  />
                </label>
              </div>
            </section>
          </div>

          <section className="rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
            {draftEntries.map((entry) => (
              <div key={entry.productId}>
                <input type="hidden" name="productId" value={entry.productId} />
                <input type="hidden" name="quantity" value={entry.quantity} />
                <input type="hidden" name="price" value={entry.price} />
              </div>
            ))}

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Состав поставки
                </p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-950">Строки акта</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchDialogOpen(true)}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Добавить товар
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {selectedProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                  В акте пока нет ни одной строки.
                </div>
              ) : (
                selectedProducts.map(({ product, quantity, price }) => {
                  const parsedQuantity = parseQuantity(quantity);
                  const parsedPriceCents = Math.round(parseQuantity(price) * 100);
                  const projectedStock = product.stockQuantity + parsedQuantity;

                  return (
                    <article
                      key={product.id}
                      className="grid gap-4 rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-zinc-950">{product.name}</h4>
                            <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800 ring-1 ring-red-200">
                              Приход в {product.unit}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500">
                            {product.category ?? "Без категории"} • Сейчас:{" "}
                            {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                          </p>
                          <p className="text-sm font-medium text-zinc-700">
                            После завершения: {formatInventoryQuantity(projectedStock)} {product.unit}
                          </p>
                          <p className="text-sm font-medium text-zinc-700">
                            Сумма поставки: {formatMoney(parsedQuantity * parsedPriceCents)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeProductFromDraft(product.id)}
                          className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50"
                        >
                          Убрать
                        </button>
                      </div>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-700">
                          Количество к поступлению, {product.unit}
                        </span>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={quantity}
                            onChange={(event) => setDraftValue(product.id, event.target.value)}
                            placeholder="0"
                            className="w-full rounded-[20px] border border-zinc-300 bg-white px-4 py-3 pr-16 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-zinc-500">
                            {product.unit}
                          </span>
                        </div>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-700">
                          Закупочная цена за {product.unit}
                        </span>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={price}
                            onChange={(event) => setDraftPriceValue(product.id, event.target.value)}
                            placeholder={formatPriceInput(product.priceCents)}
                            className="w-full rounded-[20px] border border-zinc-300 bg-white px-4 py-3 pr-16 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-zinc-500">
                            RUB
                          </span>
                        </div>
                      </label>
                    </article>
                  );
                })
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <Link
                href="/dashboard/inventory?tab=incoming"
                className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={draftEntries.length === 0 || !selectedResponsibleId || isPending}
                className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isPending ? "Сохраняем..." : "Сохранить изменения"}
              </button>
            </div>
          </section>
        </section>
      </form>

      {isSearchDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm"
          onClick={() => setIsSearchDialogOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Поиск товара для акта поступления"
            className="max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-y-auto rounded-[14px] border border-zinc-200 bg-[#fffdfc] p-4 sm:p-5 shadow-2xl shadow-zinc-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Поиск товара</p>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">
                  Добавить товар в акт поступления
                </h3>
                <p className="text-sm leading-6 text-zinc-600">
                  В редактирование можно добавить только товары, которые уже существуют на складе.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchDialogOpen(false)}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700">Поиск по товару</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Например: сыр или PRD-00012"
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !selectedCategory
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
                  }`}
                >
                  Все категории
                </button>
                {PRODUCT_CATEGORIES.map((category) => {
                  const count = products.filter((product) => product.category === category).length;

                  if (count === 0) {
                    return null;
                  }

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedCategory === category
                          ? "bg-red-800 text-white"
                          : "border border-red-100 bg-red-50 text-red-800 hover:border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {category} {count}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 space-y-5">
              {filteredProductsByCategory.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
                  По текущему фильтру товары не найдены.
                </div>
              ) : (
                filteredProductsByCategory.map(([categoryName, categoryProducts]) => (
                  <section key={categoryName} className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">{categoryName}</p>
                      <p className="text-xs text-zinc-500">{categoryProducts.length} позиций</p>
                    </div>
                    <div className="space-y-3">
                      {categoryProducts.map((product) => {
                        const isAdded = selectedProductIds.includes(product.id);

                        return (
                          <div
                            key={product.id}
                            className="flex items-center justify-between gap-3 rounded-[22px] border border-zinc-200 bg-white px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p>
                              <p className="mt-1 truncate text-sm text-zinc-500">
                                {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                                {product.sku ? ` • ${product.sku}` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addProductToDraft(product.id)}
                              disabled={isAdded}
                              className="shrink-0 rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                            >
                              {isAdded ? "Добавлено" : "Добавить"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
