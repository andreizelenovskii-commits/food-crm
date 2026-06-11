import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import {
  buildSalesAnalyticsViewModel,
  type SalesAnalyticsInput,
  type SalesMetric,
} from "@/modules/sales/sales.page-model";

type SalesPageProps = SalesAnalyticsInput & {
  user: SessionUser;
};

function MetricCard(metric: SalesMetric) {
  return <KpiTile href={metric.href} label={metric.label} value={metric.value} hint={metric.hint} />;
}

function ToneMetricCard(metric: SalesMetric) {
  const toneClass =
    metric.tone === "danger"
      ? "border-red-200 bg-red-50/80"
      : metric.tone === "warning"
        ? "border-amber-200 bg-amber-50/80"
        : "border-emerald-100 bg-emerald-50/70";

  const className = `block rounded-[18px] border p-4 shadow-sm shadow-red-950/5 transition ${
    metric.href ? "hover:-translate-y-1 hover:shadow-red-950/15" : ""
  } ${toneClass}`;
  const content = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
        {metric.label}
      </p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{metric.value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-600">{metric.hint}</p>
    </>
  );

  return metric.href ? (
    <Link href={metric.href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}

function InsightList({
  title,
  eyebrow,
  items,
  actionHref,
  actionLabel = "Открыть",
}: {
  title: string;
  eyebrow: string;
  items: SalesMetric[];
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <GlassPanel className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="foodlike-kicker">{eyebrow}</p>
          <h2 className="mt-1 foodlike-title-sm">{title}</h2>
        </div>
        {actionHref ? <PanelLink href={actionHref}>{actionLabel}</PanelLink> : null}
      </div>
      <div className="mt-3 divide-y divide-red-950/10">
        {items.length ? (
          items.map((item) => (
            <LinkRow key={`${item.label}-${item.value}`} item={item} />
          ))
        ) : (
          <p className="foodlike-empty mt-3 px-4 py-4">Данных за период пока нет.</p>
        )}
      </div>
    </GlassPanel>
  );
}

function LinkRow({ item }: { item: SalesMetric }) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{item.label}</p>
        <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.hint}</p>
      </div>
      <p className="text-sm font-semibold text-zinc-950">{item.value}</p>
    </>
  );

  return item.href ? (
    <Link href={item.href} className="grid gap-2 py-3 transition hover:text-red-800 sm:grid-cols-[1fr_auto] sm:items-center">
      {content}
    </Link>
  ) : (
    <div className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">{content}</div>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/80 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
    >
      {children}
    </Link>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export function SalesPage(props: SalesPageProps) {
  const analytics = buildSalesAnalyticsViewModel(props);

  return (
    <PageShell
      title="Продажи"
      description="Выручка, заказы, маржа, food cost и управленческая отчетность по периодам."
      action={<SessionUserActions user={props.user} />}
    >
      <div className="foodlike-frame space-y-4 p-4 sm:p-5">
        <GlassPanel className="p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="foodlike-kicker">Период отчета</p>
              <h2 className="mt-1 text-2xl font-semibold text-zinc-950">
                {analytics.range.label}
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Все расчеты ниже отфильтрованы по этому периоду.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex flex-wrap gap-2">
                {analytics.periodOptions.map((option) => (
                  <Link
                    key={option.label}
                    href={option.href}
                    className={[
                      "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition",
                      option.isActive
                        ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                        : "border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-50",
                    ].join(" ")}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
              <form action="/dashboard/sales" className="flex gap-2">
                <input type="hidden" name="period" value={analytics.range.period} />
                <label className="foodlike-date-field min-w-44">
                  <input
                    type={analytics.dateInputType}
                    name="date"
                    defaultValue={analytics.range.date}
                    aria-label="Дата отчета"
                    className="foodlike-date-input"
                  />
                  <CalendarIcon className="pointer-events-none size-5 shrink-0 text-red-900" />
                </label>
                <button type="submit" className="foodlike-button-primary">Показать</button>
              </form>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <PanelLink href={analytics.previousHref}>Предыдущий период</PanelLink>
            <PanelLink href={analytics.nextHref}>Следующий период</PanelLink>
          </div>
        </GlassPanel>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analytics.kpis.map((item) =>
            item.tone ? <ToneMetricCard key={item.label} {...item} /> : <MetricCard key={item.label} {...item} />,
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <GlassPanel className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="foodlike-kicker">Воронка</p>
                <h2 className="mt-1 foodlike-title-sm">Заказы и статусы</h2>
              </div>
              <PanelLink href="/dashboard/orders">Все заказы</PanelLink>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {analytics.orderFlow.map((item) =>
                item.tone ? <ToneMetricCard key={item.label} {...item} /> : <MetricCard key={item.label} {...item} />,
              )}
            </div>
          </GlassPanel>
          <InsightList title="Маржинальность" eyebrow="Расчет" items={analytics.profitability} actionHref="/dashboard/inventory" actionLabel="Склад" />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <InsightList title="Выручка по категориям" eyebrow="Меню" items={analytics.revenueByCategory} actionHref="/dashboard/catalog" actionLabel="Каталог" />
          <InsightList title="Эффективность блюд" eyebrow="Маржа" items={analytics.menuPerformance} actionHref="/dashboard/inventory" actionLabel="Техкарты" />
          <InsightList title="Каналы продаж" eyebrow="Источники" items={analytics.sourceFlow} actionHref="/dashboard/orders" actionLabel="Заказы" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <InsightList title="Готовность расчетов" eyebrow="Данные" items={analytics.readiness} />
          <GlassPanel className="p-4">
            <p className="foodlike-kicker">Быстрые действия</p>
            <h2 className="mt-1 foodlike-title-sm">Куда перейти дальше</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {analytics.reportActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5 transition hover:-translate-y-1 hover:border-red-800/20 hover:bg-red-800 hover:text-white"
                >
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 transition group-hover:text-white/75">
                    {action.hint}
                  </p>
                </Link>
              ))}
            </div>
          </GlassPanel>
        </section>
      </div>
    </PageShell>
  );
}
