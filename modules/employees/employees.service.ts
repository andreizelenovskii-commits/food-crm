import {
  createEmployee,
  createEmployeeAdjustment,
  getAllEmployees,
  getEmployeeById,
  getEmployeeAdjustments,
  getEmployeeAdjustmentTotals,
  getEmployeeOrdersThisMonth,
  updateEmployee,
} from "@/modules/employees/employees.repository";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/modules/employees/employees.validation";
import type { Employee, EmployeeProfile, EmployeeAdjustment } from "@/modules/employees/employees.types";

export async function fetchEmployees(): Promise<Employee[]> {
  return getAllEmployees();
}

export async function addEmployee(input: CreateEmployeeInput): Promise<Employee> {
  return createEmployee(input);
}

export async function updateEmployeeService(employeeId: number, input: UpdateEmployeeInput): Promise<Employee | null> {
  return updateEmployee(employeeId, input);
}

export async function addEmployeeAdjustment(input: {
  employeeId: number;
  type: string;
  amountCents: number;
  comment: string | null;
}) {
  return createEmployeeAdjustment(input);
}

export async function fetchEmployeeById(
  employeeId: number,
): Promise<EmployeeProfile | null> {
  const employee = await getEmployeeById(employeeId);

  if (!employee) {
    return null;
  }

  const totals = await getEmployeeAdjustmentTotals(employeeId);
  const adjustments = await getEmployeeAdjustments(employeeId);
  const ordersThisMonth = await getEmployeeOrdersThisMonth(employeeId);

  return {
    ...employee,
    advancesCents: totals.ADVANCE ?? 0,
    finesCents: totals.FINE ?? 0,
    debtCents: totals.DEBT ?? 0,
    kpd: 0,
    ordersThisMonth,
    salaryTodayCents: 0,
    adjustments,
  };
}
