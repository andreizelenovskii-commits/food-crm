import { getDayHours } from "@/modules/employees/components/employee-schedule-editor.helpers";
import {
  CALENDAR_WEEKDAYS,
  formatScheduleDateKey,
} from "@/modules/employees/employees.schedule";
import type { EmployeeSchedule } from "@/modules/employees/employees.types";

export function EmployeeScheduleCalendarPanel({
  monthTitle,
  calendarDays,
  schedule,
  onPreviousMonth,
  onNextMonth,
  onOpenDay,
}: {
  monthTitle: string;
  calendarDays: Array<Date | null>;
  schedule: EmployeeSchedule;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onOpenDay: (dateKey: string) => void;
}) {
  const workingDays = calendarDays.filter((day) => {
    if (!day) return false;
    return Boolean(schedule.days[formatScheduleDateKey(day)]);
  }).length;

  return (
    <div className="space-y-3 rounded-[18px] border border-white/70 bg-white/78 p-3 shadow-sm shadow-red-950/5 backdrop-blur-xl sm:p-4">
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-[18px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff4f3_100%)] p-3 shadow-sm shadow-red-950/5">
        <button type="button" onClick={onPreviousMonth} className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-white/90 text-base font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white" aria-label="Предыдущий месяц">
          ←
        </button>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/55">Календарь смен</p>
          <h3 className="mt-1 truncate text-xl font-semibold capitalize text-zinc-950">{monthTitle}</h3>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/88 px-3 py-1.5 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5">
            <span className="h-2 w-2 rounded-full bg-red-800" />
            {workingDays} рабочих дн.
          </div>
        </div>
        <button type="button" onClick={onNextMonth} className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-white/90 text-base font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white" aria-label="Следующий месяц">
          →
        </button>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-red-950/10 bg-white/70 p-2">
        <div className="min-w-[38rem]">
          <div className="grid grid-cols-7 gap-1">
            {CALENDAR_WEEKDAYS.map((weekday) => (
              <div key={weekday} className="rounded-[10px] px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
                {weekday}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-16 rounded-[13px] border border-red-950/5 bg-white/45" />;
              }

              const dateKey = formatScheduleDateKey(day);
              const isWorkingDay = Boolean(schedule.days[dateKey]);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onOpenDay(dateKey)}
                  className={`group h-16 rounded-[13px] border px-2.5 py-2 text-left transition hover:-translate-y-0.5 ${
                    isWorkingDay
                      ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/20"
                      : isWeekend
                        ? "border-red-950/10 bg-red-50/35 text-zinc-950 hover:border-red-200 hover:bg-white"
                        : "border-red-950/10 bg-white text-zinc-950"
                  }`}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-base font-semibold leading-none">{day.getDate()}</span>
                      {isWorkingDay ? (
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {getDayHours(schedule, dateKey)} ч
                        </span>
                      ) : null}
                    </div>
                    <span className={`text-[11px] font-medium ${isWorkingDay ? "text-white/70" : "text-zinc-400 group-hover:text-red-800"}`}>
                      {isWorkingDay ? "Рабочий день" : "Выходной"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 px-1 text-xs font-medium text-zinc-500">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-800" />Рабочий день</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-50 ring-1 ring-red-100" />Выходной</span>
      </div>
    </div>
  );
}
