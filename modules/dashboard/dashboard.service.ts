import { pool } from "@/shared/db/pool";
import {
  formatHours,
  normalizeEmployeeSchedule,
} from "@/modules/employees/employees.schedule";
import type { UserRole } from "@/modules/auth/auth.types";

type DashboardEntityCounts = {
  orders: number;
  clients: number;
  products: number;
  employees: number;
};

export type DashboardSnapshot = {
  entityCounts: DashboardEntityCounts;
  statistics: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
  sales: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
};

export type EmployeeDashboardSnapshot = {
  role: UserRole;
  monthKey: string;
  monthLabel: string;
  scheduleSummary: string;
  scheduleDays: number;
  scheduleHours: number;
  advancesCents: number;
  finesCents: number;
  debtCents: number;
  salaryTodayCents: number;
} | null;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseMonthKey(monthKey?: string | null) {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const [year, month] = monthKey.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return new Date(year, month - 1, 1);
}

export async function getDashboardMetrics(): Promise<DashboardSnapshot> {
  const [
    ordersCountResult,
    clientsCountResult,
    productsCountResult,
    employeesCountResult,
    orderTotalsResult,
    completedSalesResult,
    monthSalesResult,
  ] = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Order"`),
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Client"`),
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Product"`),
    pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM "Employee"`),
    pool.query<{ total_cents: string | null; average_cents: string | null }>(`
      SELECT
        COALESCE(SUM("totalCents"), 0) AS total_cents,
        COALESCE(AVG("totalCents"), 0) AS average_cents
      FROM "Order"
    `),
    pool.query<{ completed_count: string; completed_total_cents: string | null }>(`
      SELECT
        COUNT(*) AS completed_count,
        COALESCE(SUM("totalCents"), 0) AS completed_total_cents
      FROM "Order"
      WHERE "status" = 'DELIVERED_PAID'
    `),
    pool.query<{ month_count: string; month_total_cents: string | null }>(`
      SELECT
        COUNT(*) AS month_count,
        COALESCE(SUM("totalCents"), 0) AS month_total_cents
      FROM "Order"
      WHERE date_trunc('month', "createdAt") = date_trunc('month', CURRENT_DATE)
    `),
  ]);

  const entityCounts = {
    orders: Number(ordersCountResult.rows[0]?.count ?? 0),
    clients: Number(clientsCountResult.rows[0]?.count ?? 0),
    products: Number(productsCountResult.rows[0]?.count ?? 0),
    employees: Number(employeesCountResult.rows[0]?.count ?? 0),
  };

  const totalRevenueCents = Number(orderTotalsResult.rows[0]?.total_cents ?? 0);
  const averageOrderCents = Math.round(
    Number(orderTotalsResult.rows[0]?.average_cents ?? 0),
  );
  const completedOrders = Number(completedSalesResult.rows[0]?.completed_count ?? 0);
  const completedRevenueCents = Number(
    completedSalesResult.rows[0]?.completed_total_cents ?? 0,
  );
  const monthOrders = Number(monthSalesResult.rows[0]?.month_count ?? 0);
  const monthRevenueCents = Number(monthSalesResult.rows[0]?.month_total_cents ?? 0);

  return {
    entityCounts,
    statistics: [
      {
        label: "Всего заказов",
        value: formatNumber(entityCounts.orders),
        hint: "Все созданные заказы в системе",
      },
      {
        label: "Активная база клиентов",
        value: formatNumber(entityCounts.clients),
        hint: "Клиенты, доступные менеджерам CRM",
      },
      {
        label: "Команда",
        value: formatNumber(entityCounts.employees),
        hint: "Сотрудники, чьи профили уже заведены",
      },
    ],
    sales: [
      {
        label: "Оборот за всё время",
        value: formatMoney(totalRevenueCents),
        hint: "Сумма всех заказов независимо от статуса",
      },
      {
        label: "Средний чек",
        value: formatMoney(averageOrderCents),
        hint: "Средняя сумма одного заказа",
      },
      {
        label: "Продажи за месяц",
        value: `${formatMoney(monthRevenueCents)} · ${formatNumber(monthOrders)}`,
        hint: "Выручка и число заказов в текущем месяце",
      },
      {
        label: "Завершённые продажи",
        value: `${formatMoney(completedRevenueCents)} · ${formatNumber(completedOrders)}`,
        hint: "Оплаченные и завершённые заказы",
      },
    ],
  };
}

export async function getEmployeeDashboardMetricsByEmail(
  email: string,
  monthKey?: string | null,
): Promise<EmployeeDashboardSnapshot> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const selectedMonth = parseMonthKey(monthKey);
  const selectedMonthKey = formatMonthKey(selectedMonth);
  const nextMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
  const monthStart = `${selectedMonthKey}-01`;
  const monthEnd = `${formatMonthKey(nextMonth)}-01`;

  const employeeResult = await pool.query<{
    role: string;
    schedule: unknown;
  }>(
    `
      SELECT "role", "schedule"
      FROM "Employee"
      WHERE LOWER("email") = $1
      LIMIT 1
    `,
    [normalizedEmail],
  );

  const employee = employeeResult.rows[0];

  if (!employee) {
    return null;
  }

  const monthTotalsResult = await pool.query<{
    type: string;
    total: string;
  }>(
    `
      SELECT "type", COALESCE(SUM("amountCents"), 0) AS total
      FROM "EmployeeAdjustment"
      WHERE "employeeId" = (
        SELECT "id"
        FROM "Employee"
        WHERE LOWER("email") = $1
        LIMIT 1
      )
        AND "createdAt" >= $2::date
        AND "createdAt" < $3::date
      GROUP BY "type"
    `,
    [normalizedEmail, monthStart, monthEnd],
  );

  const totals = monthTotalsResult.rows.reduce(
    (acc, row) => ({
      ...acc,
      [row.type]: Number(row.total ?? 0),
    }),
    {
      ADVANCE: 0,
      FINE: 0,
      DEBT: 0,
    } as Record<string, number>,
  );

  const normalizedSchedule = normalizeEmployeeSchedule(
    employee.schedule as Parameters<typeof normalizeEmployeeSchedule>[0],
    selectedMonth,
  );
  const scheduleStats = Object.values(normalizedSchedule.days).reduce(
    (acc, day) => ({
      scheduleDays: acc.scheduleDays + 1,
      scheduleHours:
        acc.scheduleHours + day.shifts.reduce((sum, shift) => sum + shift.hours, 0),
    }),
    { scheduleDays: 0, scheduleHours: 0 },
  );
  const dayWord =
    scheduleStats.scheduleDays % 10 === 1 && scheduleStats.scheduleDays % 100 !== 11
      ? "день"
      : scheduleStats.scheduleDays % 10 >= 2 &&
          scheduleStats.scheduleDays % 10 <= 4 &&
          (scheduleStats.scheduleDays % 100 < 10 || scheduleStats.scheduleDays % 100 >= 20)
        ? "дня"
        : "дней";
  const scheduleSummary = scheduleStats.scheduleDays
    ? `${scheduleStats.scheduleDays} ${dayWord} • ${formatHours(scheduleStats.scheduleHours)} ч`
    : "График не задан";

  return {
    role: employee.role as UserRole,
    monthKey: selectedMonthKey,
    monthLabel: new Intl.DateTimeFormat("ru-RU", {
      month: "long",
      year: "numeric",
    })
      .format(selectedMonth)
      .replace(/\s*г\.?$/, ""),
    scheduleSummary,
    scheduleDays: scheduleStats.scheduleDays,
    scheduleHours: scheduleStats.scheduleHours,
    advancesCents: totals.ADVANCE ?? 0,
    finesCents: totals.FINE ?? 0,
    debtCents: totals.DEBT ?? 0,
    salaryTodayCents: 0,
  };
}
