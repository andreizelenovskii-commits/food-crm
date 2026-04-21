"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createInventorySessionAction,
  type InventorySessionCreateFormState,
} from "@/modules/inventory/inventory.actions";
import type {
  InventoryResponsibleOption,
  InventorySessionSummary,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function InventoryAuditDialogs({
  products,
  responsibleOptions,
  sessions,
  canManageInventory,
  lowStockCount,
  zeroStockCount,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  sessions: InventorySessionSummary[];
  canManageInventory: boolean;
  lowStockCount: number;
  zeroStockCount: number;
}) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(sessions[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [selectedResponsibleId, setSelectedResponsibleId] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const initialState: InventorySessionCreateFormState = {
    errorMessage: null,
    successMessage: null,
    createdSessionId: null,
  };
  const [state, formAction, isPending] = useActionState(
    createInventorySessionAction,
    initialState,
  );

  useEffect(() => {
    if (!state.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsCreateDialogOpen(false);
      setSelectedResponsibleId("");
      setSelectedProductIds([]);
      setNotes("");
      setQuery("");
      setSelectedCategory("");
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
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

  const categorySummaries = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.category)
            .filter((category): category is ProductCategory => Boolean(category)),
        ),
      ).map((category) => ({
        category,
        count: products.filter((product) => product.category === category).length,
      })),
    [products],
  );

  const selectedProducts = useMemo(
    () =>
      selectedProductIds
        .map((productId) => products.find((product) => product.id === productId))
        .filter((product): product is ProductItem => Boolean(product)),
    [products, selectedProductIds],
  );

  const selectedResponsible = responsibleOptions.find(
    (item) => String(item.id) === selectedResponsibleId,
  );
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null;

  const toggleProduct = (productId: number) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  return (
    <>
      <aside className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:p-7">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Действия
          </p>
          <h2 className="text-[1.45rem] font-semibold tracking-[-0.02em] text-zinc-950">
            Управление инвентаризацией
          </h2>
          <p className="text-sm leading-6 text-zinc-600">
            Создай новый лист инвентаризации с выбранными товарами и ответственным сотрудником или открой уже собранные листы.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-[28px] border border-zinc-950 bg-zinc-950 px-5 py-5 text-left text-white transition hover:bg-zinc-800"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Новая сессия
            </p>
            <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-white">
              Создать инвентаризацию
            </p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Выбери товары, назначь ответственного и зафиксируй текущие остатки в итоговом листе.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryDialogOpen(true)}
            className="rounded-[28px] border border-zinc-200 bg-zinc-50 px-5 py-5 text-left transition hover:border-zinc-300 hover:bg-white"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Архив
            </p>
            <p className="mt-3 text-[1.25rem] font-semibold tracking-[-0.02em] text-zinc-950">
              Прошедшие инвентаризации
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Открой уже созданные листы, посмотри ответственного, дату и полный список товаров в инвентаризации.
            </p>
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">На складе</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Мало остатка</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{lowStockCount}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Ноль на складе</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{zeroStockCount}</p>
          </div>
        </div>
      </aside>

      {isCreateDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm"
          onClick={() => setIsCreateDialogOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Создать инвентаризацию"
            className="max-h-[calc(100vh-4rem)] w-full max-w-7xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-[#fcfbf8] p-4 shadow-2xl shadow-zinc-950/20 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Новая инвентаризация
                </p>
                <h3 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-zinc-950">
                  Сбор итогового листа
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-zinc-600">
                  Собери список товаров, назначь сотрудника и зафиксируй остатки системы на момент создания инвентаризации.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Закрыть
              </button>
            </div>

            {state.errorMessage ? (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.errorMessage}
              </div>
            ) : null}

            {state.successMessage ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {state.successMessage}
              </div>
            ) : null}

            <form action={canManageInventory ? formAction : undefined} className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
              <section className="space-y-5 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700">Поиск по товарам</span>
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Например: сыр, кетчуп или PRD-00017"
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700">Ответственный</span>
                    <select
                      name="responsibleEmployeeId"
                      value={selectedResponsibleId}
                      onChange={(event) => setSelectedResponsibleId(event.target.value)}
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                      required
                    >
                      <option value="">Выбери сотрудника</option>
                      {responsibleOptions.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} • {employee.role}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Комментарий к инвентаризации</span>
                  <textarea
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Например: вечерняя ревизия по соусам и молочной группе"
                    className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
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

                <div className="space-y-3">
                  {filteredProducts.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm text-zinc-500">
                      По этому фильтру товары не найдены.
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id);

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className={`grid w-full gap-4 rounded-[24px] border px-5 py-4 text-left transition lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center ${
                            isSelected
                              ? "border-emerald-300 bg-emerald-50/80"
                              : "border-zinc-200 bg-zinc-50/80 hover:border-zinc-300 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`mt-1 h-5 w-5 rounded-full border ${
                              isSelected ? "border-emerald-600 bg-emerald-600" : "border-zinc-300 bg-white"
                            }`}
                          />
                          <div className="space-y-1">
                            <div className="text-[1rem] font-semibold text-zinc-950">{product.name}</div>
                            <div className="text-sm text-zinc-500">
                              {product.category ?? "Без категории"}
                              {product.sku ? ` • ${product.sku}` : ""}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-zinc-600">
                            Остаток: {product.stockQuantity} {product.unit}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              <section className="space-y-5 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Итоговый лист
                  </p>
                  <h4 className="text-[1.25rem] font-semibold tracking-[-0.02em] text-zinc-950">
                    Что войдёт в инвентаризацию
                  </h4>
                  <p className="text-sm leading-6 text-zinc-600">
                    После создания лист зафиксирует текущие остатки выбранных товаров на момент открытия инвентаризации.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Товаров</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
                      {selectedProducts.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Ответственный</p>
                    <p className="mt-2 text-sm font-medium text-zinc-950">
                      {selectedResponsible ? `${selectedResponsible.name} • ${selectedResponsible.role}` : "Не выбран"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
                  {selectedProducts.length === 0 ? (
                    <p className="text-sm leading-6 text-zinc-500">
                      Пока лист пустой. Выбери товары слева, и они сразу появятся в итоговой ведомости.
                    </p>
                  ) : (
                    selectedProducts.map((product) => (
                      <div key={product.id} className="rounded-[20px] border border-zinc-200 bg-white px-4 py-3">
                        <input type="hidden" name="productId" value={product.id} />
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-950">{product.name}</p>
                            <p className="mt-1 text-sm text-zinc-500">
                              {product.category ?? "Без категории"}
                              {product.sku ? ` • ${product.sku}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                              Остаток сейчас
                            </p>
                            <p className="mt-1 text-sm font-semibold text-zinc-950">
                              {product.stockQuantity} {product.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!canManageInventory ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                    У твоей роли нет прав на создание инвентаризации.
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!canManageInventory || isPending || selectedProducts.length === 0 || !selectedResponsibleId}
                  className="w-full rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {isPending ? "Создаём лист..." : "Создать инвентаризацию"}
                </button>
              </section>
            </form>
          </div>
        </div>
      ) : null}

      {isHistoryDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm"
          onClick={() => setIsHistoryDialogOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Прошедшие инвентаризации"
            className="max-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-[#fcfbf8] p-6 shadow-2xl shadow-zinc-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Архив инвентаризаций
                </p>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">
                  Прошедшие инвентаризации
                </h3>
                <p className="text-sm leading-6 text-zinc-600">
                  Здесь лежат уже созданные листы: кто собирал инвентаризацию, когда и какие товары вошли в неё на момент создания.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryDialogOpen(false)}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Закрыть
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm leading-6 text-zinc-500">
                Пока нет ни одной созданной инвентаризации.
              </div>
            ) : (
              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const isActive = session.id === selectedSessionId;

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                          isActive
                            ? "border-zinc-950 bg-zinc-950 text-white shadow-sm shadow-zinc-950/15"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isActive ? "text-white/70" : "text-zinc-400"}`}>
                          Инвентаризация #{session.id}
                        </p>
                        <p className={`mt-2 text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>
                          {session.responsibleEmployeeName}
                        </p>
                        <p className={`mt-1 text-sm ${isActive ? "text-white/75" : "text-zinc-500"}`}>
                          {session.responsibleEmployeeRole} • {formatDateTime(session.createdAt)}
                        </p>
                        <p className={`mt-2 text-sm ${isActive ? "text-white/75" : "text-zinc-600"}`}>
                          Товаров в листе: {session.itemsCount}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
                  {selectedSession ? (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                          Лист инвентаризации #{selectedSession.id}
                        </p>
                        <h4 className="text-[1.3rem] font-semibold tracking-[-0.02em] text-zinc-950">
                          {selectedSession.responsibleEmployeeName}
                        </h4>
                        <p className="text-sm text-zinc-500">
                          {selectedSession.responsibleEmployeeRole} • {formatDateTime(selectedSession.createdAt)}
                        </p>
                        {selectedSession.notes ? (
                          <p className="text-sm leading-6 text-zinc-600">{selectedSession.notes}</p>
                        ) : null}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Позиций</p>
                          <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{selectedSession.itemsCount}</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Категорий</p>
                          <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{selectedSession.categories.length}</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Снимок остатков</p>
                          <p className="mt-2 text-sm font-medium text-zinc-950">Зафиксирован при создании</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {selectedSession.items.map((item) => (
                          <div key={item.id} className="rounded-[22px] border border-zinc-200 bg-zinc-50/80 px-4 py-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-zinc-950">{item.productName}</p>
                                <p className="mt-1 text-sm text-zinc-500">
                                  {item.productCategory ?? "Без категории"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                  Остаток на момент создания
                                </p>
                                <p className="mt-1 text-sm font-semibold text-zinc-950">
                                  {item.stockQuantity} {item.productUnit}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
