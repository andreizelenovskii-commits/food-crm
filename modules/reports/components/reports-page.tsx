import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import {
  buildReportsViewModel,
  type ReportsInput,
  type ReportMetric,
} from "@/modules/reports/reports.page-model";

type ReportsPageProps = ReportsInput & {
  user: SessionUser;
};

function MetricCard({ label, value, hint }: ReportMetric) {
  return <KpiTile label={label} value={value} hint={hint} />;
}

export function ReportsPage({
  user,
  month,
  orders,
  catalogItems,
  products,
  incomingActs,
  writeoffActs,
  employees,
  loyalty,
}: ReportsPageProps) {
  const viewModel = buildReportsViewModel({
    month,
    orders,
    catalogItems,
    products,
    incomingActs,
    writeoffActs,
    employees,
    loyalty,
  });

  return (
    <PageShell
      title="Отчеты"
      description="Сводка по заказам, складу, сотрудникам и клиентской активности."
      action={<SessionUserActions user={user} />}
    >
      <div className="foodlike-frame space-y-4 p-4 sm:p-5">
        <GlassPanel className="p-4 sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.55fr)_1fr] xl:items-end">
            <div>
              <p className="foodlike-kicker">
                Отчетный центр
              </p>
              <h2 className="mt-1 foodlike-title-sm">
                Месячные отчеты FoodLike
              </h2>
            </div>
            <form action="/dashboard/reports" className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
              <label className="block">
                <span className="text-xs font-medium text-zinc-500">Месяц отчета</span>
                <input
                  type="month"
                  name="month"
                  defaultValue={viewModel.selectedMonth}
                  className="foodlike-field mt-1"
                />
              </label>
              <button
                type="submit"
                className="foodlike-button-primary"
              >
                Сформировать
              </button>
            </form>
          </div>
        </GlassPanel>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {viewModel.summary.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {viewModel.sections.map((section) => (
            <GlassPanel
              key={section.title}
              className="p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-950">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {section.metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </div>
            </GlassPanel>
          ))}
        </section>

        <GlassPanel className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="foodlike-kicker">
                Популярные шаблоны
              </p>
              <h2 className="mt-1 foodlike-title-sm">
                Что стоит добавить в следующих версиях
              </h2>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {viewModel.popularReports.map((report) => (
              <article
                key={report.title}
                className="foodlike-card p-3.5"
              >
                <h3 className="text-sm font-semibold text-zinc-950">
                  {report.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                  {report.description}
                </p>
              </article>
            ))}
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
