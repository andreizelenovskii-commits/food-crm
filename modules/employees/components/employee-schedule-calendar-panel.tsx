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
  return (
    <div className="space-y-4 rounded-[12px] border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onPreviousMonth} className="rounded-full border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50">
          ← Назад
        </button>
        <h3 className="text-base font-semibold capitalize text-zinc-950">{monthTitle}</h3>
        <button type="button" onClick={onNextMonth} className="rounded-full border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50">
          Вперёд →
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[20rem] sm:min-w-[34rem] lg:min-w-[40rem]">
          <div className="grid grid-cols-7 gap-2">
            {CALENDAR_WEEKDAYS.map((weekday) => (
              <div key={weekday} className="rounded-2xl bg-zinc-100 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                {weekday}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="min-h-[7.75rem] rounded-[22px] bg-zinc-50" />;
              }

              const dateKey = formatScheduleDateKey(day);
              const isWorkingDay = Boolean(schedule.days[dateKey]);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onOpenDay(dateKey)}
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
                    <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${isWorkingDay ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                      Изменить
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className={`text-sm font-semibold ${isWorkingDay ? "text-white" : "text-zinc-600"}`}>
                      {isWorkingDay ? `${getDayHours(schedule, dateKey)} ч` : "День свободен"}
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
  );
}
