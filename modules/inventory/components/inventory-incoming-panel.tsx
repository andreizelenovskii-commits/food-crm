"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeIncomingActAction,
  createIncomingActAction,
  type WriteoffActCreateFormState,
  type WriteoffActProgressFormState,
} from "@/modules/inventory/inventory.actions";
import { IncomingActDeleteButton } from "@/modules/inventory/components/incoming-act-delete-button";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";
import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

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

export function InventoryIncomingPanel({
  products,
  responsibleOptions,
  acts,
  canManageInventory,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  acts: IncomingActSummary[];
  canManageInventory: boolean;
}) {
  const router = useRouter();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [supplierName, setSupplierName] = useState("");
  const [selectedResponsibleId, setSelectedResponsibleId] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});
  const createInitialState: WriteoffActCreateFormState = {
    errorMessage: null,
    successMessage: null,
    createdActId: null,
  };
  const progressInitialState: WriteoffActProgressFormState = {
    errorMessage: null,
    successMessage: null,
  };
  const [createState, createFormAction, isCreatePending] = useActionState(
    createIncomingActAction,
    createInitialState,
  );
  const [completeState, completeFormAction, isCompletePending] = useActionState(
    completeIncomingActAction,
    progressInitialState,
  );

  useEffect(() => {
    if (!createState.successMessage && !completeState.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (createState.successMessage) {
        setSelectedProductIds([]);
        setDraft({});
        setDraftPrices({});
        setNotes("");
        setSupplierName("");
        setSelectedResponsibleId("");
        setIsSearchDialogOpen(false);
      }
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [completeState.successMessage, createState.successMessage, router]);

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

  const openActs = acts.filter((act) => !act.isCompleted);
  const completedActs = acts.filter((act) => act.isCompleted);
  const totalCompletedIncomingCents = completedActs.reduce((sum, act) => sum + act.totalCents, 0);
  const incomingTodayCount = acts.filter((act) => {
    const date = new Date(act.createdAt);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  }).length;
  const totalCompletedUnits = completedActs.reduce((sum, act) => sum + act.totalQuantity, 0);

  const setDraftValue = (productId: number, value: string) => {
    setDraft((current) => ({
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

  const setDraftPriceValue = (productId: number, value: string) => {
    setDraftPrices((current) => ({
      ...current,
      [productId]: normalizeDecimalDraft(value),
    }));
  };

  const renderAct = (act: IncomingActSummary, canComplete: boolean) => (
    <article key={act.id} className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Акт #{act.id}</p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-950">
            {act.supplierName ? `Поставка от ${act.supplierName}` : "Поступление на склад"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {act.responsibleEmployeeName} • {canComplete ? formatDateTime(act.createdAt) : `Завершён ${act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt)}`}
          </p>
          {act.notes ? <p className="mt-2 text-sm leading-6 text-zinc-600">{act.notes}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Строк</p>
            <p className="mt-2 text-xl font-semibold text-zinc-950">{act.itemsCount}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Сумма</p>
            <p className="mt-2 text-xl font-semibold text-zinc-950">{formatMoney(act.totalCents)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">{canComplete ? "Сейчас на складе" : "Было"}</th>
                <th className="px-4 py-3 font-medium">Поступило</th>
                <th className="px-4 py-3 font-medium">Закупочная цена</th>
                <th className="px-4 py-3 font-medium">{canComplete ? "После завершения" : "Стало"}</th>
              </tr>
            </thead>
            <tbody>
              {act.items.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-950">{item.productName}</p>
                    <p className="text-zinc-500">{item.productCategory ?? "Без категории"} • {item.productUnit}</p>
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {formatInventoryQuantity(
                      canComplete
                        ? item.currentStockQuantity
                        : (item.stockQuantityBefore ?? item.currentStockQuantity),
                    )}{" "}
                    {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-emerald-700">
                    +{formatInventoryQuantity(item.quantity)} {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {formatMoney(item.priceCents)}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {formatInventoryQuantity(
                      canComplete
                        ? item.currentStockQuantity + item.quantity
                        : (item.stockQuantityAfter ?? item.currentStockQuantity),
                    )}{" "}
                    {item.productUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canManageInventory ? (
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          {canComplete ? (
            <Link
              href={`/dashboard/inventory/incoming/${act.id}`}
              className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Редактировать
            </Link>
          ) : null}

          <IncomingActDeleteButton actId={act.id} isCompleted={!canComplete} />

          {canComplete ? (
            <form action={completeFormAction}>
              <input type="hidden" name="actId" value={act.id} />
              <button
                type="submit"
                disabled={isCompletePending}
                className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isCompletePending ? "Проводим..." : "Завершить акт"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef6ea_100%)] p-6 shadow-sm shadow-zinc-950/5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Поступление товара</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">Приход на склад</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Создавай акты поступления только по товарам, которые уже заведены на склад, и проводи их отдельно.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Открытых актов</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">{openActs.length}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Приходов сегодня</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">{incomingTodayCount}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Проведено на сумму закупок</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">{formatMoney(totalCompletedIncomingCents)}</p>
            </div>
          </div>
        </section>

        {completeState.errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {completeState.errorMessage}
          </div>
        ) : null}
        {completeState.successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {completeState.successMessage}
          </div>
        ) : null}

        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Открытые акты поступления</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            В открытом акте приход зафиксирован, но остаток на складе увеличится только после завершения.
          </p>
          <div className="mt-6 space-y-4">
            {openActs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                Пока нет ни одного открытого акта поступления.
              </div>
            ) : (
              openActs.map((act) => renderAct(act, true))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Завершённые поступления</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            После завершения акта остатки по товарам увеличиваются на количество в приходе.
          </p>
          <div className="mt-6 space-y-4">
            {completedActs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                Пока нет завершённых поступлений.
              </div>
            ) : (
              <>
                {completedActs.map((act) => renderAct(act, false))}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                  Всего проведено единиц товара:{" "}
                  <span className="font-semibold text-zinc-950">
                    {formatInventoryQuantity(totalCompletedUnits)}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:sticky xl:top-28 xl:self-start">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-950">Новое поступление</h2>
          <p className="text-sm leading-6 text-zinc-600">
            Добавляй в акт только товары, которые уже есть на складе. Новые остатки попадут в систему после завершения акта.
          </p>
        </div>

        {createState.errorMessage ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {createState.errorMessage}
          </div>
        ) : null}
        {createState.successMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {createState.successMessage}
          </div>
        ) : null}

        <form action={canManageInventory ? createFormAction : undefined} className="mt-6 space-y-5">
          <section className="rounded-[28px] border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f0f7ec_100%)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Ответственный</p>
                <h3 className="mt-2 text-base font-semibold text-zinc-950">Кто оформляет поступление</h3>
              </div>
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
                    <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>{option.name}</p>
                    <p className={`mt-1 text-sm ${isActive ? "text-white/70" : "text-zinc-500"}`}>{option.role}</p>
                  </button>
                );
              })}
            </div>
          </section>

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
              rows={3}
              placeholder="Например: поставка по утренней закупке"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            />
          </label>

          {draftEntries.map((entry) => (
            <div key={entry.productId}>
              <input type="hidden" name="productId" value={entry.productId} />
              <input type="hidden" name="quantity" value={entry.quantity} />
              <input type="hidden" name="price" value={entry.price} />
            </div>
          ))}

          <section className="rounded-[28px] border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Состав поставки</p>
                <h3 className="mt-2 text-base font-semibold text-zinc-950">Выбранные товары</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchDialogOpen(true)}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Добавить товар
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                  Пока в акт ничего не добавлено.
                </div>
              ) : (
                selectedProducts.map(({ product, quantity, price }) => {
                  const parsedQuantity = parseQuantity(quantity);
                  const parsedPriceCents = Math.round(parseQuantity(price) * 100);
                  const projectedStock = product.stockQuantity + parsedQuantity;

                  return (
                    <article key={product.id} className="grid gap-4 rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold text-zinc-950">{product.name}</h4>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800 ring-1 ring-emerald-200">
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
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-700">Количество к поступлению, {product.unit}</span>
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
                        <span className="text-sm font-medium text-zinc-700">Закупочная цена за {product.unit}</span>
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
          </section>

          <div className="flex flex-col gap-3 rounded-[28px] border border-zinc-200 bg-zinc-50 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm text-zinc-600">
                {canManageInventory
                  ? "После завершения акта средняя закупочная цена товара на складе пересчитается автоматически."
                  : "У твоей роли нет прав на создание актов поступления."}
              </p>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Итого по акту</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">{formatMoney(draftTotalCents)}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              {canManageInventory ? (
                <button
                  type="submit"
                  disabled={draftEntries.length === 0 || !selectedResponsibleId || isCreatePending}
                  className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {isCreatePending ? "Создаём..." : "Создать акт"}
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </aside>

      {isSearchDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm"
          onClick={() => setIsSearchDialogOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Поиск товара для поступления"
            className="max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-[#fcfbf8] p-6 shadow-2xl shadow-zinc-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Поиск товара</p>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">
                  Добавить товар в акт поступления
                </h3>
                <p className="text-sm leading-6 text-zinc-600">
                  В поступление можно добавить только товары, которые уже существуют на складе.
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

            <div className="mt-6 grid gap-4">
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
                          ? "bg-emerald-600 text-white"
                          : "border border-emerald-100 bg-emerald-50 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {category} {count}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-5">
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
    </div>
  );
}
