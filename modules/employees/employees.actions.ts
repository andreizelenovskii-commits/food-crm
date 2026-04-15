"use server";

import { redirect } from "next/navigation";
import {
  addEmployee,
  addEmployeeAdjustment,
  fetchEmployeeById,
  updateEmployeeService,
} from "@/modules/employees/employees.service";
import {
  parseCreateEmployeeInput,
  parseCreateEmployeeAdjustmentInput,
  parseUpdateEmployeeInput,
} from "@/modules/employees/employees.validation";

export async function addEmployeeAction(formData: FormData) {
  const input = parseCreateEmployeeInput(formData);

  await addEmployee(input);

  redirect("/dashboard/employees");
}

export async function updateEmployeeAction(employeeId: number, formData: FormData) {
  const input = parseUpdateEmployeeInput(formData);

  const updated = await updateEmployeeService(employeeId, input);

  if (!updated) {
    redirect("/dashboard/employees");
    return;
  }

  redirect(`/dashboard/employees/${employeeId}`);
}

export async function addEmployeeAdjustmentAction(formData: FormData) {
  const input = parseCreateEmployeeAdjustmentInput(formData);

  const employee = await fetchEmployeeById(input.employeeId);

  if (!employee) {
    redirect("/dashboard/employees");
    return;
  }

  await addEmployeeAdjustment(input);

  redirect(`/dashboard/employees/${input.employeeId}`);
}
