"use client";

import { useMemo, useState } from "react";
import {
  CALENDAR_WEEKDAYS,
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

const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 0] as const;

function getInitialMonth(schedule: EmployeeSchedule) {
  const firstDateKey = Object.keys(schedule.days).sort()[0];

  if (!firstDateKey) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const firstDate = parseScheduleDateKey(firstDateKey);
  return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
}

function sanitizeHours(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(24, Math.max(0, value));
}

export function EmployeeScheduleEditor({ value, onChange }: EmployeeScheduleEditorProps) {
  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(value));
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [templateHours, setTemplateHours] = useState<number[]>(
    Array.from({ length: value.shiftsPerDay }, () => 8),
  );

  const totalStats = useMemo(() => getScheduleStats(value), [value]);
  const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const calendarDays = useMemo(() => getCalendarGridDays(currentMonth), [currentMonth]);
  const resolvedTemplateHours = useMemo(
    () => Array.from({ length: value.shiftsPerDay }, (_, index) => templateHours[index] ?? templateHours[0] ?? 8),
    [templateHours, value.shiftsPerDay],
  );

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

  const createTemplateDaySchedule = () =>
    createDaySchedule(value.shiftsPerDay, resolvedTemplateHours.map((hours) => sanitizeHours(hours)));

  const toggleDay = (day: Date) => {
    const dateKey = formatScheduleDateKey(day);

    updateSchedule((next) => {
      if (next.days[dateKey]) {
        delete next.days[dateKey];
      } else {
        next.days[dateKey] = createTemplateDaySchedule();
      }

      return next;
    });
  };

  const updateShiftHours = (dateKey: string, shiftIndex: number, hours: number) => {
    updateSchedule((next) => {
      const daySchedule = next.days[dateKey];

      if (!daySchedule) {
        return next;
      }

      daySchedule.shifts[shiftIndex] = {
        hours: sanitizeHours(hours),
      };

      return next;
    });
  };

  const setShiftsPerDay = (shiftsPerDay: EmployeeSchedule["shiftsPerDay"]) => {
    updateSchedule((next) => {
      next.shiftsPerDay = shiftsPerDay;

      for (const day of Object.values(next.days)) {
        day.shifts = Array.from({ length: shiftsPerDay }, (_, index) => ({
          hours: day.shifts[index]?.hours ?? day.shifts[0]?.hours ?? 8,
        }));
      }

      return next;
    });
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

        next.days[formatScheduleDateKey(day)] = createTemplateDaySchedule();
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
    <div className="space-y-5 rounded-3xl border border-zinc-200 bg-zinc-50/70 p-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-900">Календарь смен</p>
          <p className="text-sm text-zinc-600">
            Отмечай рабочие дни в календаре, задавай часы сразу для группы дней недели и при необходимости
            поправляй отдельные даты вручную.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-100 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Всего в графике</p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">
              {totalStats.totalDays} дн. / {formatHours(totalStats.totalHours)} ч
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-100 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Текущий месяц</p>
            <p className="mt-1 text-sm font-semibold text-zinc-950">
              {currentMonthStats.days} дн. / {formatHours(currentMonthStats.hours)} ч
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900">Количество смен в день</p>
            <div className="flex gap-2">
              {[1, 2].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setShiftsPerDay(count as EmployeeSchedule["shiftsPerDay"])}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    value.shiftsPerDay === count
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  {count} {count === 1 ? "смена" : "смены"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900">Часы для шаблона месяца</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {resolvedTemplateHours.map((hours, index) => (
                <label key={index} className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Смена {index + 1}
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-zinc-300 px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={hours}
                      onChange={(event) => {
                        const nextHours = sanitizeHours(Number(event.target.value));
                        setTemplateHours((prev) => {
                          const next = Array.from(
                            { length: value.shiftsPerDay },
                            (_, currentIndex) => prev[currentIndex] ?? prev[0] ?? 8,
                          );
                          next[index] = nextHours;
                          return next;
                        });
                      }}
                      className="w-full bg-transparent text-sm font-medium text-zinc-950 outline-none"
                    />
                    <span className="text-xs text-zinc-500">ч</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-zinc-900">Дни недели для массового заполнения</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWeekdays([1, 2, 3, 4, 5])}
                  className="rounded-2xl border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500"
                >
                  Будни
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWeekdays([6, 0])}
                  className="rounded-2xl border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500"
                >
                  Выходные
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWeekdays([...WEEKDAY_NUMBERS])}
                  className="rounded-2xl border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500"
                >
                  Все
                </button>
              </div>
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
                    className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
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

            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={applyTemplateToSelectedWeekdays}
                className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Заполнить месяц
              </button>
              <button
                type="button"
                onClick={clearSelectedWeekdays}
                className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-500"
              >
                Снять выбранные дни
              </button>
              <button
                type="button"
                onClick={clearCurrentMonth}
                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Очистить месяц
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              className="rounded-2xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50"
            >
              ← Назад
            </button>
            <h3 className="text-base font-semibold capitalize text-zinc-950">{monthTitle}</h3>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              className="rounded-2xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50"
            >
              Вперёд →
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[52rem]">
              <div className="grid grid-cols-7 gap-2">
                {CALENDAR_WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    className="rounded-2xl bg-zinc-100 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  >
                    {weekday}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="min-h-[9.5rem] rounded-3xl bg-zinc-50" />;
                  }

                  const dateKey = formatScheduleDateKey(day);
                  const daySchedule = value.days[dateKey];
                  const isSelected = Boolean(daySchedule);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                  return (
                    <div
                      key={dateKey}
                      className={`min-h-[9.5rem] rounded-3xl border p-3 transition ${
                        isSelected
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                          : isWeekend
                            ? "border-zinc-200 bg-zinc-50 text-zinc-950"
                            : "border-zinc-200 bg-white text-zinc-950"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className="flex w-full items-start justify-between gap-2 text-left"
                      >
                        <div>
                          <span className="block text-lg font-semibold">{day.getDate()}</span>
                          <span
                            className={`text-xs ${
                              isSelected ? "text-white/70" : "text-zinc-500"
                            }`}
                          >
                            {isSelected ? "Рабочий день" : "Выходной"}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                            isSelected ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {isSelected ? "Убрать" : "Добавить"}
                        </span>
                      </button>

                      {isSelected ? (
                        <div className="mt-4 space-y-2">
                          {daySchedule?.shifts.map((shift, shiftIndex) => (
                            <label
                              key={`${dateKey}-${shiftIndex}`}
                              className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 ${
                                isSelected ? "bg-white/10" : "bg-zinc-50"
                              }`}
                            >
                              <span className="text-xs font-medium uppercase tracking-[0.14em]">
                                Смена {shiftIndex + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  value={shift.hours}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={(event) =>
                                    updateShiftHours(dateKey, shiftIndex, Number(event.target.value))
                                  }
                                  className={`w-16 rounded-xl border px-2 py-1 text-right text-sm font-medium outline-none ${
                                    isSelected
                                      ? "border-white/15 bg-white text-zinc-950"
                                      : "border-zinc-300 bg-white text-zinc-950"
                                  }`}
                                />
                                <span className={`text-xs ${isSelected ? "text-white/70" : "text-zinc-500"}`}>
                                  ч
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-xs leading-5 text-zinc-500">
                          Нажми на карточку, чтобы отметить рабочий день и подставить часы из шаблона месяца.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
