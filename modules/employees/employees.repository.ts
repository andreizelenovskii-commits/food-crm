import { pool } from "@/shared/db/pool";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/modules/employees/employees.validation";
import type {
  Employee,
  EmployeeAdjustment,
  EmployeeAdjustmentType,
  EmployeeMonthlyOrderStat,
  EmployeeSchedule,
  EmployeeScheduleLegacy,
} from "@/modules/employees/employees.types";

type EmployeeRow = {
  id: number;
  name: string;
  email: string | null;
  role: string;
  phone: string | null;
  messenger: string | null;
  schedule: Employee["schedule"];
  monthlyHours: number | null;
  birthDate: Date | null;
  hireDate: Date | null;
  createdAt: Date;
};

function hasShiftSchedule(
  schedule: EmployeeSchedule | EmployeeScheduleLegacy,
): schedule is EmployeeSchedule {
  return "shiftsPerDay" in schedule;
}

function calculateMonthlyHours(
  schedule: EmployeeSchedule | EmployeeScheduleLegacy | null,
) {
  if (!schedule) {
    return null;
  }

  if (hasShiftSchedule(schedule)) {
    return Object.values(schedule.days).reduce(
      (sum, day) => sum + day.shifts.reduce((daySum, shift) => daySum + shift.hours, 0),
      0,
    );
  }

  return Object.values(schedule).reduce((sum, hours) => sum + hours, 0);
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapRowToEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Employee["role"],
    phone: row.phone,
    messenger: row.messenger,
    schedule: row.schedule,
    monthlyHours: row.monthlyHours,
    birthDate: row.birthDate ? formatDateOnly(row.birthDate) : null,
    hireDate: row.hireDate ? formatDateOnly(row.hireDate) : null,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapRowToAdjustment(row: {
  id: number;
  employeeId: number;
  type: string;
  amountCents: number;
  comment: string | null;
  createdAt: Date;
}): EmployeeAdjustment {
  return {
    id: row.id,
    employeeId: row.employeeId,
    type: row.type as EmployeeAdjustmentType,
    amountCents: row.amountCents,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAllEmployees(): Promise<Employee[]> {
  const result = await pool.query<EmployeeRow>(
    `
      SELECT "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "birthDate", "hireDate", "createdAt"
      FROM "Employee"
      ORDER BY "createdAt" DESC
    `,
  );

  return result.rows.map(mapRowToEmployee);
}

export async function getEmployeeById(employeeId: number): Promise<Employee | null> {
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return null;
  }

  const result = await pool.query<EmployeeRow>(
    `
      SELECT "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "birthDate", "hireDate", "createdAt"
      FROM "Employee"
      WHERE "id" = $1
      LIMIT 1
    `,
    [employeeId],
  );

  if (!result.rowCount) {
    return null;
  }

  return mapRowToEmployee(result.rows[0]);
}

export async function getEmployeeAdjustments(
  employeeId: number,
): Promise<EmployeeAdjustment[]> {
  const result = await pool.query<{
    id: number;
    employeeId: number;
    type: string;
    amountCents: number;
    comment: string | null;
    createdAt: Date;
  }>(
    `
      SELECT "id", "employeeId", "type", "amountCents", "comment", "createdAt"
      FROM "EmployeeAdjustment"
      WHERE "employeeId" = $1
      ORDER BY "createdAt" DESC
    `,
    [employeeId],
  );

  return result.rows.map(mapRowToAdjustment);
}

export async function getEmployeeAdjustmentTotals(employeeId: number) {
  const result = await pool.query<{
    type: string;
    total: string;
  }>(
    `
      SELECT "type", SUM("amountCents") AS total
      FROM "EmployeeAdjustment"
      WHERE "employeeId" = $1
      GROUP BY "type"
    `,
    [employeeId],
  );

  return result.rows.reduce(
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
}

export async function getEmployeeOrdersThisMonth(employeeId: number): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*) AS count
      FROM "Order"
      WHERE "employeeId" = $1
        AND "createdAt" >= date_trunc('month', CURRENT_DATE)
        AND "createdAt" < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    `,
    [employeeId],
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function getEmployeeOrderMonthlyStats(employeeId: number): Promise<EmployeeMonthlyOrderStat[]> {
  const result = await pool.query<{
    monthKey: string;
    ordersCount: string;
    revenueCents: string;
  }>(
    `
      SELECT
        TO_CHAR(date_trunc('month', "createdAt"), 'YYYY-MM') AS "monthKey",
        COUNT(*) AS "ordersCount",
        COALESCE(SUM("totalCents"), 0) AS "revenueCents"
      FROM "Order"
      WHERE "employeeId" = $1
      GROUP BY date_trunc('month', "createdAt")
      ORDER BY date_trunc('month', "createdAt") DESC
    `,
    [employeeId],
  );

  return result.rows.map((row) => ({
    monthKey: row.monthKey,
    ordersCount: Number(row.ordersCount ?? 0),
    revenueCents: Number(row.revenueCents ?? 0),
  }));
}

export async function createEmployeeAdjustment(input: {
  employeeId: number;
  type: string;
  amountCents: number;
  comment: string | null;
  date: string;
}): Promise<EmployeeAdjustment> {
  const result = await pool.query<{
    id: number;
    employeeId: number;
    type: string;
    amountCents: number;
    comment: string | null;
    createdAt: Date;
  }>(
    `
      INSERT INTO "EmployeeAdjustment" ("employeeId", "type", "amountCents", "comment", "createdAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "id", "employeeId", "type", "amountCents", "comment", "createdAt"
    `,
    [input.employeeId, input.type, input.amountCents, input.comment, input.date],
  );

  return mapRowToAdjustment(result.rows[0]);
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const monthlyHours = calculateMonthlyHours(input.schedule);

  const result = await pool.query<EmployeeRow>(
    `
      INSERT INTO "Employee" ("name", "email", "role", "phone", "messenger", "schedule", "monthlyHours")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "birthDate", "hireDate", "createdAt"
    `,
    [input.name, null, input.role, input.phone, input.messenger, input.schedule, monthlyHours],
  );

  return mapRowToEmployee(result.rows[0]);
}

export async function updateEmployee(employeeId: number, input: UpdateEmployeeInput): Promise<Employee | null> {
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return null;
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`"name" = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.role !== undefined) {
    updates.push(`"role" = $${paramIndex++}`);
    values.push(input.role);
  }
  if (input.phone !== undefined) {
    updates.push(`"phone" = $${paramIndex++}`);
    values.push(input.phone);
  }
  if (input.messenger !== undefined) {
    updates.push(`"messenger" = $${paramIndex++}`);
    values.push(input.messenger);
  }
  if (input.birthDate !== undefined) {
    updates.push(`"birthDate" = $${paramIndex++}`);
    values.push(input.birthDate);
  }
  if (input.hireDate !== undefined) {
    updates.push(`"hireDate" = $${paramIndex++}`);
    values.push(input.hireDate);
  }
  if (input.schedule !== undefined) {
    updates.push(`"schedule" = $${paramIndex++}`);
    values.push(input.schedule);
    if (input.monthlyHours === undefined) {
      const monthlyHours = calculateMonthlyHours(input.schedule);
      updates.push(`"monthlyHours" = $${paramIndex++}`);
      values.push(monthlyHours);
    }
  }
  if (input.monthlyHours !== undefined) {
    updates.push(`"monthlyHours" = $${paramIndex++}`);
    values.push(input.monthlyHours);
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(employeeId);

  const result = await pool.query<EmployeeRow>(
    `
      UPDATE "Employee"
      SET ${updates.join(", ")}
      WHERE "id" = $${paramIndex}
      RETURNING "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "birthDate", "hireDate", "createdAt"
    `,
    values,
  );

  if (!result.rowCount) {
    return null;
  }

  return mapRowToEmployee(result.rows[0]);
}
