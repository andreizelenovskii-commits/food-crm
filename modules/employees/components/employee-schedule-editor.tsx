"use client";

import { useMemo, useState } from "react";
import {
  CALENDAR_WEEKDAYS,
  MAX_SCHEDULE_HOURS,
  MIN_SCHEDULE_HOURS,
  clampScheduleHours,
  cloneEmployeeSchedule,
  createDaySchedule,
  formatHours,
  formatScheduleDateKey,
  getCalendarGridDays,
  getMonthDays,
  getScheduleStats,
  parseScheduleDateKey,
} from "@/modules/employees/employees.schedule";
import type { EmployeeSchedule } from "@/modules/employees/employees.types";

type EmployeeScheduleEditorProps = {
  value: EmployeeSchedule;
  onChange: (schedule: EmployeeSchedule) => void;
};

type DayDraft = {
  dateKey: string;
  isWorkingDay: boolean;
  hours: number;
};

const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 0] as const;
const HOUR_OPTIONS = Array.from(
  { length: MAX_SCHEDULE_HOURS - MIN_SCHEDULE_HOURS + 1 },
  (_, index) => MIN_SCHEDULE_HOURS + index,
);

function getInitialMonth(schedule: EmployeeSchedule) {
  const firstDateKey = Object.keys(schedule.days).sort()[0];

  if (!firstDateKey) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const firstDate = parseScheduleDateKey(firstDateKey);
  return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
}

function getDayHours(schedule: EmployeeSchedule, dateKey: string) {
  return clampScheduleHours(schedule.days[dateKey]?.shifts[0]?.hours ?? 8);
}

function formatPopupDate(dateKey: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(parseScheduleDateKey(dateKey));
}

