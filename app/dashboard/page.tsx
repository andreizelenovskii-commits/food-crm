import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { logoutAction } from "@/modules/auth/auth.actions";
import { requireSessionUser } from "@/modules/auth/auth.session";
import { getDashboardMetrics } from "@/modules/dashboard/dashboard.service";

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const metrics = await getDashboardMetrics();

  return (
    <PageShell
      title="Dashboard CRM"
      description={`Ты вошёл как ${user.email}. Здесь видно основные метрики и переходы к клиентам, заказам и сотрудникам.`}
      action={
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Выйти
          </button>
        </form>
      }
    >
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/clients"
          className="rounded-3xl border border-zinc-200 bg-white/90 p-6 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <p className="text-sm font-medium text-zinc-500">Клиенты</p>
          <p className="mt-4 text-xl font-semibold text-zinc-950">Список и создание</p>
        </Link>
        <Link
          href="/dashboard/orders"
          className="rounded-3xl border border-zinc-200 bg-white/90 p-6 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <p className="text-sm font-medium text-zinc-500">Заказы</p>
          <p className="mt-4 text-xl font-semibold text-zinc-950">Просмотр и статус</p>
        </Link>
        <Link
          href="/dashboard/employees"
          className="rounded-3xl border border-zinc-200 bg-white/90 p-6 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <p className="text-sm font-medium text-zinc-500">Сотрудники</p>
          <p className="mt-4 text-xl font-semibold text-zinc-950">Профили</p>
        </Link>
        <Link
          href="/dashboard/products"
          className="rounded-3xl border border-zinc-200 bg-white/90 p-6 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          <p className="text-sm font-medium text-zinc-500">Товары</p>
          <p className="mt-4 text-xl font-semibold text-zinc-950">База товаров</p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>
    </PageShell>
  );
}
