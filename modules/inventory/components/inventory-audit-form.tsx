"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type InventoryAuditFormState,
  submitInventoryAuditAction,
} from "@/modules/inventory/inventory.actions";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductItem,
} from "@/modules/inventory/inventory.types";

const INVENTORY_AUDIT_DRAFT_KEY = "food-crm.inventory-audit.draft";

type InventoryAuditDraft = Record<string, string>;

function readDraft(): InventoryAuditDraft {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawDraft = window.localStorage.getItem(INVENTORY_AUDIT_DRAFT_KEY);

    if (!rawDraft) {
      return {};
    }

    const parsedDraft = JSON.parse(rawDraft);

    if (!parsedDraft || typeof parsedDraft !== "object" || Array.isArray(parsedDraft)) {
      return {};
    }

    return Object.entries(parsedDraft).reduce<InventoryAuditDraft>((acc, [key, value]) => {
      if (typeof value === "string") {
        acc[key] = value;
      }

      return acc;
    }, {});
  } catch {
    return {};
  }
}

function normalizeDraftValue(value: string) {
  return value.trim();
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

export function InventoryAuditForm({
  products,
  canManageInventory,
  onSuccess,
}: {
  products: ProductItem[];
  canManageInventory: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [draft, setDraft] = useState<InventoryAuditDraft>({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const initialState: InventoryAuditFormState = {
    errorMessage: null,
    successMessage: null,
    checkedCount: 0,
    updatedCount: 0,
    differenceCount: 0,
  };
  const [state, formAction, isPending] = useActionState(
    submitInventoryAuditAction,
    initialState,
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setDraft(readDraft());
      setIsDraftLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) {
      return;
    }

    if (Object.keys(draft).length === 0) {
      window.localStorage.removeItem(INVENTORY_AUDIT_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(INVENTORY_AUDIT_DRAFT_KEY, JSON.stringify(draft));
  }, [draft, isDraftLoaded]);

  useEffect(() => {
    if (!state.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setDraft({});
      window.localStorage.removeItem(INVENTORY_AUDIT_DRAFT_KEY);
      onSuccess?.();
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [onSuccess, router, state.successMessage]);

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

  const categorySummaries = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((category) => ({
        category,
        count: products.filter((product) => product.category === category).length,
      })).filter((item) => item.count > 0),
    [products],
  );

  const draftEntries = useMemo(
    () =>
      Object.entries(draft).flatMap(([productId, value]) => {
        const normalizedValue = normalizeDraftValue(value);

        if (!normalizedValue) {
          return [];
        }

        return [{ productId, actualQuantity: normalizedValue }];
      }),
    [draft],
  );

  const touchedCount = draftEntries.length;
  const differenceCount = useMemo(
    () =>
      draftEntries.reduce((sum, entry) => {
        const product = products.find((item) => String(item.id) === entry.productId);

        if (!product) {
          return sum;
        }

        return sum + (String(product.stockQuantity) === entry.actualQuantity ? 0 : 1);
      }, 0),
    [draftEntries, products],
  );

  const setDraftValue = (productId: number, value: string) => {
    setDraft((currentDraft) => {
      const normalizedValue = normalizeDecimalDraft(value);
      const nextDraft = { ...currentDraft };

      if (!normalizedValue) {
        delete nextDraft[String(productId)];
        return nextDraft;
      }

      nextDraft[String(productId)] = normalizedValue;
      return nextDraft;
    });
  };

  return (
    <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-zinc-950">
            Рабочая сверка остатков
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            Внеси фактические остатки по товарам, сохрани сверку и система обновит текущие значения на складе.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Заполнено</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{touchedCount}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Расхождения</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{differenceCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Поиск по товару</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: сыр, соус или PRD-00012"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory("");
            }}
            className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Сбросить фильтр
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setSelectedCategory("")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !selectedCategory
              ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
              : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
          }`}
        >
          Все категории
        </button>
        {categorySummaries.map((item) => {
          const isActive = selectedCategory === item.category;

          return (
            <button
              key={item.category}
              type="button"
              onClick={() => setSelectedCategory(item.category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/20"
                  : "border border-emerald-100 bg-emerald-50/70 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {item.category} {item.count}
            </button>
          );
        })}
      </div>

      {state.errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.errorMessage}
        </div>
      ) : null}

      {state.successMessage ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.successMessage}
        </div>
      ) : null}

      <form action={canManageInventory ? formAction : undefined} className="mt-6 space-y-4">
        {draftEntries.map((entry) => (
          <div key={entry.productId}>
            <input type="hidden" name="productId" value={entry.productId} />
            <input type="hidden" name="actualQuantity" value={entry.actualQuantity} />
          </div>
        ))}

        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm text-zinc-500">
              По этому фильтру товары не найдены.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const value = draft[String(product.id)] ?? "";
              const hasValue = value.length > 0;
              const difference =
                hasValue && Number(value) !== product.stockQuantity
                  ? Number(value) - product.stockQuantity
                  : 0;
              const differenceTone =
                difference > 0
                  ? "text-emerald-700"
                  : difference < 0
                    ? "text-red-600"
                    : "text-zinc-500";

              return (
                <article
                  key={product.id}
                  className="grid gap-4 rounded-[28px] border border-zinc-200 bg-zinc-50/80 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-center"
                >
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-[1.1rem] font-semibold text-zinc-950">{product.name}</h3>
                      <p className="text-sm text-zinc-500">
                        Категория: {product.category ?? "Без категории"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                        Система: {product.stockQuantity} {product.unit}
                      </span>
                      {product.sku ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-zinc-200">
                          {product.sku}
                        </span>
                      ) : null}
                      {hasValue ? (
                        <span className={`rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-zinc-200 ${differenceTone}`}>
                          {difference === 0
                            ? "Без расхождения"
                            : difference > 0
                              ? `Излишек: +${difference} ${product.unit}`
                              : `Недостача: ${difference} ${product.unit}`}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700">Фактический остаток</span>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={value}
                        onChange={(event) => setDraftValue(product.id, event.target.value)}
                        placeholder={String(product.stockQuantity)}
                        disabled={!canManageInventory || isPending}
                        className="w-full rounded-[24px] border border-zinc-300 bg-white px-4 py-3 pr-16 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-zinc-500">
                        {product.unit}
                      </span>
                    </div>
                  </label>
                </article>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-[28px] border border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-600">
            {canManageInventory
              ? "Сохраняются только позиции, в которых ты ввёл фактический остаток."
              : "У твоей роли нет прав на проведение инвентаризации."}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDraft({})}
              disabled={touchedCount === 0 || isPending}
              className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Очистить черновик
            </button>
            {canManageInventory ? (
              <button
                type="submit"
                disabled={touchedCount === 0 || isPending}
                className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isPending ? "Сохраняем..." : "Провести инвентаризацию"}
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </section>
  );
}
