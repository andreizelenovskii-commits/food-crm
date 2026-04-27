import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { OrderCreateButton } from "@/modules/orders/components/order-create-button";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import { buildOrdersPageViewModel, type OrderCreateOptions } from "@/modules/orders/orders.page-model";
import type { OrderListItem } from "@/modules/orders/orders.types";
import {
  canCancelOrder,
  getOrderAdvanceAction,
  getOrderStageOwner,
  isOrderClosed,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/modules/orders/orders.workflow";
import type { SessionUser } from "@/modules/auth/auth.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function OrderCard({
  order,
  user,
}: {
  order: OrderListItem;
  user: SessionUser;
}) {
  const isFinished = isOrderClosed(order.status);
  const advanceAction = getOrderAdvanceAction(order.status, user.role);
  const stageOwner = getOrderStageOwner(order.status);
  const canShowCancel = canCancelOrder(order.status, user.role);

  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-zinc-950">Заказ #{order.id}</h3>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[order.status]}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          {order.isInternal ? (
            <span className="inline-flex rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
              Внутренний
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 text-sm text-zinc-600">
          <p>
            Клиент:{" "}
            <Link
              href={`/dashboard/clients/${order.clientId}`}
              className="font-medium text-zinc-900 underline-offset-2 hover:underline"
            >
              {order.clientName}
            </Link>
          </p>
          <p>Тип клиента: {order.clientType === "ORGANIZATION" ? "Организация" : "Клиент"}</p>
          <p>Исполнитель: {order.employeeName}</p>
          <p>
            Ответственный этап:{" "}
            <span className="font-medium text-zinc-900">
              {stageOwner ?? (order.status === "CANCELLED" ? "Работа остановлена" : "Заказ закрыт")}
            </span>
          </p>
          <p>Создан: {formatDate(order.createdAt)}</p>
        </div>

        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Сумма</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{formatMoney(order.totalCents)}</p>
          {order.discountPercent > 0 ? (
            <p className="mt-1 text-xs text-emerald-700">
              скидка {order.discountPercent}% от {formatMoney(order.subtotalCents)}
            </p>
          ) : null}
        </div>

        {!isFinished ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            {advanceAction ? (
              <span>
                Следующий шаг:{" "}
                <span className="font-medium text-zinc-950">{advanceAction.label}</span>
              </span>
            ) : (
              <span>
                Сейчас заказ ждёт действие роли{" "}
                <span className="font-medium text-zinc-950">
                  {stageOwner ?? "ответственный сотрудник"}
                </span>
                .
              </span>
            )}
          </div>
        ) : null}

        {advanceAction || canShowCancel ? (
          <div className="flex flex-wrap gap-2">
            {advanceAction ? (
              <OrderStatusButton
                orderId={order.id}
                status={advanceAction.status}
                label={advanceAction.label}
              />
            ) : null}

            {canShowCancel ? (
              <OrderStatusButton
                orderId={order.id}
                status="CANCELLED"
                label="Отменить"
                className="rounded-2xl border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function OrderColumn({
  title,
  description,
  orders,
  user,
}: {
  title: string;
  description: string;
  orders: OrderListItem[];
  user: SessionUser;
}) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm shadow-zinc-950/5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
          <p className="text-sm leading-6 text-zinc-600">{description}</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
          {orders.length}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
            Пока пусто.
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} user={user} />)
        )}
      </div>
    </section>
  );
}

type OrdersPageProps = {
  user: SessionUser;
  canCreate: boolean;
  orders: OrderListItem[];
  orderCreateOptions: OrderCreateOptions;
};

export function OrdersPage({
  user,
  canCreate,
  orders,
  orderCreateOptions,
}: OrdersPageProps) {
  const {
    activeOrders,
    completedOrders,
    internalOrders,
    totalRevenueCents,
    deliveredOrdersCount,
  } = buildOrdersPageViewModel(orders);

  return (
    <PageShell
      title="Заказы"
      description="Здесь живёт доска заказов: открытые, завершённые и внутренние."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="space-y-6 pb-24">
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Всего заказов</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{orders.length}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">В работе</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{activeOrders.length}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Доставлены и оплачены</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{deliveredOrdersCount}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Сумма заказов</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{formatMoney(totalRevenueCents)}</p>
          </article>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef4eb_100%)] p-6 shadow-sm shadow-zinc-950/5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Доска заказов</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Поэтапный поток заказов
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            Заказ больше нельзя перепрыгнуть из создания сразу в завершение. После оформления он уходит на кухню, затем проходит этапы повара, диспетчера и курьера. В карточке всегда видно, кто сейчас отвечает за следующий шаг.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <OrderColumn
            title="Активные заказы"
            description="Заказы, которые ещё проходят обязательные этапы кухни, сборки и доставки."
            orders={activeOrders}
            user={user}
          />
          <OrderColumn
            title="Закрытые заказы"
            description="Доставленные и оплаченные, а также отменённые заказы."
            orders={completedOrders}
            user={user}
          />
          <OrderColumn
            title="Внутренние заказы"
            description="Служебные заказы отделены от клиентских, но используют ту же дисциплину по этапам."
            orders={internalOrders}
            user={user}
          />
        </div>
      </div>

      {canCreate ? (
        <OrderCreateButton
          user={user}
          clients={orderCreateOptions.clients}
          employees={orderCreateOptions.employees}
          catalogItems={orderCreateOptions.catalogItems}
        />
      ) : null}
    </PageShell>
  );
}
