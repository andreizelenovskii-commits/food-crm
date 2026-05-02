import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import {
  buildReportsViewModel,
  type ReportsInput,
  type ReportMetric,
} from "@/modules/reports/reports.page-model";

type ReportsPageProps = ReportsInput & {
  user: SessionUser;
};

function MetricCard({ label, value, hint }: ReportMetric) {
  return (
    <article className="rounded-[14px] border border-red-950/10 bg-white/90 p-3.5 shadow-sm shadow-red-950/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>
    </article>
  );
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
    <PageShell title="Отчеты" action={<SessionUserActions user={user} />}>
      <div className="space-y-4">
        <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
          <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.55fr)_1fr] xl:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
                Report center
              </p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">
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
                  className="mt-1 h-10 rounded-[12px] border border-red-950/10 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                />
              </label>
              <button
                type="submit"
                className="h-10 rounded-[12px] bg-red-800 px-4 text-sm font-medium text-white transition hover:bg-red-900"
              >
                Сформировать
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {viewModel.summary.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {viewModel.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5"
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
            </article>
          ))}
        </section>

        <section className="rounded-[16px] border border-red-950/10 bg-[#fffafa] p-4 shadow-sm shadow-red-950/5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
                Популярные шаблоны
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                Что стоит добавить в следующих версиях
              </h2>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {viewModel.popularReports.map((report) => (
              <article
                key={report.title}
                className="rounded-[14px] border border-red-950/10 bg-white/90 p-3.5 shadow-sm shadow-red-950/5"
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
        </section>
      </div>
    </PageShell>
  );
}
