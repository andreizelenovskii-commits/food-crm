"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import { EmployeeAccessForm } from "@/modules/employees/components/employee-access-form";
import { updateEmployeeAction } from "@/modules/employees/employees.actions";
import { EmployeeContactsCard } from "@/modules/employees/components/employee-contacts-card";
import { type ContactsDraft, buildContactsDraft, buildEditableSchedule, formatMonthLabel, getInitialPreviewMonth, getMonthKey, getMonthPreviewStats, isDateInMonth } from "@/modules/employees/components/employee-profile.helpers";
import { EmployeeAdjustmentsPanel, EmployeeMetricsPanel, EmployeeScheduleEditorDialog } from "@/modules/employees/components/employee-profile-panels";
import { EmployeeSchedulePreview } from "@/modules/employees/components/employee-schedule-preview";
import { ProfileMoneyRow, ProfilePanelButton, ProfileSummaryTile, formatProfileMoney } from "@/modules/employees/components/employee-profile-panel-button";
import { formatHours, formatScheduleSummary } from "@/modules/employees/employees.schedule";
import { type EmployeeProfile, type EmployeeSchedule } from "@/modules/employees/employees.types";

export function EmployeeProfileClient({
  employee,
  canManageEmployees,
}: {
  employee: EmployeeProfile;
  canManageEmployees: boolean;
}) {
  const showOrderMetrics = employee.role === "Повар" || employee.role === "Курьер";
  const initialSchedule = buildEditableSchedule(employee);
  const initialScheduleSerialized = Object.keys(initialSchedule.days).length
    ? JSON.stringify(initialSchedule)
    : "";
  const initialContactsDraft = buildContactsDraft(employee);
  const [schedule, setSchedule] = useState<EmployeeSchedule>(() => buildEditableSchedule(employee));
  const [selectedMonth, setSelectedMonth] = useState(() => getInitialPreviewMonth(initialSchedule));
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"schedule" | "metrics" | "access" | "adjustments" | null>(null);
  const [adjustmentTab, setAdjustmentTab] = useState<"advances" | "fines" | "debts">("advances");
  const [contactsDraft, setContactsDraft] = useState<ContactsDraft>(initialContactsDraft);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);

  const resetContactsDraft = () => {
    setContactsDraft(buildContactsDraft(employee));
    setRolePickerOpen(false);
  };

  const scheduleSummary = formatScheduleSummary(schedule);
  const scheduleStats = getMonthPreviewStats(schedule, selectedMonth);
  const selectedMonthKey = getMonthKey(selectedMonth);
  const selectedMonthLabel = formatMonthLabel(selectedMonth);
  const selectedMonthAdjustments = employee.adjustments.filter((adjustment) =>
    isDateInMonth(adjustment.createdAt, selectedMonth),
  );
  const selectedMonthAdjustmentTotals = selectedMonthAdjustments.reduce(
    (acc, adjustment) => ({
      ...acc,
      [adjustment.type]: acc[adjustment.type] + adjustment.amountCents,
    }),
    {
      ADVANCE: 0,
      FINE: 0,
      DEBT: 0,
    } as Record<"ADVANCE" | "FINE" | "DEBT", number>,
  );
  const selectedMonthOrderStats =
    employee.monthlyOrderStats.find((entry) => entry.monthKey === selectedMonthKey) ??
    { monthKey: selectedMonthKey, ordersCount: 0, revenueCents: 0 };
  const serializedSchedule = Object.keys(schedule.days).length ? JSON.stringify(schedule) : "";
  const hasUnsavedScheduleChanges = serializedSchedule !== initialScheduleSerialized;

  const handleSaveContacts = async (formData: FormData) => {
    formData.set("schedule", serializedSchedule);
    await updateEmployeeAction(employee.id, formData);
  };

  const handleSaveSchedule = async () => {
    setIsScheduleEditorOpen(false);
    const formData = new FormData();
    formData.set("schedule", serializedSchedule);
    await updateEmployeeAction(employee.id, formData);
  };

  const filteredAdjustments = selectedMonthAdjustments.filter((adj) => {
    switch (adjustmentTab) {
      case "advances": return adj.type === "ADVANCE";
      case "fines": return adj.type === "FINE";
      case "debts": return adj.type === "DEBT";
      default: return false;
    }
  });

  return (
    <>
      <div className="space-y-4 p-4 sm:p-5">
        <section className="grid gap-4 rounded-[20px] border border-white/70 bg-white/64 p-4 shadow-sm shadow-red-950/5 backdrop-blur-xl xl:grid-cols-[minmax(22rem,0.95fr)_minmax(0,1.05fr)]">
          <EmployeeContactsCard
            className="rounded-none border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
            employee={employee}
            contactsDraft={contactsDraft}
            isEditing={isEditingContacts}
            rolePickerOpen={rolePickerOpen}
            serializedSchedule={serializedSchedule}
            onEdit={() => {
              resetContactsDraft();
              setIsEditingContacts(true);
            }}
            onCancel={() => {
              resetContactsDraft();
              setIsEditingContacts(false);
            }}
            onRolePickerChange={setRolePickerOpen}
            onDraftChange={setContactsDraft}
            onSave={handleSaveContacts}
          />
          <div className="rounded-[18px] border border-red-950/10 bg-white/74 p-4 shadow-sm shadow-red-950/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Сводка месяца</p>
                <h2 className="mt-1 text-lg font-semibold capitalize text-zinc-950">{selectedMonthLabel}</h2>
              </div>
              <button type="button" onClick={() => setActivePanel("metrics")} className="inline-flex h-9 items-center justify-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
                Все показатели
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <ProfileSummaryTile label="Рабочие дни" value={`${scheduleStats.days} дн.`} />
              <ProfileSummaryTile label="Часы" value={`${formatHours(scheduleStats.hours)} ч`} />
              <ProfileSummaryTile label="Авансы" value={formatProfileMoney(selectedMonthAdjustmentTotals.ADVANCE)} />
              <ProfileSummaryTile label="Заказы" value={showOrderMetrics ? selectedMonthOrderStats.ordersCount : "—"} />
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.95fr]">
          <section className="rounded-[20px] border border-white/70 bg-white/66 p-4 shadow-sm shadow-red-950/5 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Рабочий месяц</p>
            <h2 className="mt-1 text-base font-semibold text-zinc-950">График и нагрузка</h2>
            <p className="mt-2 text-xs leading-5 text-zinc-600">{scheduleSummary}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <ProfileSummaryTile label="Смен" value={`${scheduleStats.days}`} />
              <ProfileSummaryTile label="Часов" value={formatHours(scheduleStats.hours)} />
            </div>
            <button type="button" onClick={() => setActivePanel("schedule")} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-red-800 px-5 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
              Открыть график
            </button>
          </section>

          <section className="rounded-[20px] border border-white/70 bg-white/66 p-4 shadow-sm shadow-red-950/5 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Финансы</p>
            <h2 className="mt-1 text-base font-semibold text-zinc-950">Корректировки месяца</h2>
            <div className="mt-4 space-y-2">
              <ProfileMoneyRow label="Авансы" value={selectedMonthAdjustmentTotals.ADVANCE} />
              <ProfileMoneyRow label="Штрафы" value={selectedMonthAdjustmentTotals.FINE} />
              <ProfileMoneyRow label="Долги" value={selectedMonthAdjustmentTotals.DEBT} />
            </div>
            <button type="button" onClick={() => setActivePanel("adjustments")} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-red-100 bg-white/90 px-5 text-sm font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Открыть корректировки
            </button>
          </section>

          <section className="rounded-[20px] border border-white/70 bg-white/66 p-4 shadow-sm shadow-red-950/5 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Разделы профиля</p>
            <h2 className="mt-1 text-base font-semibold text-zinc-950">Быстрые действия</h2>
            <div className="grid gap-2">
              <ProfilePanelButton
                icon="schedule"
                title="График работы"
                description="Календарь смен и редактирование"
                onClick={() => setActivePanel("schedule")}
              />
              <ProfilePanelButton
                icon="metrics"
                title="Показатели"
                description="Метрики за выбранный месяц"
                onClick={() => setActivePanel("metrics")}
              />
              {canManageEmployees ? (
                <ProfilePanelButton
                  icon="access"
                  title="Доступ в систему"
                  description="Логин, пароль и выдача доступа"
                  onClick={() => setActivePanel("access")}
                />
              ) : null}
              <ProfilePanelButton
                icon="adjustments"
                title="Корректировки"
                description="Авансы, штрафы и долги"
                onClick={() => setActivePanel("adjustments")}
              />
            </div>
          </section>
        </div>
      </div>

      {isScheduleEditorOpen ? (
        <EmployeeScheduleEditorDialog
          schedule={schedule}
          scheduleSummary={scheduleSummary}
          hasUnsavedChanges={hasUnsavedScheduleChanges}
          onChange={setSchedule}
          onReset={() => setSchedule(buildEditableSchedule(employee))}
          onSave={handleSaveSchedule}
          onClose={() => setIsScheduleEditorOpen(false)}
        />
      ) : null}

      {activePanel && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-90 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="fixed inset-0 cursor-default"
                aria-label="Закрыть панель сотрудника"
              />
              <section className="relative mx-auto max-w-5xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                      Профиль сотрудника
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                      {activePanel === "schedule"
                          ? "График работы"
                        : activePanel === "access"
                          ? "Доступ в систему"
                          : activePanel === "adjustments"
                            ? "Корректировки"
                          : "Показатели"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                  >
                    Закрыть
                  </button>
                </div>

                <div className="space-y-4">
                  {activePanel === "schedule" ? (
                    <EmployeeSchedulePreview
                      schedule={schedule}
                      currentMonth={selectedMonth}
                      onMonthChange={setSelectedMonth}
                      onEdit={() => setIsScheduleEditorOpen(true)}
                    />
                  ) : null}

                  {activePanel === "metrics" ? (
                    <EmployeeMetricsPanel
                      monthLabel={selectedMonthLabel}
                      adjustmentTotals={selectedMonthAdjustmentTotals}
                      scheduleStats={scheduleStats}
                      showOrderMetrics={showOrderMetrics}
                      ordersCount={selectedMonthOrderStats.ordersCount}
                    />
                  ) : null}

                  {activePanel === "access" ? (
                    <EmployeeAccessForm employee={employee} />
                  ) : null}

                  {activePanel === "adjustments" ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setAdjustmentTab("advances")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${adjustmentTab === "advances" ? "bg-red-800 text-white shadow-sm shadow-red-950/15" : "border border-red-100 bg-white/90 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"}`}>
                          Авансы
                        </button>
                        <button type="button" onClick={() => setAdjustmentTab("fines")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${adjustmentTab === "fines" ? "bg-red-800 text-white shadow-sm shadow-red-950/15" : "border border-red-100 bg-white/90 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"}`}>
                          Штрафы
                        </button>
                        <button type="button" onClick={() => setAdjustmentTab("debts")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${adjustmentTab === "debts" ? "bg-red-800 text-white shadow-sm shadow-red-950/15" : "border border-red-100 bg-white/90 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"}`}>
                          Долги
                        </button>
                      </div>
                      <EmployeeAdjustmentsPanel
                        employeeId={employee.id}
                        activeTab={adjustmentTab}
                        tabLabel={adjustmentTab === "advances" ? "Авансы" : adjustmentTab === "fines" ? "Штрафы" : "Долги"}
                        monthLabel={selectedMonthLabel}
                        adjustments={filteredAdjustments}
                      />
                    </div>
                  ) : null}
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
