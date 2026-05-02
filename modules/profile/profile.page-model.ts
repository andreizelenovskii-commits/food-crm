import type { EmployeeAdjustmentType, EmployeeProfile } from "@/modules/employees/employees.types";
import {
  formatHours,
  normalizeEmployeeSchedule,
  parseScheduleDateKey,
} from "@/modules/employees/employees.schedule";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("ru-RU");

export function normalizeProfileMonth(month?: string | null) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return month;
  }

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  })
    .format(new Date(year, (monthNumber ?? 1) - 1, 1))
    .replace(/\s*г\.?$/, "");
}

function isInMonth(dateValue: string, month: string) {
  return dateValue.slice(0, 7) === month;
}

function sumAdjustments(employee: EmployeeProfile, month: string, type: EmployeeAdjustmentType) {
  return employee.adjustments
    .filter((adjustment) => adjustment.type === type && isInMonth(adjustment.createdAt, month))
    .reduce((sum, adjustment) => sum + adjustment.amountCents, 0);
}

function getScheduleStats(employee: EmployeeProfile, month: string) {
  const schedule = normalizeEmployeeSchedule(employee.schedule);

  return Object.entries(schedule.days).reduce(
    (acc, [dateKey, day]) => {
      const date = parseScheduleDateKey(dateKey);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (key !== month) {
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

export function buildProfileViewModel(employee: EmployeeProfile, month: string) {
  const selectedMonth = normalizeProfileMonth(month);
  const scheduleStats = getScheduleStats(employee, selectedMonth);
  const monthlyOrderStats =
    employee.monthlyOrderStats.find((entry) => entry.monthKey === selectedMonth) ?? {
      monthKey: selectedMonth,
      ordersCount: 0,
      revenueCents: 0,
    };
  const monthAdjustments = employee.adjustments
    .filter((adjustment) => isInMonth(adjustment.createdAt, selectedMonth))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const advancesCents = sumAdjustments(employee, selectedMonth, "ADVANCE");
  const finesCents = sumAdjustments(employee, selectedMonth, "FINE");
  const debtsCents = sumAdjustments(employee, selectedMonth, "DEBT");
  const estimatedPayoutCents = employee.salaryTodayCents - advancesCents - finesCents - debtsCents;

  return {
    selectedMonth,
    monthLabel: formatMonthLabel(selectedMonth),
    employeeInfo: [
      { label: "Имя и фамилия", value: employee.name, hint: employee.email ?? "Email не указан" },
      { label: "Должность", value: employee.role, hint: employee.phone ?? "Телефон не указан" },
      { label: "Дата приема", value: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString("ru-RU") : "Не указана", hint: "Стаж и история работы" },
      { label: "KPI", value: `${employee.kpd}%`, hint: "Текущий показатель эффективности" },
    ],
    payroll: [
      { label: "ЗП на сегодня", value: formatMoney(employee.salaryTodayCents), hint: "Расчет из профиля сотрудника" },
      { label: "К выплате ориентир", value: formatMoney(estimatedPayoutCents), hint: "ЗП минус авансы, штрафы и долги месяца" },
      { label: "Авансы", value: formatMoney(advancesCents), hint: "Выдано за выбранный месяц" },
      { label: "Штрафы", value: formatMoney(finesCents), hint: "Удержания за выбранный месяц" },
      { label: "Долги", value: formatMoney(debtsCents), hint: "Долги за выбранный месяц" },
      { label: "Рабочие часы", value: formatHours(scheduleStats.hours), hint: `${scheduleStats.days} рабочих дн.` },
    ],
    performance: [
      { label: "Заказы", value: NUMBER_FORMATTER.format(monthlyOrderStats.ordersCount), hint: "За выбранный месяц" },
      { label: "Выручка", value: formatMoney(monthlyOrderStats.revenueCents), hint: "Сумма заказов сотрудника" },
      { label: "Всего заказов", value: NUMBER_FORMATTER.format(employee.ordersCount), hint: "За весь период" },
      { label: "Плановые часы", value: employee.monthlyHours ? formatHours(employee.monthlyHours) : "Не заданы", hint: "Из карточки сотрудника" },
    ],
    monthAdjustments: monthAdjustments.map((adjustment) => ({
      id: adjustment.id,
      type: adjustment.type,
      date: new Date(adjustment.createdAt).toLocaleDateString("ru-RU"),
      amount: formatMoney(adjustment.amountCents),
      comment: adjustment.comment || "Без комментария",
    })),
  };
}
