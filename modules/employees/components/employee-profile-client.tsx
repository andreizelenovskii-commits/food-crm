"use client";

import { useState } from "react";
import { updateEmployeeAction } from "@/modules/employees/employees.actions";
import { EmployeeAdjustmentForm } from "@/modules/employees/components/employee-adjustment-form";
import { EmployeeContactsCard } from "@/modules/employees/components/employee-contacts-card";
import {
  type ContactsDraft,
  buildContactsDraft,
  buildEditableSchedule,
  formatDate,
  formatMoney,
  formatMonthLabel,
  getInitialPreviewMonth,
  getMonthKey,
  getMonthPreviewStats,
  isDateInMonth,
} from "@/modules/employees/components/employee-profile.helpers";
import { EmployeeSchedulePreview } from "@/modules/employees/components/employee-schedule-preview";
import { EmployeeScheduleEditor } from "@/modules/employees/components/employee-schedule-editor";
import {
  formatHours,
  formatScheduleSummary,
} from "@/modules/employees/employees.schedule";
import {
  EMPLOYEE_ADJUSTMENT_LABELS,
  type EmployeeAdjustment,
  type EmployeeProfile,
  type EmployeeSchedule,
} from "@/modules/employees/employees.types";

type Tab = 'general' | 'advances' | 'fines' | 'debts';

export function EmployeeProfileClient({ employee }: { employee: EmployeeProfile }) {
  const showOrderMetrics = employee.role === "Повар" || employee.role === "Курьер";
  const initialSchedule = buildEditableSchedule(employee);
  const initialScheduleSerialized = Object.keys(initialSchedule.days).length
    ? JSON.stringify(initialSchedule)
    : "";
  const initialContactsDraft = buildContactsDraft(employee);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [schedule, setSchedule] = useState<EmployeeSchedule>(() => buildEditableSchedule(employee));
  const [selectedMonth, setSelectedMonth] = useState(() => getInitialPreviewMonth(initialSchedule));
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
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

  const tabs = [
    { id: 'general' as Tab, label: 'Общая информация' },
    { id: 'advances' as Tab, label: 'Авансы' },
    { id: 'fines' as Tab, label: 'Штрафы' },
    { id: 'debts' as Tab, label: 'Долги' },
  ];

  const filteredAdjustments = selectedMonthAdjustments.filter((adj: EmployeeAdjustment) => {
    switch (activeTab) {
      case 'advances': return adj.type === 'ADVANCE';
      case 'fines': return adj.type === 'FINE';
      case 'debts': return adj.type === 'DEBT';
      default: return false;
    }
  });

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-zinc-950 text-zinc-950'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_0.7fr]">
          <div className="space-y-5">
            <EmployeeContactsCard
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

            <EmployeeSchedulePreview
              schedule={schedule}
              currentMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onEdit={() => setIsScheduleEditorOpen(true)}
            />
          </div>

          <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-zinc-950">Показатели</h2>
              <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                {selectedMonthLabel}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[14px] bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Авансы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthAdjustmentTotals.ADVANCE)}</p>
              </div>
              <div className="rounded-[14px] bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Штрафы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthAdjustmentTotals.FINE)}</p>
              </div>
              <div className="rounded-[14px] bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Долги</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthAdjustmentTotals.DEBT)}</p>
              </div>
              <div className="rounded-[14px] bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Рабочие часы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatHours(scheduleStats.hours)}</p>
              </div>
              <div className="rounded-[14px] bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Рабочие дни</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{scheduleStats.days}</p>
              </div>
              {showOrderMetrics ? (
                <div className="rounded-[14px] bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500">Заказы за месяц</p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950">{selectedMonthOrderStats.ordersCount}</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'general' && (
        <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-950">Рабочие результаты</h2>
            <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
              {selectedMonthLabel}
            </p>
          </div>
          <div className={`mt-5 grid gap-4 ${showOrderMetrics ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
            {showOrderMetrics ? (
              <div className="rounded-[14px] bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Заказы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{selectedMonthOrderStats.ordersCount}</p>
              </div>
            ) : null}
            {showOrderMetrics ? (
              <div className="rounded-[14px] bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Сумма заказов</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthOrderStats.revenueCents)}</p>
              </div>
            ) : null}
            <div className="rounded-[14px] bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">График на месяц</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{scheduleStats.days} дн.</p>
              <p className="mt-1 text-sm text-zinc-500">{formatHours(scheduleStats.hours)} ч</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            Показатели на экране синхронизированы с месяцем, который выбран в календаре сотрудника.
          </p>
        </section>
      )}

      {(activeTab === 'advances' || activeTab === 'fines' || activeTab === 'debts') && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="mt-1 text-sm capitalize text-zinc-500">{selectedMonthLabel}</p>
            <div className="mt-5 space-y-4">
              {filteredAdjustments.length === 0 ? (
                <p className="text-sm text-zinc-600">За выбранный месяц записей пока нет.</p>
              ) : (
                <div className="space-y-4">
                  {filteredAdjustments.map((adjustment: EmployeeAdjustment) => (
                    <div key={adjustment.id} className="rounded-[14px] border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-zinc-950">{EMPLOYEE_ADJUSTMENT_LABELS[adjustment.type]}</p>
                        <p className="text-sm text-zinc-700">{formatDate(adjustment.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">{adjustment.comment || "Без комментария"}</p>
                      <p className="mt-3 text-xl font-semibold text-zinc-950">{formatMoney(adjustment.amountCents)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div>
            <EmployeeAdjustmentForm
              employeeId={employee.id}
              defaultType={activeTab === 'advances' ? 'ADVANCE' : activeTab === 'fines' ? 'FINE' : 'DEBT'}
            />
          </div>
        </div>
      )}

      {isScheduleEditorOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 px-4 py-4 sm:py-5"
          onClick={() => setIsScheduleEditorOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Редактирование графика работы"
            className="flex max-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/25"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-4 sm:px-5 py-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-zinc-950">График работы</h2>
                <p className="text-sm text-zinc-600">{scheduleSummary}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleEditorOpen(false)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Закрыть
              </button>
            </div>

            <div className="overflow-y-auto px-4 sm:px-5 py-5">
              <EmployeeScheduleEditor
                value={schedule}
                onChange={setSchedule}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-4 sm:px-5 py-4">
              <button
                type="button"
                onClick={() => setSchedule(buildEditableSchedule(employee))}
                disabled={!hasUnsavedScheduleChanges}
                className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={!hasUnsavedScheduleChanges}
                className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Сохранить график
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