export function EmployeeScheduleEditor({ value, onChange }: EmployeeScheduleEditorProps) {
  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(value));
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [templateHours, setTemplateHours] = useState(8);
  const [dayDraft, setDayDraft] = useState<DayDraft | null>(null);

  const totalStats = useMemo(() => getScheduleStats(value), [value]);
  const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const calendarDays = useMemo(() => getCalendarGridDays(currentMonth), [currentMonth]);

  const currentMonthStats = useMemo(() => {
    return monthDays.reduce(
      (acc, day) => {
        const daySchedule = value.days[formatScheduleDateKey(day)];

        if (!daySchedule) {
          return acc;
        }

        return {
          days: acc.days + 1,
          hours: acc.hours + daySchedule.shifts.reduce((sum, shift) => sum + shift.hours, 0),
        };
      },
      { days: 0, hours: 0 },
    );
  }, [monthDays, value.days]);

  const updateSchedule = (updater: (schedule: EmployeeSchedule) => EmployeeSchedule) => {
    onChange(updater(cloneEmployeeSchedule(value)));
  };

  const openDayEditor = (dateKey: string) => {
    setDayDraft({
      dateKey,
      isWorkingDay: Boolean(value.days[dateKey]),
      hours: getDayHours(value, dateKey),
    });
  };

  const applyDayDraft = () => {
    if (!dayDraft) {
      return;
    }

    updateSchedule((next) => {
      if (dayDraft.isWorkingDay) {
        next.days[dayDraft.dateKey] = createDaySchedule(dayDraft.hours);
      } else {
        delete next.days[dayDraft.dateKey];
      }

      return next;
    });

    setDayDraft(null);
  };

  const toggleWeekday = (weekday: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(weekday)
        ? prev.filter((value) => value !== weekday)
        : [...prev, weekday].sort((left, right) => left - right),
    );
  };

  const applyTemplateToSelectedWeekdays = () => {
    if (!selectedWeekdays.length) {
      return;
    }

    updateSchedule((next) => {
      for (const day of monthDays) {
        if (!selectedWeekdays.includes(day.getDay())) {
          continue;
        }

        next.days[formatScheduleDateKey(day)] = createDaySchedule(templateHours);
      }

      return next;
    });
  };

  const clearSelectedWeekdays = () => {
    if (!selectedWeekdays.length) {
      return;
    }

    updateSchedule((next) => {
      for (const day of monthDays) {
        if (!selectedWeekdays.includes(day.getDay())) {
          continue;
        }

        delete next.days[formatScheduleDateKey(day)];
      }

      return next;
    });
  };

  const clearCurrentMonth = () => {
    updateSchedule((next) => {
      for (const day of monthDays) {
        delete next.days[formatScheduleDateKey(day)];
      }

      return next;
    });
  };

  const monthTitle = currentMonth.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 rounded-[28px] border border-zinc-200 bg-zinc-50/80 p-4 sm:p-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-zinc-200 bg-white p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">График работы</p>
          <p className="text-base font-semibold text-zinc-900">Рабочие дни по календарю</p>
          <p className="text-sm leading-6 text-zinc-600">
            Нажми на дату, чтобы отметить рабочий день, выбрать часы или оставить выходной.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Всего в графике</p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">
              {totalStats.totalDays} дн. / {formatHours(totalStats.totalHours)} ч
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Текущий месяц</p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">
              {currentMonthStats.days} дн. / {formatHours(currentMonthStats.hours)} ч
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-5 rounded-[24px] border border-zinc-200 bg-white p-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Шаблон месяца</p>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-900">Часы для выбранных дней</span>
              <select
                value={templateHours}
                onChange={(event) => setTemplateHours(clampScheduleHours(Number(event.target.value)))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              >
                {HOUR_OPTIONS.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} ч
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-900">Дни недели для массового заполнения</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedWeekdays([1, 2, 3, 4, 5])}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500"
              >
                Будни
              </button>
              <button
                type="button"
                onClick={() => setSelectedWeekdays([6, 0])}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500"
              >
                Выходные
              </button>
              <button
                type="button"
                onClick={() => setSelectedWeekdays([...WEEKDAY_NUMBERS])}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500"
              >
                Все
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {CALENDAR_WEEKDAYS.map((label, index) => {
                const weekday = WEEKDAY_NUMBERS[index];
                const isSelected = selectedWeekdays.includes(weekday);

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleWeekday(weekday)}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "bg-zinc-950 text-white"
                        : "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button
                type="button"
                onClick={applyTemplateToSelectedWeekdays}
                className="min-h-12 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Заполнить месяц
              </button>
              <button
                type="button"
                onClick={clearSelectedWeekdays}
                className="min-h-12 rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500"
              >
                Снять выбранные дни
              </button>
              <button
                type="button"
                onClick={clearCurrentMonth}
                className="min-h-12 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 sm:col-span-2 xl:col-span-1"
              >
                Очистить месяц
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              className="rounded-full border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50"
            >
              ← Назад
            </button>
            <h3 className="text-base font-semibold capitalize text-zinc-950">{monthTitle}</h3>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              className="rounded-full border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50"
            >
              Вперёд →
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[44rem]">
              <div className="grid grid-cols-7 gap-2">
                {CALENDAR_WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    className="rounded-2xl bg-zinc-100 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
                  >
                    {weekday}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="min-h-[7.75rem] rounded-[22px] bg-zinc-50" />;
                  }

                  const dateKey = formatScheduleDateKey(day);
                  const isWorkingDay = Boolean(value.days[dateKey]);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => openDayEditor(dateKey)}
                      className={`min-h-[7.75rem] rounded-[22px] border p-3 text-left transition ${
                        isWorkingDay
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                          : isWeekend
                            ? "border-zinc-200 bg-zinc-50 text-zinc-950"
                            : "border-zinc-200 bg-white text-zinc-950"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="block text-base font-semibold">{day.getDate()}</span>
                          <span className={`text-[11px] ${isWorkingDay ? "text-white/70" : "text-zinc-500"}`}>
                            {isWorkingDay ? "Рабочий день" : "Выходной"}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                            isWorkingDay ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          Изменить
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className={`text-sm font-semibold ${isWorkingDay ? "text-white" : "text-zinc-600"}`}>
                          {isWorkingDay ? `${getDayHours(value, dateKey)} ч` : "День свободен"}
                        </p>
                        <p className={`mt-1 text-[11px] leading-5 ${isWorkingDay ? "text-white/70" : "text-zinc-500"}`}>
                          {isWorkingDay
                            ? "Нажми, чтобы изменить часы или поставить выходной."
                            : "Нажми, чтобы отметить рабочий день."}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {dayDraft ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Дата</p>
                <h3 className="mt-1 text-lg font-semibold capitalize text-zinc-950">
                  {formatPopupDate(dayDraft.dateKey)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDayDraft(null)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDayDraft((prev) => (prev ? { ...prev, isWorkingDay: true } : prev))}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    dayDraft.isWorkingDay
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  Рабочий день
                </button>
                <button
                  type="button"
                  onClick={() => setDayDraft((prev) => (prev ? { ...prev, isWorkingDay: false } : prev))}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    !dayDraft.isWorkingDay
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  Выходной
                </button>
              </div>

              {dayDraft.isWorkingDay ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-900">Рабочие часы</span>
                  <select
                    value={dayDraft.hours}
                    onChange={(event) =>
                      setDayDraft((prev) =>
                        prev
                          ? { ...prev, hours: clampScheduleHours(Number(event.target.value)) }
                          : prev,
                      )
                    }
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                  >
                    {HOUR_OPTIONS.map((hours) => (
                      <option key={hours} value={hours}>
                        {hours} ч
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-6 text-zinc-600">
                  Этот день будет сохранён как выходной и исчезнет из списка рабочих дней.
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={applyDayDraft}
                className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Сохранить день
              </button>
              <button
                type="button"
                onClick={() => setDayDraft(null)}
                className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
