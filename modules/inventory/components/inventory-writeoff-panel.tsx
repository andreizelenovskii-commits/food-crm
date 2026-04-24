"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeWriteoffActAction,
  createWriteoffActAction,
  deleteWriteoffActAction,
  type WriteoffActCreateFormState,
  type WriteoffActProgressFormState,
} from "@/modules/inventory/inventory.actions";
import {
  PRODUCT_CATEGORIES,
  WRITEOFF_REASONS,
  type InventoryResponsibleOption,
  type ProductCategory,
  type ProductItem,
  type WriteoffActSummary,
} from "@/modules/inventory/inventory.types";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";

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

export function InventoryWriteoffPanel({
  products,
  responsibleOptions,
  acts,
  canManageInventory,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  acts: WriteoffActSummary[];
  canManageInventory: boolean;
}) {
  const router = useRouter();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isCompletedActsDialogOpen, setIsCompletedActsDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<WriteoffActSummary | null>(null);
  const [selectedCompletedReason, setSelectedCompletedReason] = useState<
    (typeof WRITEOFF_REASONS)[number] | ""
  >("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [selectedResponsibleId, setSelectedResponsibleId] = useState("");
  const [reason, setReason] = useState<(typeof WRITEOFF_REASONS)[number]>(WRITEOFF_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const createInitialState: WriteoffActCreateFormState = {
    errorMessage: null,
    successMessage: null,
    createdActId: null,
  };
  const completeInitialState: WriteoffActProgressFormState = {
    errorMessage: null,
    successMessage: null,
  };
  const [createState, createFormAction, isCreatePending] = useActionState(
    createWriteoffActAction,
    createInitialState,
  );
  const [completeState, completeFormAction, isCompletePending] = useActionState(
    completeWriteoffActAction,
    completeInitialState,
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteWriteoffActAction,
    completeInitialState,
  );

  useEffect(() => {
    if (!createState.successMessage && !completeState.successMessage && !deleteState.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (createState.successMessage) {
        setSelectedProductIds([]);
        setDraft({});
        setNotes("");
        setSelectedResponsibleId("");
        setReason(WRITEOFF_REASONS[0]);
        setIsSearchDialogOpen(false);
      }
      if (deleteState.successMessage) {
        setDeleteCandidate(null);
      }
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [completeState.successMessage, createState.successMessage, deleteState.successMessage, router]);

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

  const draftEntries = useMemo(
    () =>
      selectedProductIds.flatMap((productId) => {
        const quantity = draft[productId] ?? "";
        const trimmedQuantity = quantity.trim();

        if (!trimmedQuantity) {
          return [];
        }

        return [{ productId: String(productId), quantity: trimmedQuantity }];
      }),
    [draft, selectedProductIds],
  );

  const openActs = acts.filter((act) => !act.isCompleted);
  const completedActs = acts.filter((act) => act.isCompleted);
  const latestCompletedAct = completedActs[0] ?? null;
  const totalCompletedWriteoffCents = completedActs.reduce((sum, act) => sum + act.totalCents, 0);

  const selectedProducts = useMemo(() => {
    return selectedProductIds
      .map((productId) => {
        const product = products.find((item) => item.id === productId);

        if (!product) {
          return null;
        }

        return {
          product,
          quantity: draft[productId] ?? "",
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [draft, products, selectedProductIds]);

  const draftTotalCents = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      const quantity = parseQuantity(item.quantity || "0");

      if (quantity <= 0) {
        return sum;
      }

      return sum + quantity * item.product.priceCents;
    }, 0);
  }, [selectedProducts]);

  const filteredProductsByCategory = useMemo(() => {
    const groups = filteredProducts.reduce<Record<string, ProductItem[]>>((acc, product) => {
      const categoryKey = product.category ?? "Без категории";
      const current = acc[categoryKey] ?? [];
      current.push(product);
      acc[categoryKey] = current;
      return acc;
    }, {});

    return Object.entries(groups).sort(([left], [right]) => left.localeCompare(right, "ru"));
  }, [filteredProducts]);

  const completedActsByReason = (() => {
    const groups = completedActs.reduce<Record<string, WriteoffActSummary[]>>((acc, act) => {
      acc[act.reason] = [...(acc[act.reason] ?? []), act];
      return acc;
    }, {});

    return WRITEOFF_REASONS.flatMap((reasonOption) => {
      const reasonActs = groups[reasonOption] ?? [];

      if (reasonActs.length === 0) {
        return [];
      }

      return [{ reason: reasonOption, acts: reasonActs }];
    });
  })();
  const visibleCompletedReason = selectedCompletedReason || completedActsByReason[0]?.reason || "";
  const visibleCompletedActs =
    completedActsByReason.find((group) => group.reason === visibleCompletedReason)?.acts ?? [];

  const setDraftValue = (productId: number, value: string) => {
    setDraft((current) => {
      const normalized = normalizeDecimalDraft(value);
      return {
        ...current,
        [productId]: normalized,
      };
    });
  };

  const addProductToDraft = (productId: number) => {
    setSelectedProductIds((current) => {
      if (current.includes(productId)) {
        return current;
      }

      return [...current, productId];
    });

    setDraft((current) => {
      if (productId in current) {
        return current;
      }

      return {
        ...current,
        [productId]: "",
      };
    });
  };

  const removeProductFromDraft = (productId: number) => {
    setSelectedProductIds((current) => current.filter((id) => id !== productId));
    setDraft((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  const renderCompletedAct = (act: WriteoffActSummary) => (
    <article key={act.id} className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Акт #{act.id}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-950">{act.reason}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {act.responsibleEmployeeName} • Завершён {act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Сумма</p>
          <p className="mt-2 text-xl font-semibold text-zinc-950">{formatMoney(act.totalCents)}</p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Было</th>
                <th className="px-4 py-3 font-medium">Списано</th>
                <th className="px-4 py-3 font-medium">Стало</th>
              </tr>
            </thead>
            <tbody>
              {act.items.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-950">{item.productName}</p>
                    <p className="text-zinc-500">
                      {item.productCategory ?? "Без категории"} • Списание в {item.productUnit}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {item.stockQuantityBefore === null ? "—" : formatInventoryQuantity(item.stockQuantityBefore)} {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-red-600">
                    -{formatInventoryQuantity(item.quantity)} {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {item.stockQuantityAfter === null ? "—" : formatInventoryQuantity(item.stockQuantityAfter)} {item.productUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canManageInventory ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setDeleteCandidate(act)}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100"
          >
            Удалить акт
          </button>
        </div>
      ) : null}
    </article>
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f7ece7_100%)] p-6 shadow-sm shadow-zinc-950/5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Списание товара
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            Потери, расход и отрицательные остатки
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Создавай акты списания, проводи их отдельно и при завершении система уменьшит остаток товара даже ниже нуля.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Открытых актов</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">{openActs.length}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Завершённых актов</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">{completedActs.length}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Сумма списаний</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">{formatMoney(totalCompletedWriteoffCents)}</p>
            </div>
          </div>
        </section>

        {completeState.errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {completeState.errorMessage}
          </div>
        ) : null}
        {deleteState.errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteState.errorMessage}
          </div>
        ) : null}
        {completeState.successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {completeState.successMessage}
          </div>
        ) : null}
        {deleteState.successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {deleteState.successMessage}
          </div>
        ) : null}

        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Открытые акты списания</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            В открытом акте состав уже зафиксирован, но остатки на складе изменятся только после завершения.
          </p>
          <div className="mt-6 space-y-4">
            {openActs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                Пока нет ни одного открытого акта списания.
              </div>
            ) : (
              openActs.map((act) => (
                <article
                  key={act.id}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                        Акт #{act.id}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                        {act.reason}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {act.responsibleEmployeeName} • {act.responsibleEmployeeRole} • {formatDateTime(act.createdAt)}
                      </p>
                      {act.notes ? (
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{act.notes}</p>
                      ) : null}
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
                            <th className="px-4 py-3 font-medium">В наличии сейчас</th>
                            <th className="px-4 py-3 font-medium">Списать</th>
                            <th className="px-4 py-3 font-medium">После завершения</th>
                          </tr>
                        </thead>
                        <tbody>
                          {act.items.map((item) => (
                            <tr key={item.id} className="border-t border-zinc-200">
                              <td className="px-4 py-4">
                                <p className="font-semibold text-zinc-950">{item.productName}</p>
                                <p className="text-zinc-500">
                                  {item.productCategory ?? "Без категории"} • Списание в {item.productUnit}
                                </p>
                              </td>
                              <td className="px-4 py-4 font-medium text-zinc-950">
                                {formatInventoryQuantity(item.currentStockQuantity)} {item.productUnit}
                              </td>
                              <td className="px-4 py-4 font-medium text-red-600">
                                -{formatInventoryQuantity(item.quantity)} {item.productUnit}
                              </td>
                              <td className="px-4 py-4 font-medium text-zinc-950">
                                {formatInventoryQuantity(item.currentStockQuantity - item.quantity)} {item.productUnit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {canManageInventory ? (
                    <div className="mt-4 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(act)}
                        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100"
                      >
                        Удалить акт
                      </button>
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
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Завершённые акты списания</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                После завершения остаток товара уменьшается на количество в акте. Отрицательные остатки допустимы.
              </p>
            </div>
            {completedActs.length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCompletedReason(completedActsByReason[0]?.reason ?? "");
                  setIsCompletedActsDialogOpen(true);
                }}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Показать ещё
              </button>
            ) : null}
          </div>
          <div className="mt-6 space-y-4">
            {latestCompletedAct === null ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                Пока нет завершённых актов списания.
              </div>
            ) : (
              <>
                {renderCompletedAct(latestCompletedAct)}
                {completedActs.length > 1 ? (
                  <p className="text-sm text-zinc-500">
                    Показан последний завершённый акт. Остальные доступны в архиве по кнопке выше.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>

      <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:sticky xl:top-28 xl:self-start">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-950">Новый акт списания</h2>
          <p className="text-sm leading-6 text-zinc-600">
            Укажи ответственного, причину и количество по товарам. Остатки на складе изменятся после завершения акта.
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
          <div className="grid gap-4">
            <section className="rounded-[28px] border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f4f0e8_100%)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Ответственный</p>
                  <h3 className="mt-2 text-base font-semibold text-zinc-950">Кто оформляет списание</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-zinc-200">
                  Обязательно
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                <input type="hidden" name="responsibleEmployeeId" value={selectedResponsibleId} />
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

            <section className="rounded-[28px] border border-zinc-200 bg-[linear-gradient(180deg,#fff7f4_0%,#f7ece7_100%)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Причина списания</p>
              <h3 className="mt-2 text-base font-semibold text-zinc-950">Почему уходит товар</h3>
              <input type="hidden" name="reason" value={reason} />
              <div className="mt-4 flex flex-wrap gap-2">
                {WRITEOFF_REASONS.map((item) => {
                  const isActive = reason === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setReason(item)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-rose-600 text-white shadow-sm shadow-rose-700/20"
                          : "border border-rose-100 bg-white text-rose-800 hover:border-rose-200 hover:bg-rose-50"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700">Комментарий</span>
            <textarea
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Например: списание из-за порчи после разморозки"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            />
          </label>

          {draftEntries.map((entry) => (
            <div key={entry.productId}>
              <input type="hidden" name="productId" value={entry.productId} />
              <input type="hidden" name="quantity" value={entry.quantity} />
            </div>
          ))}

          <section className="rounded-[28px] border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Состав акта</p>
                <h3 className="mt-2 text-base font-semibold text-zinc-950">Выбранные товары</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-zinc-200">
                  {selectedProducts.length} поз.
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchDialogOpen(true)}
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                >
                  Добавить товар
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {selectedProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                  Пока в акт ничего не добавлено.
                </div>
              ) : (
                selectedProducts.map(({ product, quantity }) => {
                  const parsedQuantity = parseQuantity(quantity);
                  const projectedStock = quantity ? product.stockQuantity - parsedQuantity : product.stockQuantity;
                  const projectedTone =
                    projectedStock < 0
                      ? "text-red-600"
                      : projectedStock === 0
                        ? "text-amber-600"
                        : "text-zinc-600";

                  return (
                    <article
                      key={product.id}
                      className="grid gap-4 rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-zinc-950">{product.name}</h4>
                            {product.sku ? (
                              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 ring-1 ring-zinc-200">
                                {product.sku}
                              </span>
                            ) : null}
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800 ring-1 ring-amber-200">
                              Списание в {product.unit}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-500">
                            {product.category ?? "Без категории"} • Сейчас:{" "}
                            {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                          </p>
                          <p className={`text-sm font-medium ${projectedTone}`}>
                            После списания: {formatInventoryQuantity(projectedStock)} {product.unit}
                          </p>
                          <p className="text-sm font-medium text-zinc-700">
                            Сумма списания: {formatMoney(parsedQuantity * product.priceCents)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProductFromDraft(product.id)}
                          className="shrink-0 rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                        >
                          Убрать
                        </button>
                      </div>

                      <label className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-medium text-zinc-700">
                            Количество к списанию, {product.unit}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                            Ед. изм. из склада: {product.unit}
                          </span>
                        </div>
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
                  ? "Акт можно провести даже если после списания остаток уйдёт в минус."
                  : "У твоей роли нет прав на создание актов списания."}
              </p>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Итого по акту</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">{formatMoney(draftTotalCents)}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDraft({})}
                disabled={draftEntries.length === 0 || isCreatePending}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Очистить
              </button>
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
            aria-label="Поиск товара для списания"
            className="max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-[#fcfbf8] p-6 shadow-2xl shadow-zinc-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Поиск товара
                </p>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">
                  Добавить товар в акт списания
                </h3>
                <p className="text-sm leading-6 text-zinc-600">
                  Найди товар по названию, SKU или категории и добавь его в состав акта.
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
                          ? "bg-rose-600 text-white"
                          : "border border-rose-100 bg-rose-50 text-rose-800 hover:border-rose-200 hover:bg-rose-100"
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
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-950">{categoryName}</p>
                        <p className="text-xs text-zinc-500">{categoryProducts.length} позиций</p>
                      </div>
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
                              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-amber-700">
                                Списание проводится в {product.unit}
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

      {isCompletedActsDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm"
          onClick={() => setIsCompletedActsDialogOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Архив завершённых актов списания"
            className="max-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-[#fcfbf8] p-6 shadow-2xl shadow-zinc-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Архив списаний
                </p>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">
                  Все завершённые акты списания
                </h3>
                <p className="text-sm leading-6 text-zinc-600">
                  Здесь собраны все завершённые акты, начиная с самого нового.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompletedActsDialogOpen(false)}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {completedActsByReason.map((group) => {
                const isActive = group.reason === visibleCompletedReason;

                return (
                  <button
                    key={group.reason}
                    type="button"
                    onClick={() => setSelectedCompletedReason(group.reason)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
                    }`}
                  >
                    {group.reason} {group.acts.length}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-950">{visibleCompletedReason}</p>
              <p className="text-xs text-zinc-500">
                {visibleCompletedActs.length} актов в выбранной категории списания
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {visibleCompletedActs.map((act) => renderCompletedAct(act))}
            </div>
          </div>
        </div>
      ) : null}

      {deleteCandidate ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-zinc-950/55 px-4 py-8 backdrop-blur-sm"
          onClick={() => (isDeletePending ? null : setDeleteCandidate(null))}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Подтверждение удаления акта списания"
            className="w-full max-w-xl rounded-[32px] border border-zinc-200 bg-[#fcfbf8] p-6 shadow-2xl shadow-zinc-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
                  Подтверждение удаления
                </p>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">
                  Удалить акт списания #{deleteCandidate.id}?
                </h3>
                <p className="text-sm leading-6 text-zinc-600">
                  Будет удалён открытый акт с причиной <span className="font-medium text-zinc-950">{deleteCandidate.reason}</span>.
                  {deleteCandidate.isCompleted
                    ? " При удалении завершённого акта остатки по его товарам будут возвращены на склад. Это действие нельзя отменить."
                    : " Это действие нельзя отменить."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeletePending}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-6 rounded-[24px] border border-red-100 bg-red-50/70 p-4">
              <p className="text-sm font-medium text-zinc-950">
                {deleteCandidate.responsibleEmployeeName} • {formatDateTime(deleteCandidate.createdAt)}
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Позиций в акте: {deleteCandidate.itemsCount}. Сумма: {formatMoney(deleteCandidate.totalCents)}.
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Статус: {deleteCandidate.isCompleted ? "завершён, остатки будут восстановлены" : "открыт, удаление без движения остатков"}
              </p>
            </div>

            <form action={deleteFormAction} className="mt-6 flex flex-wrap justify-end gap-3">
              <input type="hidden" name="actId" value={deleteCandidate.id} />
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeletePending}
                className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isDeletePending}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isDeletePending ? "Удаляем..." : "Подтвердить удаление"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
