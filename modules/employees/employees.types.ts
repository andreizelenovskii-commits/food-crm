export const EMPLOYEE_ROLES = [
  "Управляющий",
  "Повар",
  "Диспетчер",
  "Курьер",
] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const EMPLOYEE_ADJUSTMENT_TYPES = ["ADVANCE", "FINE", "DEBT"] as const;
export const EMPLOYEE_ADJUSTMENT_LABELS: Record<
  EmployeeAdjustmentType,
  string
> = {
  ADVANCE: "Аванс",
  FINE: "Штраф",
  DEBT: "Долг",
};

export type EmployeeAdjustmentType = (typeof EMPLOYEE_ADJUSTMENT_TYPES)[number];

export type EmployeeAdjustment = {
  id: number;
  employeeId: number;
  type: EmployeeAdjustmentType;
  amountCents: number;
  comment: string | null;
  createdAt: string;
};

export type EmployeeSchedule = Record<string, number>; // e.g., { "monday": 8, "tuesday": 8, ... }

export type Employee = {
  id: number;
  name: string;
  email?: string | null;
  role: EmployeeRole;
  phone: string | null;
  messenger: string | null;
  schedule: EmployeeSchedule | null;
  monthlyHours: number | null;
  createdAt: string;
};
