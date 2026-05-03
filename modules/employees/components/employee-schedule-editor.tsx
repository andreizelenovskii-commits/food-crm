"use client";

import { useMemo, useState } from "react";
import {
  EmployeeDayScheduleDialog,
  type EmployeeDayDraft,
} from "@/modules/employees/components/employee-day-schedule-dialog";
import { EmployeeScheduleCalendarPanel } from "@/modules/employees/components/employee-schedule-calendar-panel";
import {
  formatPopupDate,
  getDayHours,
  getInitialMonth,
} from "@/modules/employees/components/employee-schedule-editor.helpers";
import { EmployeeScheduleTemplatePanel } from "@/modules/employees/components/employee-schedule-template-panel";
import {
  cloneEmployeeSchedule,
  createDaySchedule,
  formatHours,
  formatScheduleDateKey,
  getCalendarGridDays,
  getMonthDays,
  getScheduleStats,
} from "@/modules/employees/employees.schedule";
import type { EmployeeSchedule } from "@/modules/employees/employees.types";

type EmployeeScheduleEditorProps = {
  value: EmployeeSchedule;
  onChange: (schedule: EmployeeSchedule) => void;
};

export function EmployeeScheduleEditor({ value, onChange }: EmployeeScheduleEditorProps) {
  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(value));
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [templateHours, setTemplateHours] = useState(8);
  const [dayDraft, setDayDraft] = useState<EmployeeDayDraft | null>(null);

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
    <div className="space-y-5 rounded-[14px] border border-zinc-200 bg-zinc-50/80 p-4 sm:p-5">
      <div className="flex flex-col gap-3 rounded-[12px] border border-zinc-200 bg-white p-4 lg:flex-row lg:items-start lg:justify-between">
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
        <EmployeeScheduleTemplatePanel
          selectedWeekdays={selectedWeekdays}
          templateHours={templateHours}
          onTemplateHoursChange={setTemplateHours}
          onSetWeekdays={setSelectedWeekdays}
          onToggleWeekday={toggleWeekday}
          onApplyTemplate={applyTemplateToSelectedWeekdays}
          onClearSelected={clearSelectedWeekdays}
          onClearMonth={clearCurrentMonth}
        />
        <EmployeeScheduleCalendarPanel
          monthTitle={monthTitle}
          calendarDays={calendarDays}
          schedule={value}
          onPreviousMonth={() =>
            setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
          }
          onNextMonth={() =>
            setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
          }
          onOpenDay={openDayEditor}
        />
      </div>

      {dayDraft ? (
        <EmployeeDayScheduleDialog
          draft={dayDraft}
          title={formatPopupDate(dayDraft.dateKey)}
          onChange={setDayDraft}
          onClose={() => setDayDraft(null)}
          onApply={applyDayDraft}
        />
      ) : null}
    </div>
  );
}
