"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { ValidationError } from "@/shared/errors/app-error";
import {
  addEmployee,
  addEmployeeAdjustment,
  deleteEmployeeService,
  fetchEmployeeById,
  issueEmployeeAccessService,
  updateEmployeeService,
} from "@/modules/employees/employees.service";
import { parseIssueEmployeeAccessInput } from "@/modules/employees/employee-access.validation";
import {
  parseCreateEmployeeInput,
  parseCreateEmployeeAdjustmentInput,
  parseUpdateEmployeeInput,
} from "@/modules/employees/employees.validation";

export async function addEmployeeAction(formData: FormData) {
  await requirePermission("manage_employees");
  const input = parseCreateEmployeeInput(formData);

  await addEmployee(input);

  redirect("/dashboard/employees");
}

export async function updateEmployeeAction(employeeId: number, formData: FormData) {
  await requirePermission("manage_employees");
  const input = parseUpdateEmployeeInput(formData);

  const updated = await updateEmployeeService(employeeId, input);

  if (!updated) {
    redirect("/dashboard/employees");
    return;
  }

  redirect(`/dashboard/employees/${employeeId}`);
}

export async function addEmployeeAdjustmentAction(formData: FormData) {
  await requirePermission("manage_employees");
  const input = parseCreateEmployeeAdjustmentInput(formData);

  const employee = await fetchEmployeeById(input.employeeId);

  if (!employee) {
    redirect("/dashboard/employees");
    return;
  }

  await addEmployeeAdjustment(input);

  redirect(`/dashboard/employees/${input.employeeId}`);
}

export async function deleteEmployeeAction(formData: FormData) {
  await requirePermission("manage_employees");
  const employeeId = Number(String(formData.get("employeeId") ?? "").trim());
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard/employees").trim();

  if (Number.isInteger(employeeId) && employeeId > 0) {
    await deleteEmployeeService(employeeId);
  }

  redirect(redirectTo || "/dashboard/employees");
}

export type EmployeeAccessFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  values: {
    email: string;
    password: string;
  };
};

export async function issueEmployeeAccessAction(
  _previousState: EmployeeAccessFormState,
  formData: FormData,
): Promise<EmployeeAccessFormState> {
  await requirePermission("manage_employees");
  const employeeId = Number(String(formData.get("employeeId") ?? "").trim());
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return {
      errorMessage: "Сотрудник не найден",
      successMessage: null,
      values: {
        email,
        password,
      },
    };
  }

  try {
    const input = parseIssueEmployeeAccessInput(formData);
    const updated = await issueEmployeeAccessService({
      employeeId,
      email: input.email,
      password: input.password,
    });

    if (!updated) {
      return {
        errorMessage: "Сотрудник не найден",
        successMessage: null,
        values: {
          email,
          password,
        },
      };
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
        values: {
          email,
          password,
        },
      };
    }

    throw error;
  }

  return {
    errorMessage: null,
    successMessage: "Доступ в систему выдан. Сотрудник может войти по новым данным.",
    values: {
      email,
      password: "",
    },
  };
}
