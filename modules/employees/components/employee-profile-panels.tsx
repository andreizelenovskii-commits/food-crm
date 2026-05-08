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

export type EmployeeProfileTab = "general" | "advances" | "fines" | "debts" | "salary";

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
    <div className="flex flex-wrap gap-2 rounded-[18px] border border-white/70 bg-white/76 p-2 shadow-sm shadow-red-950/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab.id
              ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
              : "text-zinc-600 hover:bg-red-50/70 hover:text-red-800"
          }`}
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
  adjustmentTotals: Record<"ADVANCE" | "FINE" | "DEBT" | "SALARY", number>;
  scheduleStats: { days: number; hours: number };
  showOrderMetrics: boolean;
  ordersCount: number;
}) {
  return (
    <section className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
      <PanelHeader title="Показатели" monthLabel={monthLabel} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MetricTile label="Авансы за месяц" value={formatMoney(adjustmentTotals.ADVANCE)} />
        <MetricTile label="Штрафы" value={formatMoney(adjustmentTotals.FINE)} />
        <MetricTile label="Долги" value={formatMoney(adjustmentTotals.DEBT)} />
        <MetricTile label="Зарплата за месяц" value={formatMoney(adjustmentTotals.SALARY)} />
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
    <section className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
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
  const defaultType = activeTab === "advances"
    ? "ADVANCE"
    : activeTab === "fines"
      ? "FINE"
      : activeTab === "salary"
        ? "SALARY"
        : "DEBT";

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">{tabLabel}</h2>
        <p className="mt-1 text-xs capitalize text-zinc-500">{monthLabel}</p>
        <div className="mt-5 space-y-4">
          {adjustments.length === 0 ? (
            <p className="text-sm text-zinc-600">За выбранный месяц записей пока нет.</p>
          ) : (
            adjustments.map((adjustment) => (
              <div key={adjustment.id} className="rounded-[16px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5">
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/35 px-4 py-4 backdrop-blur-sm sm:py-5" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Редактирование графика работы" className="flex max-h-[calc(100vh-3rem)] w-full max-w-[86rem] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] shadow-[0_24px_80px_rgba(127,29,29,0.18)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-red-950/10 bg-white/76 px-4 py-4 backdrop-blur-2xl sm:px-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-zinc-950">График работы</h2>
            <p className="text-sm text-zinc-600">{scheduleSummary}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Закрыть
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-5">
          <EmployeeScheduleEditor value={schedule} onChange={onChange} />
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-red-950/10 bg-white/76 px-4 py-3 backdrop-blur-2xl sm:px-5">
          <button type="button" onClick={onReset} disabled={!hasUnsavedChanges} className="rounded-full border border-red-100 bg-white/90 px-5 py-2.5 text-sm font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            Сбросить
          </button>
          <button type="button" onClick={onSave} disabled={!hasUnsavedChanges} className="rounded-full bg-red-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300">
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
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">{title}</h2>
      <p className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold capitalize text-red-800 ring-1 ring-red-100">{monthLabel}</p>
    </div>
  );
}

function MetricTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{value}</p>
      {hint ? <p className="mt-1 text-sm text-zinc-500">{hint}</p> : null}
    </div>
  );
}
