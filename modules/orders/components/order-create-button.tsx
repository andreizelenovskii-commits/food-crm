"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createOrderAction, type OrderFormState } from "@/modules/orders/orders.actions";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import { getLoyaltyDiscountPercent } from "@/modules/loyalty/loyalty.rules";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function OrderCreateButton({
  clients,
  employees,
  catalogItems,
}: {
  clients: Client[];
  employees: Employee[];
  catalogItems: CatalogItem[];
}) {
  const initialState: OrderFormState = {
    errorMessage: null,
    successMessage: null,
    values: {
      clientId: "",
      employeeId: "",
      status: "PENDING",
      isInternal: false,
      items: "[]",
    },
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [state, formAction, isPending] = useActionState(createOrderAction, initialState);

  useEffect(() => {
    if (!isPending && state.successMessage && isOpen) {
      const timeoutId = window.setTimeout(() => {
        setIsOpen(false);
        setIsInternal(false);
        setSelectedClientId("");
        setSelectedCategory("");
        setSelectedItems({});
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, isPending, state.successMessage]);

  const visibleCatalogItems = useMemo(
    () =>
      catalogItems.filter((item) =>
        isInternal ? item.priceListType === "INTERNAL" : item.priceListType === "CLIENT",
      ),
    [catalogItems, isInternal],
  );

  const availableCategories = useMemo(
    () =>
      Array.from(new Set(visibleCatalogItems.map((item) => item.category).filter(Boolean))).sort((a, b) =>
        String(a).localeCompare(String(b), "ru"),
      ) as string[],
    [visibleCatalogItems],
  );

  const filteredCatalogItems = useMemo(
    () =>
      visibleCatalogItems.filter((item) => !selectedCategory || item.category === selectedCategory),
    [selectedCategory, visibleCatalogItems],
  );

  const selectedOrderItems = useMemo(
    () =>
      Object.entries(selectedItems)
        .map(([catalogItemId, quantity]) => {
          const item = catalogItems.find((entry) => entry.id === Number(catalogItemId));

          if (!item || quantity <= 0) {
            return null;
          }

          return {
            item,
            quantity,
            totalCents: item.priceCents * quantity,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [catalogItems, selectedItems],
  );

  const totalCents = selectedOrderItems.reduce((sum, entry) => sum + entry.totalCents, 0);
  const selectedClient = clients.find((client) => String(client.id) === selectedClientId) ?? null;
  const discountPercent =
    !isInternal && selectedClient?.loyaltyLevel
      ? getLoyaltyDiscountPercent(selectedClient.loyaltyLevel)
      : 0;
  const discountCents = Math.round((totalCents * discountPercent) / 100);
  const payableTotalCents = Math.max(totalCents - discountCents, 0);
  const itemsPayload = JSON.stringify(
    selectedOrderItems.map((entry) => ({
      catalogItemId: entry.item.id,
      quantity: entry.quantity,
    })),
  );

  const setQuantity = (catalogItemId: number, quantity: number) => {
    setSelectedItems((current) => {
      const next = { ...current };

      if (quantity <= 0) {
        delete next[catalogItemId];
      } else {
        next[catalogItemId] = quantity;
      }

      return next;
    });
  };

  const switchOrderType = (value: boolean) => {
    setIsInternal(value);
    setSelectedCategory("");
    setSelectedItems((current) => {
      const allowedType = value ? "INTERNAL" : "CLIENT";
      const nextEntries = Object.entries(current).filter(([catalogItemId]) => {
        const item = catalogItems.find((entry) => entry.id === Number(catalogItemId));
        return item?.priceListType === allowedType;
      });

      return Object.fromEntries(nextEntries);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:bg-emerald-500"
        aria-label="Создать заказ"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/16">
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M10 4.5V15.5M4.5 10H15.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span>Создать заказ</span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:items-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-5xl rounded-[30px] border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <form action={formAction} className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-zinc-950">Создать заказ</h2>
                  <p className="text-sm leading-6 text-zinc-600">
                    Выбери тип заказа, нужные позиции из подходящего прайса, клиента и исполнителя.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900"
                  aria-label="Закрыть окно"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-700">Тип заказа</span>
                      <span className="text-xs text-zinc-500">От него зависит доступный прайс</span>
                    </div>
                    <div className="rounded-[22px] border border-zinc-200 bg-zinc-50/90 p-1.5">
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {[
                          { value: false, title: "Клиентский заказ", note: "Показывает только позиции клиентского прайса." },
                          { value: true, title: "Внутренний заказ", note: "Показывает только позиции внутреннего прайса." },
                        ].map((option) => {
                          const isSelected = isInternal === option.value;

                          return (
                            <button
                              key={option.title}
                              type="button"
                              onClick={() => switchOrderType(option.value)}
                              className={`rounded-[18px] px-4 py-3 text-left transition ${
                                isSelected
                                  ? "bg-white text-zinc-950 shadow-sm ring-1 ring-emerald-500/25"
                                  : "bg-transparent text-zinc-600 hover:bg-white/70 hover:text-zinc-950"
                              }`}
                            >
                              <span className="block text-sm font-semibold">{option.title}</span>
                              <span className="mt-1 block text-xs text-zinc-500">{option.note}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <input type="hidden" name="isInternal" value={String(isInternal)} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-700">Позиции заказа</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          Сейчас видны только позиции из {isInternal ? "внутреннего" : "клиентского"} прайса.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("")}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                          !selectedCategory
                            ? "bg-zinc-950 text-white"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                        }`}
                      >
                        Все категории
                      </button>
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            selectedCategory === category
                              ? "bg-zinc-950 text-white"
                              : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                      {filteredCatalogItems.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
                          В этом прайсе пока нет доступных позиций.
                        </div>
                      ) : (
                        filteredCatalogItems.map((item) => {
                          const quantity = selectedItems[item.id] ?? 0;

                          return (
                            <div
                              key={item.id}
                              className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-semibold text-zinc-950">{item.name}</h4>
                                    {item.category ? (
                                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-500 ring-1 ring-zinc-200">
                                        {item.category}
                                      </span>
                                    ) : null}
                                  </div>
                                  {item.description ? (
                                    <p className="text-xs leading-5 text-zinc-500">{item.description}</p>
                                  ) : null}
                                  <p className="text-sm font-medium text-zinc-900">
                                    {formatMoney(item.priceCents)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 self-start">
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(item.id, quantity - 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-lg text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                                  >
                                    -
                                  </button>
                                  <div className="flex h-9 min-w-[3rem] items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-950">
                                    {quantity}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(item.id, quantity + 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-lg text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <aside className="space-y-5 rounded-[28px] border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f4efe5_100%)] p-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Параметры заказа
                    </h3>
                    <p className="text-sm leading-6 text-zinc-600">
                      Заполни клиента, исполнителя и проверь состав перед созданием.
                    </p>
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700">Клиент</span>
                    <select
                      name="clientId"
                      value={selectedClientId}
                      onChange={(event) => setSelectedClientId(event.target.value)}
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                      required
                    >
                      <option value="">Выбери клиента</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} · {client.phone}
                        </option>
                      ))}
                    </select>
                  </label>

                  {!isInternal && selectedClient?.loyaltyLevel ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      <p className="font-medium">
                        У клиента уровень {LOYALTY_LEVEL_LABELS[selectedClient.loyaltyLevel]}
                      </p>
                      <p className="mt-1 text-emerald-800">
                        Автоматическая скидка на заказ: {discountPercent}%
                      </p>
                    </div>
                  ) : null}

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700">Исполнитель</span>
                    <select
                      name="employeeId"
                      defaultValue={state.values.employeeId}
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                      required
                    >
                      <option value="">Выбери сотрудника</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} · {employee.role}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700">Статус</span>
                    <select
                      name="status"
                      defaultValue={state.values.status}
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                      required
                    >
                      <option value="PENDING">Новый</option>
                      <option value="PROCESSING">В работе</option>
                      <option value="COMPLETED">Завершён</option>
                      <option value="CANCELLED">Отменён</option>
                    </select>
                  </label>

                  <input type="hidden" name="items" value={itemsPayload} />

                  <div className="rounded-3xl border border-white/80 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-600">Выбрано позиций</span>
                      <span className="text-sm font-semibold text-zinc-950">
                        {selectedOrderItems.length}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {selectedOrderItems.length === 0 ? (
                        <p className="text-sm text-zinc-500">Добавь позиции слева.</p>
                      ) : (
                        selectedOrderItems.map((entry) => (
                          <div key={entry.item.id} className="flex items-start justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-zinc-900">{entry.item.name}</p>
                              <p className="text-zinc-500">
                                {entry.quantity} × {formatMoney(entry.item.priceCents)}
                              </p>
                            </div>
                            <span className="shrink-0 font-medium text-zinc-900">
                              {formatMoney(entry.totalCents)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                      <span className="text-sm font-medium text-zinc-600">Подытог</span>
                      <span className="text-base font-semibold text-zinc-950">
                        {formatMoney(totalCents)}
                      </span>
                    </div>
                    {!isInternal && discountPercent > 0 ? (
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-zinc-600">
                          Скидка по лояльности ({discountPercent}%)
                        </span>
                        <span className="text-base font-semibold text-emerald-700">
                          -{formatMoney(discountCents)}
                        </span>
                      </div>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                      <span className="text-sm font-medium text-zinc-600">Итого</span>
                      <span className="text-lg font-semibold text-zinc-950">
                        {formatMoney(payableTotalCents)}
                      </span>
                    </div>
                  </div>

                  {state.errorMessage ? (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {state.errorMessage}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {isPending ? "Создаём..." : "Создать заказ"}
                    </button>
                  </div>
                </aside>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
