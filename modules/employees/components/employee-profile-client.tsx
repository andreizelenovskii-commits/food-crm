"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { updateEmployeeAction } from "@/modules/employees/employees.actions";
import { EmployeeAdjustmentForm } from "@/modules/employees/components/employee-adjustment-form";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";
import { EmployeeScheduleEditor } from "@/modules/employees/components/employee-schedule-editor";
import {
  CALENDAR_WEEKDAYS,
  formatHours,
  formatScheduleDateKey,
  formatScheduleSummary,
  getCalendarGridDays,
  normalizeEmployeeSchedule,
  parseScheduleDateKey,
} from "@/modules/employees/employees.schedule";
import {
  EMPLOYEE_ADJUSTMENT_LABELS,
  EMPLOYEE_ROLES,
  type EmployeeAdjustment,
  type EmployeeProfile,
  type EmployeeSchedule,
} from "@/modules/employees/employees.types";

function formatMoney(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".00", "")} ₽`;
}

function parseDisplayDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
  }

  return new Date(value);
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDisplayDate(value));

function buildEditableSchedule(employee: EmployeeProfile): EmployeeSchedule {
  return normalizeEmployeeSchedule(employee.schedule);
}

function getInitialPreviewMonth(schedule: EmployeeSchedule) {
  const firstDateKey = Object.keys(schedule.days).sort()[0];

  if (!firstDateKey) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const firstDate = parseScheduleDateKey(firstDateKey);
  return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  })
    .format(value)
    .replace(/\s*г\.?$/, "");
}

function getMonthKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function isDateInMonth(dateValue: string, month: Date) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
}

function getMonthPreviewStats(schedule: EmployeeSchedule, month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  return Object.entries(schedule.days).reduce(
    (acc, [dateKey, day]) => {
      const date = parseScheduleDateKey(dateKey);

      if (date.getFullYear() !== year || date.getMonth() !== monthIndex) {
        return acc;
      }

      return {
        days: acc.days + 1,
        hours: acc.hours + day.shifts.reduce((sum, shift) => sum + shift.hours, 0),
      };
    },
    { days: 0, hours: 0 },
  );
}

function EmployeeSchedulePreview({
  schedule,
  currentMonth,
  onMonthChange,
  onEdit,
}: {
  schedule: EmployeeSchedule;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  onEdit: () => void;
}) {
  const calendarDays = getCalendarGridDays(currentMonth);
  const monthTitle = formatMonthLabel(currentMonth);
  const monthScheduleStats = getMonthPreviewStats(schedule, currentMonth);

  return (
    <section className="rounded-[30px] border border-zinc-200 bg-white/90 p-5 shadow-sm shadow-zinc-950/5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">График работы</p>
          <h2 className="text-lg font-semibold text-zinc-950">Календарь смен</h2>
          <p className="text-xs leading-5 text-zinc-600 sm:text-sm">
            Рабочие дни подсвечены. Для изменения графика открой полный календарь.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-500 hover:bg-zinc-50 sm:text-sm"
        >
          Изменить
        </button>
      </div>

      <div className="mt-4 max-w-[19.5rem] rounded-[28px] bg-[linear-gradient(180deg,#fffdf8_0%,#f4efe5_100%)] p-3 shadow-inner shadow-white/60 ring-1 ring-zinc-200/80 sm:max-w-[21rem]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
            }
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-white hover:ring-zinc-300"
          >
            ←
          </button>
          <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold capitalize text-zinc-900 ring-1 ring-zinc-200/80">
            {monthTitle}
          </div>
          <button
            type="button"
            onClick={() =>
              onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
            }
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-white hover:ring-zinc-300"
          >
            →
          </button>
        </div>

        <div className="mt-3 rounded-[22px] bg-white/80 p-2 ring-1 ring-white/70">
          <div className="grid grid-cols-7 gap-1">
            {CALENDAR_WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="py-1 text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-400"
              >
                {weekday}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-8 rounded-full" />;
              }

              const dateKey = formatScheduleDateKey(day);
              const daySchedule = schedule.days[dateKey];
              const isWorkingDay = Boolean(daySchedule);
              const totalHours = daySchedule?.shifts.reduce((sum, shift) => sum + shift.hours, 0) ?? 0;
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={onEdit}
                  title={isWorkingDay ? `${day.getDate()} • ${totalHours} ч` : `${day.getDate()} • Выходной`}
                  className={`flex h-8 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                    isWorkingDay
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/20"
                      : isWeekend
                        ? "text-zinc-350 bg-zinc-100/70 text-zinc-400"
                        : "bg-transparent text-zinc-700 hover:bg-white"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-full bg-white/70 px-3 py-2 text-[11px] text-zinc-600 ring-1 ring-zinc-200/70">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span>Рабочий день</span>
          </div>
          <span className="font-medium text-zinc-800">
            {monthScheduleStats.days} дн. • {formatHours(monthScheduleStats.hours)} ч
          </span>
        </div>
      </div>
    </section>
  );
}

