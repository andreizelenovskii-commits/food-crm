import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { fetchOrderCreateOptions, fetchOrders } from "@/modules/orders/orders.service";
import { OrderCreateButton } from "@/modules/orders/components/order-create-button";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import type { OrderListItem, OrderStatus } from "@/modules/orders/orders.types";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Новый",
  PROCESSING: "В работе",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

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
  canManageOrders,
}: {
  order: OrderListItem;
  canManageOrders: boolean;
}) {
  const isFinished = order.status === "COMPLETED" || order.status === "CANCELLED";

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

        {canManageOrders ? (
          <div className="flex flex-wrap gap-2">
            {!isFinished ? (
              <OrderStatusButton orderId={order.id} status="COMPLETED" label="Завершить" />
            ) : (
              <OrderStatusButton orderId={order.id} status="PROCESSING" label="Вернуть в работу" />
            )}

            {order.status !== "CANCELLED" ? (
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
  canManageOrders,
}: {
  title: string;
  description: string;
  orders: OrderListItem[];
  canManageOrders: boolean;
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
          orders.map((order) => (
            <OrderCard key={order.id} order={order} canManageOrders={canManageOrders} />
          ))
        )}
      </div>
    </section>
  );
}

export default async function OrdersPage() {
  const user = await requirePermission("view_orders");
  const canManageOrders = hasPermission(user, "manage_orders");
  const [orders, orderCreateOptions] = await Promise.all([
    fetchOrders(),
    canManageOrders
      ? fetchOrderCreateOptions()
      : Promise.resolve({ clients: [], employees: [], catalogItems: [] }),
  ]);
  const openOrders = orders.filter(
    (order) => !order.isInternal && (order.status === "PENDING" || order.status === "PROCESSING"),
  );
  const completedOrders = orders.filter(
    (order) => !order.isInternal && (order.status === "COMPLETED" || order.status === "CANCELLED"),
  );
  const internalOrders = orders.filter((order) => order.isInternal);
  const totalRevenueCents = orders.reduce((sum, order) => sum + order.totalCents, 0);

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
            <p className="text-sm font-medium text-zinc-500">Открытые</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{openOrders.length}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Завершённые</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{completedOrders.length}</p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Сумма заказов</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{formatMoney(totalRevenueCents)}</p>
          </article>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef4eb_100%)] p-6 shadow-sm shadow-zinc-950/5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Доска заказов</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Открытые, завершённые и внутренние
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            Обычные заказы разделены по статусу, а внутренние живут отдельно. Так проще видеть текущую работу и не смешивать её с внутренними задачами кухни или команды.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <OrderColumn
            title="Открытые заказы"
            description="Новые и активные заказы, которые ещё в работе."
            orders={openOrders}
            canManageOrders={canManageOrders}
          />
          <OrderColumn
            title="Завершённые заказы"
            description="Уже закрытые или отменённые заказы."
            orders={completedOrders}
            canManageOrders={canManageOrders}
          />
          <OrderColumn
            title="Внутренние заказы"
            description="Служебные или внутренние задачи, которые не должны смешиваться с клиентскими."
            orders={internalOrders}
            canManageOrders={canManageOrders}
          />
        </div>
      </div>

      {canManageOrders ? (
        <OrderCreateButton
          clients={orderCreateOptions.clients}
          employees={orderCreateOptions.employees}
          catalogItems={orderCreateOptions.catalogItems}
        />
      ) : null}
    </PageShell>
  );
}
