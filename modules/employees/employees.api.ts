import type { Employee, EmployeeProfile } from "@/modules/employees/employees.types";
import { backendGet } from "@/shared/api/backend";

export async function fetchEmployees(): Promise<Employee[]> {
  return backendGet<Employee[]>("/api/v1/employees");
}

export async function fetchEmployeeById(employeeId: number): Promise<EmployeeProfile | null> {
  return backendGet<EmployeeProfile | null>(`/api/v1/employees/${employeeId}`);
}
