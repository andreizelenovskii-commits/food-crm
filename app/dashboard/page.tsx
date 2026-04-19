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
      href: "/dashboard/catalog",
      label: "Каталог",
      value: "Site",
      description: "Прайс и позиции сайта",
      visible: hasPermission(user, "view_catalog"),
    },
    {
      href: "/dashboard/website",
      label: "Наш сайт",
      value: "Web",
      description: "Ссылка и быстрый переход",
      visible: true,
    },
    {
      href: "/dashboard/reviews",
      label: "Отзывы",
      value: "New",
      description: "Оценки и комментарии",
      visible: true,
    },
    {
      href: "/dashboard/loyalty",
      label: "Система лояльности",
      value: "CRM",
      description: "Баллы, скидки, уровни",
      visible: true,
    },
    {
      href: "/dashboard/settings",
      label: "Настройки",
      value: "Core",
      description: "ОФД, кассы, интеграции",
      visible: hasPermission(user, "view_settings"),
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
      title="Главное меню"
      description={`Ты вошёл как ${user.email}. Текущая роль: ${USER_ROLE_LABELS[user.role]}. Доступные разделы показаны ниже.`}
      backHref="/"
      action={<SessionUserActions user={user} />}
    >
      <section className="mb-5 rounded-[32px] border border-emerald-100 bg-[linear-gradient(180deg,#f6fff7_0%,#edf8ef_100%)] p-4 shadow-sm shadow-emerald-950/5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700/80">
              Модули CRM
            </p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950">
              Быстрый доступ к рабочим разделам
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {moduleCards.filter((card) => card.visible).map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[26px] border border-emerald-100 bg-white p-4 text-left shadow-sm shadow-emerald-950/5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md hover:shadow-emerald-950/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-emerald-700">{card.label}</p>
              <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                {card.value}
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold leading-6 text-zinc-950">{card.description}</p>
          </Link>
        ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf5_100%)] p-5 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700/80">
                Статистика
              </p>
              <h2 className="mt-1.5 text-xl font-semibold text-zinc-950">
                Состояние базы CRM
              </h2>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {visibleStatistics.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-emerald-100 bg-white/90 p-3.5 shadow-sm shadow-emerald-950/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-zinc-600">{item.label}</p>
                  <p className="text-xl font-semibold text-zinc-950">{item.value}</p>
                </div>
                <p className="mt-1.5 text-sm leading-5 text-zinc-500">{item.hint}</p>
              </div>
            ))}
          </div>
        </article>

        {hasPermission(user, "view_orders") && !isStaffRole ? (
          <article className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f8fff8_0%,#edf8ef_100%)] p-5 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700/80">
                  Продажи
                </p>
                <h2 className="mt-1.5 text-xl font-semibold text-zinc-950">
                  Выручка и динамика заказов
                </h2>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {dashboard.sales.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-950/5"
                >
                  <p className="text-sm font-medium text-zinc-500">{item.label}</p>
                  <p className="mt-2.5 text-xl font-semibold text-zinc-950">{item.value}</p>
                  <p className="mt-1.5 text-sm leading-5 text-zinc-600">{item.hint}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {isStaffRole ? (
          <article className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fff7_0%,#edf8ef_100%)] p-5 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700/80">
                  Мой месяц
                </p>
                <h2 className="mt-1.5 text-xl font-semibold text-zinc-950">
                  График и начисления
                </h2>
              </div>
              {monthNavigation ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={monthNavigation.previousHref}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white/90 text-lg text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-900"
                    aria-label="Предыдущий месяц"
                  >
                    ←
                  </Link>
                  <div className="rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-sm font-semibold capitalize text-zinc-900 shadow-sm shadow-emerald-950/5">
                    {employeeDashboard?.monthLabel ?? "Текущий месяц"}
                  </div>
                  <Link
                    href={monthNavigation.nextHref}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white/90 text-lg text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-900"
                    aria-label="Следующий месяц"
                  >
                    →
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-950/5 sm:col-span-2">
                <p className="text-sm font-medium text-zinc-500">График</p>
                <p className="mt-2.5 text-xl font-semibold text-zinc-950">
                  {employeeDashboard?.scheduleSummary ?? "График не задан"}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-zinc-600">
                  {employeeDashboard?.scheduleDays
                    ? `В текущем графике отмечено ${employeeDashboard.scheduleDays} рабочих дн. и ${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(employeeDashboard.scheduleHours)} ч`
                    : "У сотрудника пока не заполнен рабочий график."}
                </p>
              </div>

              <div className="rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-950/5">
                <p className="text-sm font-medium text-zinc-500">Авансы за месяц</p>
                <p className="mt-2.5 text-xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.advancesCents ?? 0) / 100)}
                </p>
              </div>

              <div className="rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-950/5">
                <p className="text-sm font-medium text-zinc-500">Штрафы за месяц</p>
                <p className="mt-2.5 text-xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.finesCents ?? 0) / 100)}
                </p>
              </div>

              <div className="rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-950/5 sm:col-span-2">
                <p className="text-sm font-medium text-zinc-500">Долги за месяц</p>
                <p className="mt-2.5 text-xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.debtCents ?? 0) / 100)}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-zinc-600">
                  Здесь показываются только записи текущего месяца по сотруднику.
                </p>
              </div>

              <div className="rounded-[24px] border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-950/5 sm:col-span-2">
                <p className="text-sm font-medium text-zinc-500">Зарплата на текущий день</p>
                <p className="mt-2.5 text-xl font-semibold text-zinc-950">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((employeeDashboard?.salaryTodayCents ?? 0) / 100)}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-zinc-600">
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
