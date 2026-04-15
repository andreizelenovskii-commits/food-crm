"use client";

import { useState } from "react";
import { updateEmployeeAction } from "@/modules/employees/employees.actions";
import { EmployeeAdjustmentForm } from "@/modules/employees/components/employee-adjustment-form";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";
import { EmployeeScheduleEditor } from "@/modules/employees/components/employee-schedule-editor";
import { EMPLOYEE_ROLES, EMPLOYEE_ADJUSTMENT_LABELS, type EmployeeProfile, type EmployeeAdjustment, type EmployeeSchedule, type EmployeeScheduleLegacy, type DaySchedule } from "@/modules/employees/employees.types";

function formatMoney(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".00", "")} ₽`;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

// Convert legacy schedule format to new format
function convertLegacySchedule(legacy: EmployeeScheduleLegacy): EmployeeSchedule {
  const days: Record<string, DaySchedule> = {};
  const weekDayMap: Record<string, number> = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0
  };

  // Get current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  Object.entries(legacy).forEach(([dayName, hours]) => {
    const weekDay = weekDayMap[dayName.toLowerCase()];
    if (weekDay !== undefined) {
      // Find all dates in current month that match this weekday
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month, day);
        if (date.getMonth() === month && date.getDay() === weekDay) {
          const key = date.toISOString().split('T')[0];
          days[key] = {
            shifts: [{ hours }]
          };
        }
      }
    }
  });

  return {
    shiftsPerDay: 1,
    days
  };
}

// Convert schedule to display format
function formatScheduleForDisplay(schedule: EmployeeSchedule | EmployeeScheduleLegacy | null): string {
  if (!schedule) return 'График не задан';

  let normalizedSchedule: EmployeeSchedule;
  if ('shiftsPerDay' in schedule) {
    normalizedSchedule = schedule as EmployeeSchedule;
  } else {
    normalizedSchedule = convertLegacySchedule(schedule as EmployeeScheduleLegacy);
  }

  const selectedDays = Object.keys(normalizedSchedule.days);
  if (!selectedDays.length) return 'График не задан';

  // Group by day of week for display
  const dayGroups: Record<number, { dates: string[], totalHours: number }> = {};

  selectedDays.forEach(dateStr => {
    const date = new Date(dateStr);
    const weekDay = date.getDay();
    const totalHours = normalizedSchedule.days[dateStr].shifts.reduce((sum, shift) => sum + shift.hours, 0);

    if (!dayGroups[weekDay]) {
      dayGroups[weekDay] = { dates: [], totalHours: 0 };
    }
    dayGroups[weekDay].dates.push(dateStr);
    dayGroups[weekDay].totalHours += totalHours;
  });

  const weekDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const parts = Object.entries(dayGroups)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([weekDay, data]) => {
      const avgHours = Math.round(data.totalHours / data.dates.length);
      return `${weekDayNames[parseInt(weekDay)]} ${avgHours}ч`;
    });

  return parts.join(', ');
}

type Tab = 'general' | 'advances' | 'fines' | 'debts';

export function EmployeeProfileClient({ employee }: { employee: EmployeeProfile }) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [schedule, setSchedule] = useState<EmployeeSchedule>(() => {
    if (!employee.schedule) {
      return { shiftsPerDay: 1, days: {} };
    }
    return 'shiftsPerDay' in employee.schedule
      ? employee.schedule as EmployeeSchedule
      : convertLegacySchedule(employee.schedule as EmployeeScheduleLegacy);
  });
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [selectedRole, setSelectedRole] = useState(employee.role);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);

  const scheduleSummary = () => formatScheduleForDisplay(schedule);

  const handleSaveSchedule = async (newSchedule: EmployeeSchedule) => {
    setSchedule(newSchedule);
    setSchedulePickerOpen(false);

    // Save to database
    const formData = new FormData();
    formData.append('schedule', JSON.stringify(newSchedule));
    await updateEmployeeAction(employee.id, formData);
  };

  const handleSaveContacts = async (formData: FormData) => {
    await updateEmployeeAction(employee.id, formData);
    setIsEditingContacts(false);
  };

  const tabs = [
    { id: 'general' as Tab, label: 'Общая информация' },
    { id: 'advances' as Tab, label: 'Авансы' },
    { id: 'fines' as Tab, label: 'Штрафы' },
    { id: 'debts' as Tab, label: 'Долги' },
  ];

  const filteredAdjustments = employee.adjustments.filter((adj: EmployeeAdjustment) => {
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
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-950">Контакты</h2>
              {!isEditingContacts && (
                <button
                  type="button"
                  onClick={() => setIsEditingContacts(true)}
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
                    defaultValue={employee.name}
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
                      <span className="block text-sm font-medium text-zinc-900">{selectedRole}</span>
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
                                  setSelectedRole(role);
                                  setRolePickerOpen(false);
                                }}
                                className={`mb-2 flex w-full items-center justify-center rounded-2xl px-3 py-2 text-sm transition ${
                                  role === selectedRole
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
                  <input type="hidden" name="role" value={selectedRole} />
                </label>

                <label className="block space-y-2">
                  <span className="font-medium text-zinc-900">Телефон</span>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={employee.phone ?? ""}
                    placeholder="+7 900 123 45 67"
                    className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="font-medium text-zinc-900">Мессенджер</span>
                  <input
                    name="messenger"
                    type="url"
                    defaultValue={employee.messenger ?? ""}
                    placeholder="https://t.me/ivan или https://wa.me/79991234567"
                    className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                  />
                </label>

                <EmployeeDatePicker
                  name="birthDate"
                  label="Дата рождения"
                  defaultValue={employee.birthDate ? employee.birthDate.slice(0, 10) : ""}
                />

                <EmployeeDatePicker
                  name="hireDate"
                  label="Дата приема на работу"
                  defaultValue={employee.hireDate ? employee.hireDate.slice(0, 10) : ""}
                />

                <div className="block space-y-2">
                  <span className="font-medium text-zinc-900">График работы</span>
                  {schedulePickerOpen ? (
                    <EmployeeScheduleEditor
                      initialSchedule={schedule}
                      onSave={handleSaveSchedule}
                      onCancel={() => setSchedulePickerOpen(false)}
                    />
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSchedulePickerOpen(true)}
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950 transition hover:border-zinc-500 focus:border-zinc-500 focus:outline-none"
                      >
                        <span className="block text-sm font-medium text-zinc-900">{scheduleSummary()}</span>
                        <span className="text-xs text-zinc-500">Нажмите, чтобы отредактировать</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingContacts(false)}
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
                <p>
                  <span className="font-medium text-zinc-900">График работы:</span> {scheduleSummary()}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Показатели</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Авансы за месяц</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.advancesCents)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Штрафы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.finesCents)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Долги</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.debtCents)}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Часы работы</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.monthlyHours ?? "Не рассчитано"}</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">КПД</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.kpd}%</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'general' && (
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Рабочие результаты</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Заказы за месяц</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.ordersThisMonth}</p>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Зарплата на сегодня</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.salaryTodayCents)}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-600">
            Показатели пока считаются как заглушка. Логику расчёта можно подключить позже.
          </p>
        </section>
      )}

      {(activeTab === 'advances' || activeTab === 'fines' || activeTab === 'debts') && (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="mt-5 space-y-4">
              {filteredAdjustments.length === 0 ? (
                <p className="text-sm text-zinc-600">Пока нет записей.</p>
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
    </div>
  );
}