import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { USER_ROLE_LABELS } from "@/modules/auth/auth.types";
import {
  getDashboardMetrics,
  getEmployeeDashboardMetricsByEmail,
} from "@/modules/dashboard/dashboard.service";

export default async function DashboardPage(props: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const user = await requirePermission("view_dashboard");
  const searchParams = await props.searchParams;
  const selectedMonth = searchParams?.month?.trim() ?? "";
  const dashboard = await getDashboardMetrics();
  const isStaffRole =
    user.role === "Повар" || user.role === "Курьер" || user.role === "Диспетчер";
  const employeeDashboard = isStaffRole
    ? await getEmployeeDashboardMetricsByEmail(user.email, selectedMonth)
    : null;

  const activeMonthDate =
    employeeDashboard && /^\d{4}-\d{2}$/.test(employeeDashboard.monthKey)
      ? new Date(
          Number(employeeDashboard.monthKey.slice(0, 4)),
          Number(employeeDashboard.monthKey.slice(5, 7)) - 1,
          1,
        )
      : new Date();
  const previousMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() - 1, 1);
  const nextMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 1);
  const formatMonthKey = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  const monthNavigation = employeeDashboard
    ? {
        previousHref: `/dashboard?month=${formatMonthKey(previousMonth)}`,
        nextHref: `/dashboard?month=${formatMonthKey(nextMonth)}`,
      }
    : null;

  const moduleCards = [
    {
      href: "/dashboard/orders",
      label: "Заказы",
      value: dashboard.entityCounts.orders,
      description: "Список заказов",
      visible: hasPermission(user, "view_orders"),
    },
    {
      href: "/dashboard/clients",
      label: "Клиенты",
      value: dashboard.entityCounts.clients,
      description: "Список и создание",
      visible: hasPermission(user, "view_clients"),
    },
    {
      href: "/dashboard/inventory",
      label: "Склад",
      value: dashboard.entityCounts.products,
      description: "Товары и остатки",
      visible: hasPermission(user, "view_inventory"),
    },
    {
      href: "/dashboard/employees",
      label: "Сотрудники",
      value: dashboard.entityCounts.employees,
      description: "Профили",
      visible: hasPermission(user, "view_employees"),
    },
    {
      href: "/dashboard/profile",
      label: "Мой профиль",
      value: USER_ROLE_LABELS[user.role],
      description: "Аккаунт и роль в системе",
      visible: true,
    },
  ];

  const visibleStatistics = [
    hasPermission(user, "view_orders")
      ? {
          label: "Всего заказов",
          value: new Intl.NumberFormat("ru-RU").format(dashboard.entityCounts.orders),
          hint: "Все заказы, доступные для просмотра",
        }
      : null,
    hasPermission(user, "view_clients")
      ? {
          label: "Клиентская база",
          value: new Intl.NumberFormat("ru-RU").format(dashboard.entityCounts.clients),
          hint: "Клиенты и организации в базе",
        }
      : null,
    hasPermission(user, "view_inventory")
      ? {
          label: "Складские позиции",
          value: new Intl.NumberFormat("ru-RU").format(dashboard.entityCounts.products),
          hint: "Товары, доступные для продажи",
        }
      : null,
    hasPermission(user, "view_employees")
      ? {
          label: "Команда",
          value: new Intl.NumberFormat("ru-RU").format(dashboard.entityCounts.employees),
          hint: "Сотрудники с заведёнными профилями",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <PageShell
      title="Dashboard CRM"
      description={`Ты вошёл как ${user.email}. Текущая роль: ${USER_ROLE_LABELS[user.role]}. Доступные разделы показаны ниже.`}
      backHref="/"
      action={<SessionUserActions user={user} />}
    >
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {moduleCards.filter((card) => card.visible).map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-3xl border border-zinc-200 bg-white/90 p-6 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-zinc-950 px-3 py-1 text-sm font-semibold text-white">
                {card.value}
              </span>
            </div>
            <p className="mt-4 text-xl font-semibold text-zinc-950">{card.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                Статистика
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                Состояние базы CRM
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {visibleStatistics.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-zinc-600">{item.label}</p>
                  <p className="text-2xl font-semibold text-zinc-950">{item.value}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{item.hint}</p>
              </div>
            ))}
          </div>
        </article>

        {hasPermission(user, "view_orders") && !isStaffRole ? (
          <article className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f4efe6_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Продажи
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                  Выручка и динамика заказов
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {dashboard.sales.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm shadow-zinc-950/5"
                >
                  <p className="text-sm font-medium text-zinc-500">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.hint}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {isStaffRole ? (
          <article className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ea_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Мой месяц
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                  График и начисления
                </h2>
              </div>
              {monthNavigation ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={monthNavigation.previousHref}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/85 text-lg text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                    aria-label="Предыдущий месяц"
                  >
                    ←
                  </Link>
                  <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold capitalize text-zinc-900 shadow-sm shadow-zinc-950/5">
                    {employeeDashboard?.monthLabel ?? "Текущий месяц"}
                  </div>
                  <Link
                    href={monthNavigation.nextHref}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/85 text-lg text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                    aria-label="Следующий месяц"
                  >
                    →
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm shadow-zinc-950/5 sm:col-span-2">
                <p className="text-sm font-medium text-zinc-500">График</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">
                  {employeeDashboard?.scheduleSummary ?? "График не задан"}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {employeeDashboard?.scheduleDays
                    ? `В текущем графике отмечено ${employeeDashboard.scheduleDays} рабочих дн. и ${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(employeeDashboard.scheduleHours)} ч`
                    : "У сотрудника пока не заполнен рабочий график."}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm shadow-zinc-950/5">
                <p className="text-sm font-medium text-zinc-500">Авансы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.advancesCents ?? 0) / 100)}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm shadow-zinc-950/5">
                <p className="text-sm font-medium text-zinc-500">Штрафы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.finesCents ?? 0) / 100)}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm shadow-zinc-950/5 sm:col-span-2">
                <p className="text-sm font-medium text-zinc-500">Долги за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.debtCents ?? 0) / 100)}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Здесь показываются только записи текущего месяца по сотруднику.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm shadow-zinc-950/5 sm:col-span-2">
                <p className="text-sm font-medium text-zinc-500">Зарплата на текущий день</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.salaryTodayCents ?? 0) / 100)}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Логику расчёта добавим позже. Пока здесь выводится безопасная базовая заглушка.
                </p>
              </div>
            </div>
          </article>
        ) : null}
      </section>
    </PageShell>
  );
}
