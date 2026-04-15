import { pool } from "@/shared/db/pool";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/modules/employees/employees.validation";
import type {
  Employee,
  EmployeeAdjustment,
  EmployeeAdjustmentType,
} from "@/modules/employees/employees.types";

function mapRowToEmployee(row: {
  id: number;
  name: string;
  email: string | null;
  role: string;
  phone: string | null;
  messenger: string | null;
  schedule: any | null;
  monthlyHours: number | null;
  createdAt: Date;
}): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Employee["role"],
    phone: row.phone,
    messenger: row.messenger,
    schedule: row.schedule,
    monthlyHours: row.monthlyHours,
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
  const result = await pool.query<{
    id: number;
    name: string;
    email: string | null;
    role: string;
    phone: string | null;
    messenger: string | null;
    schedule: any | null;
    monthlyHours: number | null;
    createdAt: Date;
  }>(
    `
      SELECT "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "createdAt"
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

  const result = await pool.query<{
    id: number;
    name: string;
    email: string | null;
    role: string;
    phone: string | null;
    messenger: string | null;
    schedule: any | null;
    monthlyHours: number | null;
    createdAt: Date;
  }>(
    `
      SELECT "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "createdAt"
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

export async function createEmployeeAdjustment(input: {
  employeeId: number;
  type: string;
  amountCents: number;
  comment: string | null;
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
      INSERT INTO "EmployeeAdjustment" ("employeeId", "type", "amountCents", "comment")
      VALUES ($1, $2, $3, $4)
      RETURNING "id", "employeeId", "type", "amountCents", "comment", "createdAt"
    `,
    [input.employeeId, input.type, input.amountCents, input.comment],
  );

  return mapRowToAdjustment(result.rows[0]);
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const monthlyHours = input.schedule
    ? Object.values(input.schedule).reduce((sum, hours) => sum + hours, 0)
    : null;

  const result = await pool.query<{
    id: number;
    name: string;
    email: string | null;
    role: string;
    phone: string | null;
    messenger: string | null;
    schedule: any | null;
    monthlyHours: number | null;
    createdAt: Date;
  }>(
    `
      INSERT INTO "Employee" ("name", "email", "role", "phone", "messenger", "schedule", "monthlyHours")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "createdAt"
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
  const values: any[] = [];
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
  if (input.schedule !== undefined) {
    updates.push(`"schedule" = $${paramIndex++}`);
    values.push(input.schedule);
    // Пересчитать monthlyHours
    const monthlyHours = input.schedule
      ? Object.values(input.schedule).reduce((sum, hours) => sum + hours, 0)
      : null;
    updates.push(`"monthlyHours" = $${paramIndex++}`);
    values.push(monthlyHours);
  }
  if (input.monthlyHours !== undefined) {
    updates.push(`"monthlyHours" = $${paramIndex++}`);
    values.push(input.monthlyHours);
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(employeeId);

  const result = await pool.query<{
    id: number;
    name: string;
    email: string | null;
    role: string;
    phone: string | null;
    messenger: string | null;
    schedule: any | null;
    monthlyHours: number | null;
    createdAt: Date;
  }>(
    `
      UPDATE "Employee"
      SET ${updates.join(", ")}
      WHERE "id" = $${paramIndex}
      RETURNING "id", "name", "email", "role", "phone", "messenger", "schedule", "monthlyHours", "createdAt"
    `,
    values,
  );

  if (!result.rowCount) {
    return null;
  }

  return mapRowToEmployee(result.rows[0]);
}
