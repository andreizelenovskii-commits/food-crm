import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import {
  buildReportsViewModel,
  type ReportsInput,
  type ReportMetric,
} from "@/modules/reports/reports.page-model";
import { ReportsDialogGrid } from "@/modules/reports/components/reports-dialog-grid";
import { ReportsPeriodPicker } from "@/modules/reports/components/reports-period-picker";

type ReportsPageProps = ReportsInput & {
  user: SessionUser;
};

function MetricCard({ label, value, hint }: ReportMetric) {
  return <KpiTile label={label} value={value} hint={hint} />;
}

export function ReportsPage({
  user,
  period,
  date,
  month,
  orders,
  catalogItems,
  products,
  techCards,
  incomingActs,
  writeoffActs,
  employees,
  clients,
  loyalty,
}: ReportsPageProps) {
  const viewModel = buildReportsViewModel({
    month,
    period,
    date,
    orders,
    catalogItems,
    products,
    techCards,
    incomingActs,
    writeoffActs,
    employees,
    clients,
    loyalty,
  });

  return (
    <PageShell
      title="Отчеты"
      description="Сводка по заказам, складу, сотрудникам и клиентской активности."
      action={<SessionUserActions user={user} />}
    >
      <div className="foodlike-frame space-y-4 p-4 sm:p-5">
        <GlassPanel className="relative z-40 overflow-visible p-4 sm:p-5">
          <div className="relative z-40 grid gap-4 xl:grid-cols-[minmax(260px,0.55fr)_1fr] xl:items-end">
            <div>
              <p className="foodlike-kicker">
                Отчетный центр
              </p>
              <h2 className="mt-1 foodlike-title-sm">
                Управленческие отчеты FoodLike
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {viewModel.selectedPeriodLabel}: продажи, закупки, себестоимость, склад, персонал, меню и клиенты.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-nowrap lg:items-center xl:justify-end">
              <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                {viewModel.periodOptions.map((option) => (
                  <a
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
                  </a>
                ))}
              </div>
              <ReportsPeriodPicker period={viewModel.range.period} dateParts={viewModel.dateParts} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={viewModel.previousHref} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/80 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Предыдущий период
            </a>
            <a href={viewModel.nextHref} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/80 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Следующий период
            </a>
          </div>
        </GlassPanel>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {viewModel.summary.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <GlassPanel className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="foodlike-kicker">
                Отчеты
              </p>
              <h2 className="mt-1 foodlike-title-sm">
                Открыть детальный расчет
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Каждый отчет считается по выбранному периоду и открывается в отдельном окне.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ReportsDialogGrid reports={viewModel.reports} />
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
