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
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const weekendDays = Array.from({ length: daysInMonth }, (_, index): number => {
    const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
    return day.getDay() === 0 || day.getDay() === 6 ? 1 : 0;
  }).reduce((sum, value) => sum + value, 0);
  const freeDays = Math.max(daysInMonth - monthScheduleStats.days, 0);
  const averageHours = monthScheduleStats.days > 0
    ? formatHours(monthScheduleStats.hours / monthScheduleStats.days)
    : "0";

  return (
    <section className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
      <div className="flex flex-col gap-3 rounded-[18px] border border-red-950/10 bg-white/82 p-4 shadow-sm shadow-red-950/5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">График работы</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Календарь смен</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
            Рабочие дни подсвечены красным, выходные и свободные даты остаются спокойными.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-red-800 px-5 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 sm:text-sm"
        >
          Изменить
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(24rem,0.95fr)_minmax(18rem,0.75fr)]">
        <div className="rounded-[20px] border border-red-950/10 bg-[linear-gradient(180deg,#fffdf8_0%,#fff4f2_100%)] p-3 shadow-sm shadow-red-950/5 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white/90 text-base font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              aria-label="Предыдущий месяц"
            >
              ←
            </button>
            <div className="rounded-full border border-red-950/10 bg-white/86 px-5 py-2 text-sm font-semibold capitalize text-zinc-950 shadow-sm shadow-red-950/5">
              {monthTitle}
            </div>
            <button
              type="button"
              onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white/90 text-base font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              aria-label="Следующий месяц"
            >
              →
            </button>
          </div>

          <div className="mt-4 rounded-[20px] bg-white/84 p-3 ring-1 ring-white/70 sm:p-4">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {CALENDAR_WEEKDAYS.map((weekday) => (
                <div key={weekday} className="py-1 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                  {weekday}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square rounded-full" />;
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
                    className={`flex aspect-square min-h-10 items-center justify-center rounded-[14px] text-sm font-semibold transition ${
                      isWorkingDay
                        ? "bg-red-800 text-white shadow-sm shadow-red-950/20 hover:bg-red-900"
                        : isWeekend
                          ? "bg-zinc-100/80 text-zinc-400 hover:bg-zinc-100"
                          : "bg-transparent text-zinc-700 hover:bg-white"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <ScheduleStatCard label="Рабочие дни" value={`${monthScheduleStats.days} дн.`} hint={`${formatHours(monthScheduleStats.hours)} ч за месяц`} tone="strong" />
          <ScheduleStatCard label="Свободные дни" value={`${freeDays} дн.`} hint={`${weekendDays} календарных выходных`} />
          <ScheduleStatCard label="Средняя смена" value={`${averageHours} ч`} hint="По отмеченным рабочим дням" />
          <div className="rounded-[18px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Легенда</p>
            <div className="mt-3 space-y-2 text-xs font-medium text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-800" />
                <span>Рабочий день</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-zinc-100 ring-1 ring-zinc-200" />
                <span>Выходной или свободный день</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ScheduleStatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "strong";
}) {
  return (
    <div className={`rounded-[18px] border p-4 shadow-sm shadow-red-950/5 ${
      tone === "strong"
        ? "border-red-800/20 bg-red-800 text-white"
        : "border-red-950/10 bg-white/84 text-zinc-950"
    }`}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
        tone === "strong" ? "text-white/70" : "text-red-800/55"
      }`}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold leading-none">{value}</p>
      <p className={`mt-2 text-xs leading-5 ${tone === "strong" ? "text-white/74" : "text-zinc-500"}`}>{hint}</p>
    </div>
  );
}