type Tab = 'general' | 'advances' | 'fines' | 'debts';

type ContactsDraft = {
  name: string;
  role: EmployeeProfile["role"];
  phone: string;
  messenger: string;
  birthDate: string;
  hireDate: string;
};

function buildContactsDraft(employee: EmployeeProfile): ContactsDraft {
  return {
    name: employee.name,
    role: employee.role,
    phone: employee.phone ?? "",
    messenger: employee.messenger ?? "",
    birthDate: employee.birthDate ? employee.birthDate.slice(0, 10) : "",
    hireDate: employee.hireDate ? employee.hireDate.slice(0, 10) : "",
  };
}

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
    <div className="space-y-6">
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
        <div className="grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-950">Контакты</h2>
                {!isEditingContacts && (
                  <button
                    type="button"
                    onClick={() => {
                      resetContactsDraft();
                      setIsEditingContacts(true);
                    }}
                    className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    Изменить данные
                  </button>
                )}
              </div>

              {isEditingContacts ? (
                <form
                  action={handleSaveContacts}
                  className="mt-4 space-y-4 text-sm text-zinc-700"
                >
                  <label className="block space-y-2">
                    <span className="font-medium text-zinc-900">Имя</span>
                    <input
                      name="name"
                      type="text"
                      value={contactsDraft.name}
                      onChange={(event) =>
                        setContactsDraft((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="font-medium text-zinc-900">Роль</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setRolePickerOpen((open) => !open)}
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950 transition hover:border-zinc-500 focus:border-zinc-500 focus:outline-none"
                      >
                        <span className="block text-sm font-medium text-zinc-900">{contactsDraft.role}</span>
                        <span className="text-xs text-zinc-500">Нажмите, чтобы выбрать</span>
                      </button>

                      {rolePickerOpen && (
                        <div className="absolute left-0 top-full z-20 mt-3 w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg">
                          <div className="p-3">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Выберите роль</div>
                            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-zinc-100">
                              {EMPLOYEE_ROLES.map((role) => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => {
                                    setContactsDraft((prev) => ({ ...prev, role }));
                                    setRolePickerOpen(false);
                                  }}
                                  className={`mb-2 flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm transition ${
                                    role === contactsDraft.role
                                      ? 'bg-zinc-950 text-white'
                                      : 'bg-white text-zinc-950 hover:bg-zinc-100'
                                  }`}
                                >
                                  {role}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <input type="hidden" name="role" value={contactsDraft.role} />
                  </label>

                  <label className="block space-y-2">
                    <span className="font-medium text-zinc-900">Телефон</span>
                    <PhoneInput
                      name="phone"
                      value={contactsDraft.phone}
                      onChange={(phone) =>
                        setContactsDraft((prev) => ({ ...prev, phone }))
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="font-medium text-zinc-900">Мессенджер</span>
                    <input
                      name="messenger"
                      type="url"
                      value={contactsDraft.messenger}
                      onChange={(event) =>
                        setContactsDraft((prev) => ({ ...prev, messenger: event.target.value }))
                      }
                      placeholder="https://t.me/ivan или https://wa.me/79991234567"
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                    />
                  </label>

                  <EmployeeDatePicker
                    name="birthDate"
                    label="Дата рождения"
                    value={contactsDraft.birthDate}
                    onChange={(value) => setContactsDraft((prev) => ({ ...prev, birthDate: value }))}
                  />

                  <EmployeeDatePicker
                    name="hireDate"
                    label="Дата приема на работу"
                    value={contactsDraft.hireDate}
                    onChange={(value) => setContactsDraft((prev) => ({ ...prev, hireDate: value }))}
                  />

                  <input type="hidden" name="schedule" value={serializedSchedule} />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                    >
                      Сохранить изменения
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetContactsDraft();
                        setIsEditingContacts(false);
                      }}
                      className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-zinc-700">
                  <p>
                    <span className="font-medium text-zinc-900">Имя:</span> {employee.name}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Роль:</span> {employee.role}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Телефон:</span> {employee.phone || "Не указан"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Мессенджер:</span>{" "}
                    {employee.messenger ? (
                      <a href={employee.messenger} target="_blank" rel="noopener noreferrer" className="text-zinc-950 hover:text-zinc-700 underline">
                        {employee.messenger}
                      </a>
                    ) : (
                      "Не указан"
                    )}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Дата рождения:</span>{" "}
                    {employee.birthDate ? formatDate(employee.birthDate) : "Не указана"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Дата приема на работу:</span>{" "}
                    {employee.hireDate ? formatDate(employee.hireDate) : "Не указана"}
                  </p>
                </div>
              )}
            </section>

            <EmployeeSchedulePreview
              schedule={schedule}
              currentMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onEdit={() => setIsScheduleEditorOpen(true)}
            />
          </div>

          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-zinc-950">Показатели</h2>
              <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                {selectedMonthLabel}
              </p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Авансы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthAdjustmentTotals.ADVANCE)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Штрафы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthAdjustmentTotals.FINE)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Долги</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthAdjustmentTotals.DEBT)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Рабочие часы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatHours(scheduleStats.hours)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Рабочие дни</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{scheduleStats.days}</p>
              </div>
              {showOrderMetrics ? (
                <div className="rounded-3xl bg-zinc-50 p-4">
                  <p className="text-sm text-zinc-500">Заказы за месяц</p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950">{selectedMonthOrderStats.ordersCount}</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'general' && (
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-950">Рабочие результаты</h2>
            <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
              {selectedMonthLabel}
            </p>
          </div>
          <div className={`mt-5 grid gap-4 ${showOrderMetrics ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
            {showOrderMetrics ? (
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Заказы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{selectedMonthOrderStats.ordersCount}</p>
              </div>
            ) : null}
            {showOrderMetrics ? (
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Сумма заказов</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(selectedMonthOrderStats.revenueCents)}</p>
              </div>
            ) : null}
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">График на месяц</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{scheduleStats.days} дн.</p>
              <p className="mt-1 text-sm text-zinc-500">{formatHours(scheduleStats.hours)} ч</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-600">
            Показатели на экране синхронизированы с месяцем, который выбран в календаре сотрудника.
          </p>
        </section>
      )}

      {(activeTab === 'advances' || activeTab === 'fines' || activeTab === 'debts') && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
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
                    <div key={adjustment.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
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
          className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 px-4 py-6"
          onClick={() => setIsScheduleEditorOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Редактирование графика работы"
            className="flex max-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/25"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5">
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

            <div className="overflow-y-auto px-6 py-5">
              <EmployeeScheduleEditor
                value={schedule}
                onChange={setSchedule}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-6 py-4">
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
