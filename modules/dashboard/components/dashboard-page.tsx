import Link from "next/link";
import { CrmEnvironmentLinks } from "@/components/ui/crm-environment-links";
import { PageShell } from "@/components/ui/page-shell";
import { PUBLIC_SITE_URL } from "@/shared/deploy-public-urls";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { BirthdayCarousel } from "@/modules/dashboard/components/birthday-carousel";
import { ModuleCarousel } from "@/modules/dashboard/components/module-carousel";
import {
  buildDashboardPageViewModel,
  type DashboardPageProps,
} from "@/modules/dashboard/dashboard.page-model";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[22px] border border-white/70 bg-white/72 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl ${className}`.trim()}
    >
      {children}
    </section>
  );
}

function KpiTile({
  href,
  label,
  value,
  hint,
}: {
  href?: string;
  label: string;
  value: string | number;
  hint: string;
}) {
  const className = [
    "group block rounded-[18px] border border-red-950/10 bg-white/78 p-4 text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition",
    href
      ? "hover:-translate-y-1 hover:border-red-900/10 hover:bg-red-800 hover:text-white hover:shadow-red-950/15 focus-visible:bg-red-800 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-red-800/20"
      : "",
  ].join(" ");
  const content = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70 transition group-hover:text-red-50/80 group-focus-visible:text-red-50/80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500 transition group-hover:text-red-50/78 group-focus-visible:text-red-50/78">
        {hint}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}

function InsightRows({
  title,
  eyebrow,
  items,
  action,
}: {
  title: string;
  eyebrow: string;
  items: Array<{ label: string; value: string; hint: string }>;
  action?: React.ReactNode;
}) {
  return (
    <GlassPanel className="p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-3 divide-y divide-red-950/10">
        {items.map((item) => (
          <div key={item.label} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-medium text-zinc-900">{item.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.hint}</p>
            </div>
            <p className="text-sm font-semibold text-zinc-950">{item.value}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export function DashboardPage({
  user,
  dashboard,
  employeeDashboard,
  upcomingBirthdays = [],
}: DashboardPageProps) {
  const {
    isStaffRole,
    monthNavigation,
    showSalesSection,
    visibleModuleCards,
  } = buildDashboardPageViewModel({
    user,
    dashboard,
    employeeDashboard,
  });

  const primaryKpis = [
    {
      href: "/dashboard/orders",
      label: "Заказы",
      value: dashboard.entityCounts.orders,
      hint: "Операционный поток",
    },
    {
      href: "/dashboard/clients",
      label: "Клиенты",
      value: dashboard.entityCounts.clients,
      hint: "Клиентская база",
    },
    {
      href: "/dashboard/inventory",
      label: "Склад",
      value: dashboard.entityCounts.products,
      hint: "Позиции в работе",
    },
    {
      href: "/dashboard/employees",
      label: "Команда",
      value: dashboard.entityCounts.employees,
      hint: "Сотрудники CRM",
    },
  ];

  const staffMoney = [
    {
      label: "Авансы",
      value: formatMoney(employeeDashboard?.advancesCents ?? 0),
      hint: "За выбранный месяц",
    },
    {
      label: "Штрафы",
      value: formatMoney(employeeDashboard?.finesCents ?? 0),
      hint: "Удержания месяца",
    },
    {
      label: "Долги",
      value: formatMoney(employeeDashboard?.debtCents ?? 0),
      hint: "Текущие записи",
    },
  ];

  return (
    <PageShell
      title="Главная"
      action={<SessionUserActions user={user} />}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff2f2_46%,#f8eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-white/80 blur-3xl" />

        <div className="relative grid gap-4 xl:grid-cols-[minmax(300px,0.86fr)_minmax(420px,1.14fr)]">
          <GlassPanel className="foodlike-float-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-800/75">
              FoodLike control
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
              Живая панель управления доставкой
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
              Продажи, отчеты, команда и склад собраны в одном спокойном
              экране. Сначала видны главные решения, детали всегда рядом.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <a
                href={PUBLIC_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-800 transition hover:border-red-300 hover:bg-red-50/80"
              >
                Публичный сайт
              </a>
              <CrmEnvironmentLinks />
            </div>
          </GlassPanel>

          <div className="grid gap-3 sm:grid-cols-2">
            {primaryKpis.map((item, index) => (
              <div
                key={item.label}
                className={index % 2 === 0 ? "foodlike-float-slow" : "foodlike-float-soft"}
                style={{ animationDelay: `${index * 0.45}s` }}
              >
                <KpiTile {...item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-4 grid items-start gap-4 xl:grid-cols-12">
        <GlassPanel className={`p-4 ${showSalesSection ? "xl:col-span-5" : "xl:col-span-7"}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                Модули
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                Быстрый вход в рабочие зоны
              </h2>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-800">
              {visibleModuleCards.length} доступно
            </span>
          </div>
          <div className="mt-3">
            <ModuleCarousel cards={visibleModuleCards} />
          </div>
        </GlassPanel>

        {showSalesSection ? (
          <div className="xl:col-span-7">
            <InsightRows
              eyebrow="Продажи"
              title="Выручка и динамика заказов"
              items={dashboard.sales}
              action={
                <Link
                  href="/dashboard/sales"
                  className="rounded-full bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-900"
                >
                  Открыть продажи
                </Link>
              }
            />
          </div>
        ) : null}

        <div className="xl:col-span-5">
          <BirthdayCarousel clients={upcomingBirthdays} />
        </div>

        <GlassPanel className="p-4 xl:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Отчеты
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">
            Управленческие срезы
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/dashboard/reports", label: "Месячный отчет", hint: "Продажи, закупки, списания" },
              { href: "/dashboard/sales", label: "Маржа", hint: "Выручка и себестоимость" },
              { href: "/dashboard/inventory", label: "Склад", hint: "Приходы и списания" },
              { href: "/dashboard/profile", label: "Зарплата", hint: "Профиль и начисления" },
              { href: "/dashboard/clients", label: "Клиенты", hint: "Средний чек и база" },
              { href: "/dashboard/employees", label: "Команда", hint: "Графики и KPI" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[18px] border border-red-950/10 bg-white/74 p-3.5 shadow-sm shadow-red-950/5 transition hover:-translate-y-1 hover:border-red-200 hover:bg-white"
              >
                <p className="text-sm font-semibold text-zinc-950">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{item.hint}</p>
              </Link>
            ))}
          </div>
        </GlassPanel>

        {isStaffRole ? (
          <GlassPanel className="p-4 xl:col-span-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                  Мой месяц
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                  График и начисления
                </h2>
              </div>
              {monthNavigation ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={monthNavigation.previousHref}
                    className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-red-200 bg-white/90 text-base text-red-800 transition hover:border-red-300 hover:text-red-900"
                    aria-label="Предыдущий месяц"
                  >
                    ←
                  </Link>
                  <div className="rounded-[12px] border border-red-100 bg-white/90 px-3 py-2 text-sm font-semibold capitalize text-zinc-900 shadow-sm shadow-red-950/5">
                    {employeeDashboard?.monthLabel ?? "Текущий месяц"}
                  </div>
                  <Link
                    href={monthNavigation.nextHref}
                    className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-red-200 bg-white/90 text-base text-red-800 transition hover:border-red-300 hover:text-red-900"
                    aria-label="Следующий месяц"
                  >
                    →
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="mt-3 rounded-[18px] border border-red-950/10 bg-white/74 p-3.5">
              <p className="text-sm font-medium text-zinc-500">График</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">
                {employeeDashboard?.scheduleSummary ?? "График не задан"}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {employeeDashboard?.scheduleDays
                  ? `${employeeDashboard.scheduleDays} рабочих дн. · ${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(employeeDashboard.scheduleHours)} ч`
                  : "У сотрудника пока не заполнен рабочий график."}
              </p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {staffMoney.map((item) => (
                <KpiTile key={item.label} {...item} />
              ))}
            </div>
            <div className="mt-3 rounded-[18px] border border-red-950/10 bg-red-800 p-3.5 text-white">
              <p className="text-sm font-medium text-red-50/80">
                Зарплата на текущий день
              </p>
              <p className="mt-1 text-xl font-semibold">
                {formatMoney(employeeDashboard?.salaryTodayCents ?? 0)}
              </p>
            </div>
          </GlassPanel>
        ) : null}
      </section>
    </PageShell>
  );
}
