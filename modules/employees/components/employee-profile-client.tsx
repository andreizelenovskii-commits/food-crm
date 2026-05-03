"use client";

import { useState } from "react";
import { updateEmployeeAction } from "@/modules/employees/employees.actions";
import { EmployeeContactsCard } from "@/modules/employees/components/employee-contacts-card";
import {
  type ContactsDraft,
  buildContactsDraft,
  buildEditableSchedule,
  formatMonthLabel,
  getInitialPreviewMonth,
  getMonthKey,
  getMonthPreviewStats,
  isDateInMonth,
} from "@/modules/employees/components/employee-profile.helpers";
import {
  EmployeeAdjustmentsPanel,
  EmployeeMetricsPanel,
  EmployeeProfileTabs,
  EmployeeScheduleEditorDialog,
  EmployeeWorkResultsPanel,
  type EmployeeProfileTab,
} from "@/modules/employees/components/employee-profile-panels";
import { EmployeeSchedulePreview } from "@/modules/employees/components/employee-schedule-preview";
import { formatScheduleSummary } from "@/modules/employees/employees.schedule";
import {
  type EmployeeProfile,
  type EmployeeSchedule,
} from "@/modules/employees/employees.types";

export function EmployeeProfileClient({ employee }: { employee: EmployeeProfile }) {
  const showOrderMetrics = employee.role === "Повар" || employee.role === "Курьер";
  const initialSchedule = buildEditableSchedule(employee);
  const initialScheduleSerialized = Object.keys(initialSchedule.days).length
    ? JSON.stringify(initialSchedule)
    : "";
  const initialContactsDraft = buildContactsDraft(employee);
  const [activeTab, setActiveTab] = useState<EmployeeProfileTab>("general");
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
    { id: "general" as EmployeeProfileTab, label: "Общая информация" },
    { id: "advances" as EmployeeProfileTab, label: "Авансы" },
    { id: "fines" as EmployeeProfileTab, label: "Штрафы" },
    { id: "debts" as EmployeeProfileTab, label: "Долги" },
  ];

  const filteredAdjustments = selectedMonthAdjustments.filter((adj) => {
    switch (activeTab) {
      case "advances": return adj.type === "ADVANCE";
      case "fines": return adj.type === "FINE";
      case "debts": return adj.type === "DEBT";
      default: return false;
    }
  });

  return (
    <div className="space-y-5">
      <EmployeeProfileTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "general" && (
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

          <EmployeeMetricsPanel
            monthLabel={selectedMonthLabel}
            adjustmentTotals={selectedMonthAdjustmentTotals}
            scheduleStats={scheduleStats}
            showOrderMetrics={showOrderMetrics}
            ordersCount={selectedMonthOrderStats.ordersCount}
          />
        </div>
      )}

      {activeTab === "general" && (
        <EmployeeWorkResultsPanel
          monthLabel={selectedMonthLabel}
          showOrderMetrics={showOrderMetrics}
          ordersCount={selectedMonthOrderStats.ordersCount}
          revenueCents={selectedMonthOrderStats.revenueCents}
          scheduleStats={scheduleStats}
        />
      )}

      {activeTab !== "general" ? (
        <EmployeeAdjustmentsPanel
          employeeId={employee.id}
          activeTab={activeTab}
          tabLabel={tabs.find((tab) => tab.id === activeTab)?.label ?? ""}
          monthLabel={selectedMonthLabel}
          adjustments={filteredAdjustments}
        />
      ) : null}

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
    </div>
  );
}
