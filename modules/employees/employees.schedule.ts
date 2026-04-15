import type {
  DaySchedule,
  EmployeeSchedule,
  EmployeeScheduleLegacy,
} from "@/modules/employees/employees.types";

const LEGACY_WEEKDAY_TO_INDEX: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

export const CALENDAR_WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

function isEmployeeSchedule(
  schedule: EmployeeSchedule | EmployeeScheduleLegacy,
): schedule is EmployeeSchedule {
  return "shiftsPerDay" in schedule;
}

function cloneDaySchedule(day: DaySchedule): DaySchedule {
  return {
    shifts: day.shifts.map((shift) => ({ hours: shift.hours })),
  };
}

export function cloneEmployeeSchedule(schedule: EmployeeSchedule): EmployeeSchedule {
  return {
    shiftsPerDay: schedule.shiftsPerDay,
    days: Object.fromEntries(
      Object.entries(schedule.days).map(([dateKey, day]) => [dateKey, cloneDaySchedule(day)]),
    ),
  };
}

export function formatScheduleDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseScheduleDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getMonthDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));
}

export function getCalendarGridDays(currentMonth: Date) {
  const monthDays = getMonthDays(currentMonth);
  const leadingEmptyDays = (monthDays[0]?.getDay() ?? 1) === 0
    ? 6
    : (monthDays[0]?.getDay() ?? 1) - 1;

  const grid: Array<Date | null> = [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...monthDays,
  ];

  const trailingEmptyDays = (7 - (grid.length % 7 || 7)) % 7;
  return [
    ...grid,
    ...Array.from({ length: trailingEmptyDays }, () => null),
  ];
}

export function createDaySchedule(
  shiftsPerDay: EmployeeSchedule["shiftsPerDay"],
  hoursTemplate?: number[],
): DaySchedule {
  return {
    shifts: Array.from({ length: shiftsPerDay }, (_, index) => ({
      hours: hoursTemplate?.[index] ?? hoursTemplate?.[0] ?? 8,
    })),
  };
}

export function normalizeEmployeeSchedule(
  schedule: EmployeeSchedule | EmployeeScheduleLegacy | null,
  referenceDate = new Date(),
): EmployeeSchedule {
  if (!schedule) {
    return { shiftsPerDay: 1, days: {} };
  }

  if (isEmployeeSchedule(schedule)) {
    return cloneEmployeeSchedule(schedule);
  }

  const days: Record<string, DaySchedule> = {};

  for (const date of getMonthDays(referenceDate)) {
    const matchedEntry = Object.entries(schedule).find(([dayName]) => {
      return LEGACY_WEEKDAY_TO_INDEX[dayName.toLowerCase()] === date.getDay();
    });

    if (!matchedEntry) {
      continue;
    }

    days[formatScheduleDateKey(date)] = createDaySchedule(1, [matchedEntry[1]]);
  }

  return {
    shiftsPerDay: 1,
    days,
  };
}

export function getScheduleStats(schedule: EmployeeSchedule | EmployeeScheduleLegacy | null) {
  const normalized = normalizeEmployeeSchedule(schedule);
  const totalDays = Object.keys(normalized.days).length;
  const totalHours = Object.values(normalized.days).reduce((sum, day) => {
    return sum + day.shifts.reduce((daySum, shift) => daySum + shift.hours, 0);
  }, 0);

  return {
    totalDays,
    totalHours,
    shiftsPerDay: normalized.shiftsPerDay,
  };
}

export function formatHours(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatScheduleSummary(schedule: EmployeeSchedule | EmployeeScheduleLegacy | null) {
  const { totalDays, totalHours, shiftsPerDay } = getScheduleStats(schedule);

  if (!totalDays) {
    return "График не задан";
  }

  const dayWord =
    totalDays % 10 === 1 && totalDays % 100 !== 11
      ? "день"
      : totalDays % 10 >= 2 && totalDays % 10 <= 4 && (totalDays % 100 < 10 || totalDays % 100 >= 20)
        ? "дня"
        : "дней";

  const shiftLabel = shiftsPerDay === 1 ? "1 смена" : "2 смены";

  return `${totalDays} ${dayWord} • ${formatHours(totalHours)} ч • ${shiftLabel} в день`;
}
