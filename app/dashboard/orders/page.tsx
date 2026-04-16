import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { fetchOrders } from "@/modules/orders/orders.service";
import type { OrderStatus } from "@/modules/orders/orders.types";

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

export default async function OrdersPage() {
  const user = await requirePermission("view_orders");
  const orders = await fetchOrders();
  const totalRevenueCents = orders.reduce((sum, order) => sum + order.totalCents, 0);
  const completedOrders = orders.filter((order) => order.status === "COMPLETED").length;

  return (
    <PageShell
      title="Заказы"
      description="Раздел заказов доступен для просмотра. Изменения в заказах доступны только управляющему."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Всего заказов</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{orders.length}</p>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Завершённых</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{completedOrders}</p>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium text-zinc-500">Сумма заказов</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">{formatMoney(totalRevenueCents)}</p>
          </article>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Список заказов</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {hasPermission(user, "manage_orders")
                  ? "Ты видишь все заказы и можешь дальше расширять управление этим разделом."
                  : "Для твоей роли раздел доступен только на просмотр."}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <p className="text-sm text-zinc-600">Заказов пока нет.</p>
            ) : (
              orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-zinc-950">Заказ #{order.id}</h3>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[order.status]}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>

                      <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
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
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm shadow-zinc-950/5">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Сумма</p>
                      <p className="mt-2 text-2xl font-semibold text-zinc-950">
                        {formatMoney(order.totalCents)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
