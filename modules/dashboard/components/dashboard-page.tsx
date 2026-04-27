import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { USER_ROLE_LABELS } from "@/modules/auth/auth.types";
import {
  buildDashboardPageViewModel,
  type DashboardPageProps,
} from "@/modules/dashboard/dashboard.page-model";

export function DashboardPage({
  user,
  dashboard,
  employeeDashboard,
}: DashboardPageProps) {
  const {
    isStaffRole,
    monthNavigation,
    showSalesSection,
    visibleModuleCards,
    visibleStatistics,
  } = buildDashboardPageViewModel({
    user,
    dashboard,
    employeeDashboard,
  });

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
          {visibleModuleCards.map((card) => (
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

        {showSalesSection ? (
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
