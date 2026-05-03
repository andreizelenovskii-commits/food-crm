import {
  clampScheduleHours,
  parseScheduleDateKey,
} from "@/modules/employees/employees.schedule";
import type { EmployeeSchedule } from "@/modules/employees/employees.types";

export function getInitialMonth(schedule: EmployeeSchedule) {
  const firstDateKey = Object.keys(schedule.days).sort()[0];

  if (!firstDateKey) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const firstDate = parseScheduleDateKey(firstDateKey);
  return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
}

export function getDayHours(schedule: EmployeeSchedule, dateKey: string) {
  return clampScheduleHours(schedule.days[dateKey]?.shifts[0]?.hours ?? 8);
}

export function formatPopupDate(dateKey: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(parseScheduleDateKey(dateKey));
}
