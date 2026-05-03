import { EmployeeAdjustmentForm } from "@/modules/employees/components/employee-adjustment-form";
import { EmployeeScheduleEditor } from "@/modules/employees/components/employee-schedule-editor";
import {
  formatDate,
  formatMoney,
} from "@/modules/employees/components/employee-profile.helpers";
import { formatHours } from "@/modules/employees/employees.schedule";
import {
  EMPLOYEE_ADJUSTMENT_LABELS,
  type EmployeeAdjustment,
  type EmployeeSchedule,
} from "@/modules/employees/employees.types";

export type EmployeeProfileTab = "general" | "advances" | "fines" | "debts";

export function EmployeeProfileTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ id: EmployeeProfileTab; label: string }>;
  activeTab: EmployeeProfileTab;
  onChange: (tab: EmployeeProfileTab) => void;
}) {
  return (
    <div className="flex border-b border-zinc-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition ${activeTab === tab.id ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-600 hover:text-zinc-950"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function EmployeeMetricsPanel({
  monthLabel,
  adjustmentTotals,
  scheduleStats,
  showOrderMetrics,
  ordersCount,
}: {
  monthLabel: string;
  adjustmentTotals: Record<"ADVANCE" | "FINE" | "DEBT", number>;
  scheduleStats: { days: number; hours: number };
  showOrderMetrics: boolean;
  ordersCount: number;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <PanelHeader title="Показатели" monthLabel={monthLabel} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MetricTile label="Авансы за месяц" value={formatMoney(adjustmentTotals.ADVANCE)} />
        <MetricTile label="Штрафы" value={formatMoney(adjustmentTotals.FINE)} />
        <MetricTile label="Долги" value={formatMoney(adjustmentTotals.DEBT)} />
        <MetricTile label="Рабочие часы" value={formatHours(scheduleStats.hours)} />
        <MetricTile label="Рабочие дни" value={scheduleStats.days} />
        {showOrderMetrics ? <MetricTile label="Заказы за месяц" value={ordersCount} /> : null}
      </div>
    </section>
  );
}

export function EmployeeWorkResultsPanel({
  monthLabel,
  showOrderMetrics,
  ordersCount,
  revenueCents,
  scheduleStats,
}: {
  monthLabel: string;
  showOrderMetrics: boolean;
  ordersCount: number;
  revenueCents: number;
  scheduleStats: { days: number; hours: number };
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <PanelHeader title="Рабочие результаты" monthLabel={monthLabel} />
      <div className={`mt-5 grid gap-4 ${showOrderMetrics ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
        {showOrderMetrics ? <MetricTile label="Заказы за месяц" value={ordersCount} /> : null}
        {showOrderMetrics ? <MetricTile label="Сумма заказов" value={formatMoney(revenueCents)} /> : null}
        <MetricTile label="График на месяц" value={`${scheduleStats.days} дн.`} hint={`${formatHours(scheduleStats.hours)} ч`} />
      </div>
      <p className="mt-4 text-sm text-zinc-600">
        Показатели на экране синхронизированы с месяцем, который выбран в календаре сотрудника.
      </p>
    </section>
  );
}

export function EmployeeAdjustmentsPanel({
  employeeId,
  activeTab,
  tabLabel,
  monthLabel,
  adjustments,
}: {
  employeeId: number;
  activeTab: Exclude<EmployeeProfileTab, "general">;
  tabLabel: string;
  monthLabel: string;
  adjustments: EmployeeAdjustment[];
}) {
  const defaultType = activeTab === "advances" ? "ADVANCE" : activeTab === "fines" ? "FINE" : "DEBT";

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
        <h2 className="text-xl font-semibold text-zinc-950">{tabLabel}</h2>
        <p className="mt-1 text-sm capitalize text-zinc-500">{monthLabel}</p>
        <div className="mt-5 space-y-4">
          {adjustments.length === 0 ? (
            <p className="text-sm text-zinc-600">За выбранный месяц записей пока нет.</p>
          ) : (
            adjustments.map((adjustment) => (
              <div key={adjustment.id} className="rounded-[14px] border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-zinc-950">{EMPLOYEE_ADJUSTMENT_LABELS[adjustment.type]}</p>
                  <p className="text-sm text-zinc-700">{formatDate(adjustment.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{adjustment.comment || "Без комментария"}</p>
                <p className="mt-3 text-xl font-semibold text-zinc-950">{formatMoney(adjustment.amountCents)}</p>
              </div>
            ))
          )}
        </div>
      </section>
      <EmployeeAdjustmentForm employeeId={employeeId} defaultType={defaultType} />
    </div>
  );
}

export function EmployeeScheduleEditorDialog({
  schedule,
  scheduleSummary,
  hasUnsavedChanges,
  onChange,
  onReset,
  onSave,
  onClose,
}: {
  schedule: EmployeeSchedule;
  scheduleSummary: string;
  hasUnsavedChanges: boolean;
  onChange: (schedule: EmployeeSchedule) => void;
  onReset: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 px-4 py-4 sm:py-5" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Редактирование графика работы" className="flex max-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/25" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-4 sm:px-5 py-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-zinc-950">График работы</h2>
            <p className="text-sm text-zinc-600">{scheduleSummary}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
            Закрыть
          </button>
        </div>
        <div className="overflow-y-auto px-4 sm:px-5 py-5">
          <EmployeeScheduleEditor value={schedule} onChange={onChange} />
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-4 sm:px-5 py-4">
          <button type="button" onClick={onReset} disabled={!hasUnsavedChanges} className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400">
            Сбросить
          </button>
          <button type="button" onClick={onSave} disabled={!hasUnsavedChanges} className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300">
            Сохранить график
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ title, monthLabel }: { title: string; monthLabel: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
      <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">{monthLabel}</p>
    </div>
  );
}

function MetricTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[14px] bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
      {hint ? <p className="mt-1 text-sm text-zinc-500">{hint}</p> : null}
    </div>
  );
}
