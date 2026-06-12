"use client";

import { useMemo, useState } from "react";
import {
  CALENDAR_WEEKDAYS,
  formatHours,
  formatScheduleDateKey,
  getCalendarGridDays,
  normalizeEmployeeSchedule,
} from "@/modules/employees/employees.schedule";
import type { Employee } from "@/modules/employees/employees.types";

type EmployeeTeamScheduleProps = {
  employees: Employee[];
};

type DayShift = {
  employee: Employee;
  hours: number;
};

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});
const dayFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", weekday: "long" });

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDayHours(employee: Employee, dateKey: string, month: Date) {
  const schedule = normalizeEmployeeSchedule(employee.schedule, month);
  const day = schedule.days[dateKey];

  if (!day) {
    return 0;
  }

  return day.shifts.reduce((sum, shift) => sum + shift.hours, 0);
}

function getDayShifts(employees: Employee[], date: Date, month: Date): DayShift[] {
  const dateKey = formatScheduleDateKey(date);

  return employees
    .map((employee) => ({
      employee,
      hours: getDayHours(employee, dateKey, month),
    }))
    .filter((shift) => shift.hours > 0)
    .sort((first, second) => second.hours - first.hours || first.employee.name.localeCompare(second.employee.name));
}

export function EmployeeTeamSchedule({ employees }: EmployeeTeamScheduleProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(getMonthStart(today));
  const [selectedDateKey, setSelectedDateKey] = useState(formatScheduleDateKey(today));
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const gridDays = useMemo(() => getCalendarGridDays(currentMonth), [currentMonth]);
  const selectedDate = useMemo(() => {
    const [year, month, day] = selectedDateKey.split("-").map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
  }, [selectedDateKey]);
  const selectedDayShifts = useMemo(
    () => getDayShifts(employees, selectedDate, currentMonth),
    [currentMonth, employees, selectedDate],
  );
  const monthRows = useMemo(() => {
    return employees
      .map((employee) => {
        const schedule = normalizeEmployeeSchedule(employee.schedule, currentMonth);
        const entries = Object.entries(schedule.days).filter(([dateKey]) => {
          const date = new Date(dateKey);
          return date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth();
        });
        const hours = entries.reduce((sum, [, day]) => {
          return sum + day.shifts.reduce((daySum, shift) => daySum + shift.hours, 0);
        }, 0);

        return {
          employee,
          days: entries.length,
          hours,
        };
      })
      .filter((row) => row.days > 0)
      .sort((first, second) => second.hours - first.hours || first.employee.name.localeCompare(second.employee.name));
  }, [currentMonth, employees]);
  const selectedHours = selectedDayShifts.reduce((sum, shift) => sum + shift.hours, 0);
  const monthHours = monthRows.reduce((sum, row) => sum + row.hours, 0);
  const workingDays = gridDays.filter((day) => day && getDayShifts(employees, day, currentMonth).length > 0).length;

  const changeMonth = (offset: number) => {
    setCurrentMonth((month) => {
      const nextMonth = new Date(month.getFullYear(), month.getMonth() + offset, 1);
      setSelectedDateKey(formatScheduleDateKey(nextMonth));
      return nextMonth;
    });
  };

  return (
    <>
      <section className="rounded-[22px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="foodlike-kicker">Рабочий график</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-zinc-950">
              Общий график команды
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
              Кто работает в выбранный день и сколько часов запланировано по команде.
            </p>
          </div>
          <button type="button" onClick={() => setIsScheduleOpen(true)} className="foodlike-button-primary shrink-0">
            Открыть график
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ScheduleMetric label="В выбранный день" value={selectedDayShifts.length} hint={`${formatHours(selectedHours)} ч`} />
          <ScheduleMetric label="Рабочих дней" value={workingDays} hint={monthFormatter.format(currentMonth)} />
          <ScheduleMetric label="Всего часов" value={formatHours(monthHours)} hint={`${monthRows.length} сотрудников`} />
        </div>
      </section>

      {isScheduleOpen ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-red-950/35 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setIsScheduleOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Общий рабочий график команды"
            className="relative flex h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[1500px] flex-col overflow-hidden rounded-[28px] border border-red-950/10 bg-[linear-gradient(180deg,#fff,rgba(255,248,248,0.98))] shadow-[0_30px_90px_rgba(69,10,10,0.32)] sm:h-[calc(100dvh-40px)] sm:w-[calc(100vw-40px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3 border-b border-red-950/10 bg-white/86 p-4 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="foodlike-kicker">Рабочий график</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
                  Общий график команды
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Смены, часы и нагрузка сотрудников за выбранный месяц.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-red-950/10 bg-white/80 p-1 shadow-sm shadow-red-950/5">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-red-900 transition hover:bg-red-50"
                  >
                    Назад
                  </button>
                  <span className="min-w-40 px-3 text-center text-sm font-semibold text-zinc-950">
                    {monthFormatter.format(currentMonth)}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-red-900 transition hover:bg-red-50"
                  >
                    Вперед
                  </button>
                </div>
                <button type="button" onClick={() => setIsScheduleOpen(false)} className="foodlike-button-secondary">
                  Закрыть
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <ScheduleMetric label="В выбранный день" value={selectedDayShifts.length} hint={`${formatHours(selectedHours)} ч`} />
                <ScheduleMetric label="Рабочих дней" value={workingDays} hint="В выбранном месяце" />
                <ScheduleMetric label="Всего часов" value={formatHours(monthHours)} hint={`${monthRows.length} сотрудников`} />
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
                <div className="rounded-[20px] border border-red-950/10 bg-white/82 p-3 shadow-sm shadow-red-950/5">
                  <div className="grid grid-cols-7 gap-2">
                    {CALENDAR_WEEKDAYS.map((weekday) => (
                      <div key={weekday} className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-red-800/60">
                        {weekday}
                      </div>
                    ))}
                    {gridDays.map((day, index) => {
                      if (!day) return <div key={`empty-${index}`} className="min-h-24 rounded-[16px] bg-red-50/25" />;
                      const dateKey = formatScheduleDateKey(day);
                      const shifts = getDayShifts(employees, day, currentMonth);
                      const hours = shifts.reduce((sum, shift) => sum + shift.hours, 0);
                      const isSelected = dateKey === selectedDateKey;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => setSelectedDateKey(dateKey)}
                          className={[
                            "min-h-24 rounded-[16px] border p-2 text-left transition",
                            isSelected
                              ? "border-red-900 bg-red-800 text-white shadow-lg shadow-red-950/18"
                              : "border-red-950/10 bg-white/78 text-zinc-950 shadow-sm shadow-red-950/5 hover:-translate-y-0.5 hover:border-red-900/20",
                          ].join(" ")}
                        >
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold">{day.getDate()}</span>
                            {shifts.length ? (
                              <span className={isSelected ? "text-xs font-semibold text-white/85" : "text-xs font-semibold text-red-800"}>
                                {formatHours(hours)} ч
                              </span>
                            ) : null}
                          </span>
                          <span className={isSelected ? "mt-3 block text-xs text-white/78" : "mt-3 block text-xs text-zinc-500"}>
                            {shifts.length ? `${shifts.length} в смене` : "Выходной"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[20px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5">
                    <p className="foodlike-kicker">День</p>
                    <h3 className="mt-1 text-xl font-semibold text-zinc-950">{dayFormatter.format(selectedDate)}</h3>
                    <div className="mt-4 space-y-2">
                      {selectedDayShifts.length ? selectedDayShifts.map((shift) => (
                        <div key={shift.employee.id} className="flex items-center justify-between gap-3 rounded-[16px] border border-red-950/10 bg-white/80 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-950">{shift.employee.name}</p>
                            <p className="text-xs text-zinc-500">{shift.employee.role}</p>
                          </div>
                          <span className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-900">{formatHours(shift.hours)} ч</span>
                        </div>
                      )) : (
                        <p className="rounded-[16px] border border-dashed border-red-950/14 bg-red-50/30 p-4 text-sm leading-6 text-zinc-500">
                          На этот день смены не проставлены.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5">
                    <p className="foodlike-kicker">Нагрузка месяца</p>
                    <div className="mt-3 space-y-2">
                      {monthRows.length ? monthRows.slice(0, 8).map((row) => (
                        <div key={row.employee.id} className="flex items-center justify-between gap-3 border-b border-red-950/8 py-2 last:border-b-0">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-950">{row.employee.name}</p>
                            <p className="text-xs text-zinc-500">{row.days} раб. дн.</p>
                          </div>
                          <span className="text-sm font-semibold text-zinc-950">{formatHours(row.hours)} ч</span>
                        </div>
                      )) : <p className="text-sm leading-6 text-zinc-500">В этом месяце нет заполненных графиков.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function ScheduleMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/82 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
    </div>
  );
}
