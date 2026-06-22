/* eslint-disable max-lines */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import type { OrderCreateOptions } from "@/modules/orders/orders.page-model";
import { OrderCreateButton } from "@/modules/orders/components/order-create-button";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import { formatOrderMoney } from "@/modules/orders/components/order-display";
import type { DispatcherWorkspace, OrderListItem } from "@/modules/orders/orders.types";
import { ORDER_SOURCE_LABELS } from "@/modules/orders/orders.types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, getOrderAdvanceAction } from "@/modules/orders/orders.workflow";
import { browserBackendJson } from "@/shared/api/browser-backend";

type DispatcherOrderGroup = "new" | "inProgress" | "completed";

const GROUPS: Array<{ key: DispatcherOrderGroup; label: string; empty: string }> = [
  { key: "new", label: "Новые", empty: "Новых заказов нет" },
  { key: "inProgress", label: "В работе", empty: "Заказов в работе нет" },
  { key: "completed", label: "Выполненные", empty: "Выполненных заказов пока нет" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
}

function minutesSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
}

function getOrderItemsSummary(order: OrderListItem) {
  return order.items
    .slice(0, 4)
    .map((item) => `${item.itemName} x${item.quantity}`)
    .join(", ") || "Позиции не добавлены";
}

export function SimpleDispatcherOrders({
  initialWorkspace,
  orderOptions,
}: {
  initialWorkspace: DispatcherWorkspace;
  orderOptions: OrderCreateOptions;
}) {
  const { user } = useEmployeeSession();
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [activeGroup, setActiveGroup] = useState<DispatcherOrderGroup>("new");
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  const reloadWorkspace = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    inFlightRef.current = true;

    try {
      const nextWorkspace = await browserBackendJson<DispatcherWorkspace>("/api/v1/dispatcher/workspace", {
        method: "GET",
        signal: controller.signal,
      });
      setWorkspace(nextWorkspace);
      setUpdatedAt(new Date());
      setErrorMessage(null);
    } catch (error) {
      if (!controller.signal.aborted) {
        setErrorMessage(error instanceof Error ? error.message : "Не удалось обновить диспетчерскую");
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void reloadWorkspace();
      }
    }, 10_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void reloadWorkspace();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      abortRef.current?.abort();
    };
  }, [reloadWorkspace]);

  const activeOrders = workspace.orderGroups[activeGroup];
  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return activeOrders;
    }

    return activeOrders.filter((order) =>
      [
        String(order.id),
        order.clientName,
        order.customerPhoneSnapshot ?? "",
        order.deliveryAddressSnapshot ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [activeOrders, query]);

  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800/70">FoodLike</p>
            <h1 className="mt-1 text-3xl font-black text-zinc-950">Диспетчерская</h1>
            <p className="mt-2 text-sm font-semibold capitalize text-zinc-500">
              Сегодня: {formatDate(workspace.clock.businessDate)}
            </p>
          </div>
          <div className="rounded-[18px] border border-red-100 bg-red-50/70 px-4 py-3 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-800/70">Сахалинское время</p>
            <p className="mt-1 text-2xl font-black text-zinc-950">{formatTime(workspace.clock.serverNow)}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-500">Обновлено {formatTime(updatedAt.toISOString())}</p>
          </div>
        </div>
      </div>

      <ShiftCard workspace={workspace} onUpdated={reloadWorkspace} />

      {errorMessage ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-[22px] border border-red-950/10 bg-white/86 p-4 shadow-sm shadow-red-950/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск: номер, телефон, клиент"
            className="h-12 min-w-0 flex-1 rounded-full border border-red-950/10 bg-white px-4 text-base font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-4 focus:ring-red-800/10"
          />
          {workspace.capabilities.canCreateOrder && user ? (
            <OrderCreateButton
              user={user}
              clients={orderOptions.clients}
              employees={orderOptions.employees}
              catalogItems={orderOptions.catalogItems}
              onSuccess={reloadWorkspace}
              triggerLabel="+ Создать заказ"
              triggerClassName="inline-flex h-12 items-center justify-center rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900"
            />
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-12 items-center justify-center rounded-full border border-red-100 bg-red-50 px-5 text-sm font-black text-red-800 opacity-70"
            >
              + Создать заказ
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {GROUPS.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setActiveGroup(group.key)}
              className={[
                "inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold transition",
                activeGroup === group.key
                  ? "border-red-800 bg-red-800 text-white"
                  : "border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-50",
              ].join(" ")}
            >
              {group.label}
              <span className="ml-2 rounded-full bg-current/10 px-2 py-0.5 text-xs">
                {workspace.counts[group.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-red-200 bg-white/70 px-4 py-14 text-center">
          <p className="text-lg font-semibold text-zinc-950">
            {GROUPS.find((group) => group.key === activeGroup)?.empty}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {filteredOrders.map((order) => (
            <DispatcherOrderCard
              key={order.id}
              order={order}
              canCancel={workspace.capabilities.canCancelOrder}
              onUpdated={reloadWorkspace}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShiftCard({
  workspace,
  onUpdated,
}: {
  workspace: DispatcherWorkspace;
  onUpdated: () => void;
}) {
  const shift = workspace.shift;
  const [dialog, setDialog] = useState<"open" | "close" | null>(null);
  const isOpen = shift.state === "OPEN";
  const title = shift.state === "PREVIOUS_SHIFT_OPEN"
    ? "Предыдущая смена не закрыта"
    : isOpen
      ? `Смена ${shift.displayNumber}`
      : shift.state === "CLOSED"
        ? "Смена закрыта"
        : "Смена не открыта";
  const hint = shift.state === "NOT_OPEN"
    ? `Открытие доступно не ранее ${formatTime(shift.openAvailableAt)}`
    : shift.state === "OPEN"
      ? `Открыта в ${formatTime(shift.openedAt)}`
      : shift.state === "PREVIOUS_SHIFT_OPEN"
        ? "Новые заказы заблокированы до закрытия прошлой смены"
        : "Приём заказов на сегодня завершён";

  return (
    <section className="rounded-[24px] border border-red-950/10 bg-white p-4 shadow-[0_16px_50px_rgba(111,18,25,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800/70">Смена</p>
          <h2 className="mt-1 text-2xl font-black text-zinc-950">{title}</h2>
          <p className="mt-2 text-sm font-semibold text-zinc-500">{hint}</p>
          {shift.responsibleName ? (
            <p className="mt-2 text-sm font-semibold text-zinc-700">Ответственный: {shift.responsibleName}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!workspace.capabilities.canOpenShift}
            onClick={() => setDialog("open")}
            className="inline-flex h-11 items-center rounded-full bg-red-800 px-5 text-sm font-black text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Открыть смену
          </button>
          <button
            type="button"
            disabled={!workspace.capabilities.canCloseShift}
            onClick={() => setDialog("close")}
            className="inline-flex h-11 items-center rounded-full border border-red-100 bg-white px-5 text-sm font-black text-red-800 transition hover:border-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Закрыть смену
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ShiftMetric label="Чеков" value={shift.checksCount} />
        <ShiftMetric label="Выручка" value={formatOrderMoney(shift.revenueCents)} />
        <ShiftMetric label="Отменено" value={shift.cancelledOrdersCount} />
        <ShiftMetric label="Активных" value={shift.activeOrdersCount} />
      </div>
      {shift.activeOrdersCount > 0 && isOpen ? (
        <p className="mt-3 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Завершите {shift.activeOrdersCount} активных заказа перед закрытием смены.
        </p>
      ) : null}
      {dialog ? (
        <ShiftDialog
          kind={dialog}
          workspace={workspace}
          onClose={() => setDialog(null)}
          onUpdated={() => {
            setDialog(null);
            onUpdated();
          }}
        />
      ) : null}
    </section>
  );
}

function ShiftMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-red-100 bg-red-50/50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-800/70">{label}</p>
      <p className="mt-2 text-xl font-black text-zinc-950">{value}</p>
    </div>
  );
}

function ShiftDialog({
  kind,
  workspace,
  onClose,
  onUpdated,
}: {
  kind: "open" | "close";
  workspace: DispatcherWorkspace;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { user } = useEmployeeSession();
  const [name, setName] = useState(user?.displayName ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const shift = workspace.shift;
  const isClose = kind === "close";

  const submit = () => {
    if (name.trim().length < 2) {
      setErrorMessage(isClose ? "Укажите, кто закрывает смену" : "Укажите ответственного");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (isClose && shift.id) {
          await browserBackendJson(`/api/v1/dispatcher-shifts/${shift.id}/close`, {
            body: { closedByName: name.trim() },
          });
        } else {
          await browserBackendJson("/api/v1/dispatcher-shifts/open", {
            body: { responsibleName: name.trim() },
          });
        }
        onUpdated();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Не удалось выполнить действие");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[26px] border border-red-100 bg-white p-5 shadow-2xl shadow-red-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800/70">
              {isClose ? "Закрытие смены" : "Открытие смены"}
            </p>
            <h3 className="mt-1 text-2xl font-black text-zinc-950">
              {isClose ? `Смена ${shift.displayNumber}` : "Новая смена"}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-red-100 px-3 py-1 text-sm font-black text-red-800">
            Закрыть
          </button>
        </div>
        <div className="mt-4 grid gap-3 rounded-[18px] border border-red-100 bg-red-50/50 p-4 text-sm font-semibold text-zinc-700">
          <p>Дата: {formatDate(workspace.clock.businessDate)}</p>
          <p>Сахалинское время: {formatTime(workspace.clock.serverNow)}</p>
          {isClose ? <p>Активных заказов: {shift.activeOrdersCount}</p> : null}
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-black text-zinc-800">
            {isClose ? "Кто закрывает смену" : "Ответственный"}
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-12 w-full rounded-[16px] border border-red-100 px-4 text-base font-semibold outline-none focus:border-red-300 focus:ring-4 focus:ring-red-800/10"
          />
        </label>
        {errorMessage ? (
          <p className="mt-3 rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            {errorMessage}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-11 rounded-full border border-red-100 px-5 text-sm font-black text-red-800">
            Отмена
          </button>
          <button
            type="button"
            disabled={isPending || (isClose && shift.activeOrdersCount > 0)}
            onClick={submit}
            className="h-11 rounded-full bg-red-800 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isPending ? "Сохраняем..." : isClose ? "Закрыть смену" : "Открыть смену"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DispatcherOrderCard({
  order,
  canCancel,
  onUpdated,
}: {
  order: OrderListItem;
  canCancel: boolean;
  onUpdated: () => void;
}) {
  const advanceAction = getOrderAdvanceAction(order.status, "Диспетчер");

  return (
    <article className={[
      "rounded-[22px] border bg-white p-4 shadow-[0_12px_36px_rgba(111,18,25,0.07)]",
      order.status === "CANCELLED" ? "border-red-200 bg-red-50/50" : "border-red-100",
    ].join(" ")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black text-zinc-950">#{order.id}</h2>
            <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-black ${ORDER_STATUS_STYLES[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-500">
            {formatTime(order.createdAt)} · {minutesSince(order.createdAt)} мин назад · {ORDER_SOURCE_LABELS[order.source]}
          </p>
        </div>
        <p className="text-xl font-black text-red-800">{formatOrderMoney(order.totalCents)}</p>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <Fact label="Клиент" value={order.clientName} />
        <Fact label="Телефон" value={order.customerPhoneSnapshot ?? "Не указан"} />
        <Fact label="Получение" value={order.deliveryAddressSnapshot ?? "Самовывоз"} />
        <Fact label="Позиции" value={getOrderItemsSummary(order)} />
        {order.customerComment ? <Fact label="Комментарий" value={order.customerComment} /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-red-100 pt-4">
        {advanceAction ? (
          <OrderStatusButton orderId={order.id} status={advanceAction.status} label={advanceAction.label} onSuccess={onUpdated} />
        ) : null}
        {canCancel && order.status !== "CANCELLED" && order.status !== "DELIVERED_PAID" ? (
          <OrderStatusButton
            orderId={order.id}
            status="CANCELLED"
            label="Отменить"
            onSuccess={onUpdated}
            className="inline-flex h-10 items-center rounded-full border border-red-200 bg-white px-4 text-sm font-bold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        ) : null}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-red-50 bg-red-50/40 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-zinc-700">{value}</p>
    </div>
  );
}
