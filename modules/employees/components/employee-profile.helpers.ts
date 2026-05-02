import {
  formatScheduleDateKey,
  normalizeEmployeeSchedule,
  parseScheduleDateKey,
} from "@/modules/employees/employees.schedule";
import type { EmployeeProfile, EmployeeSchedule } from "@/modules/employees/employees.types";

export type ContactsDraft = {
  name: string;
  role: EmployeeProfile["role"];
  phone: string;
  messenger: string;
  birthDate: string;
  hireDate: string;
};

export function formatMoney(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".00", "")} ₽`;
}

export function parseDisplayDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
  }

  return new Date(value);
}

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDisplayDate(value));

export function buildEditableSchedule(employee: EmployeeProfile): EmployeeSchedule {
  return normalizeEmployeeSchedule(employee.schedule);
}

export function buildContactsDraft(employee: EmployeeProfile): ContactsDraft {
  return {
    name: employee.name,
    role: employee.role,
    phone: employee.phone ?? "",
    messenger: employee.messenger ?? "",
    birthDate: employee.birthDate ? employee.birthDate.slice(0, 10) : "",
    hireDate: employee.hireDate ? employee.hireDate.slice(0, 10) : "",
  };
}

export function getInitialPreviewMonth(schedule: EmployeeSchedule) {
  const firstDateKey = Object.keys(schedule.days).sort()[0];

  if (!firstDateKey) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const firstDate = parseScheduleDateKey(firstDateKey);
  return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
}

export function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  })
    .format(value)
    .replace(/\s*г\.?$/, "");
}

export function getMonthKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isDateInMonth(dateValue: string, month: Date) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
}

export function getMonthPreviewStats(schedule: EmployeeSchedule, month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  return Object.entries(schedule.days).reduce(
    (acc, [dateKey, day]) => {
      const date = parseScheduleDateKey(dateKey);

      if (date.getFullYear() !== year || date.getMonth() !== monthIndex) {
        return acc;
      }

      return {
        days: acc.days + 1,
        hours: acc.hours + day.shifts.reduce((sum, shift) => sum + shift.hours, 0),
      };
    },
    { days: 0, hours: 0 },
  );
}

export { formatScheduleDateKey };
