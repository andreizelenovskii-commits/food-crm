"use client";

import {
  CALENDAR_WEEKDAYS,
  formatHours,
  getCalendarGridDays,
} from "@/modules/employees/employees.schedule";
import type { EmployeeSchedule } from "@/modules/employees/employees.types";
import {
  formatMonthLabel,
  formatScheduleDateKey,
  getMonthPreviewStats,
} from "@/modules/employees/components/employee-profile.helpers";

export function EmployeeSchedulePreview({
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

      <div className="mt-4 max-w-[19.5rem] rounded-[14px] bg-[linear-gradient(180deg,#fffdf8_0%,#fff4f2_100%)] p-3 shadow-inner shadow-white/60 ring-1 ring-zinc-200/80 sm:max-w-[21rem]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-white hover:ring-zinc-300"
          >
            ←
          </button>
          <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold capitalize text-zinc-900 ring-1 ring-zinc-200/80">
            {monthTitle}
          </div>
          <button
            type="button"
            onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-white hover:ring-zinc-300"
          >
            →
          </button>
        </div>

        <div className="mt-3 rounded-[22px] bg-white/80 p-2 ring-1 ring-white/70">
          <div className="grid grid-cols-7 gap-1">
            {CALENDAR_WEEKDAYS.map((weekday) => (
              <div key={weekday} className="py-1 text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
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
                      ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
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
            <span className="h-2.5 w-2.5 rounded-full bg-red-800" />
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
