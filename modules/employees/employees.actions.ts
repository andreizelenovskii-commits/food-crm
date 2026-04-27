"use client";

import { ValidationError } from "@/shared/errors/app-error";
import {
  parseCreateEmployeeInput,
  parseCreateEmployeeAdjustmentInput,
  parseUpdateEmployeeInput,
} from "@/modules/employees/employees.validation";
import { browserBackendJson } from "@/shared/api/browser-backend";

function parseClientIssueEmployeeAccessInput(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    throw new ValidationError("Заполните логин и пароль для сотрудника");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Введите корректный email для входа");
  }

  return { email, password };
}

export async function addEmployeeAction(formData: FormData) {
  const input = parseCreateEmployeeInput(formData);

  await browserBackendJson("/api/v1/employees", {
    body: input,
  });

  window.location.assign("/dashboard/employees");
}

export async function updateEmployeeAction(employeeId: number, formData: FormData) {
  const input = parseUpdateEmployeeInput(formData);

  await browserBackendJson(`/api/v1/employees/${employeeId}`, {
    method: "PATCH",
    body: input,
  });

  window.location.assign(`/dashboard/employees/${employeeId}`);
}

export async function addEmployeeAdjustmentAction(formData: FormData) {
  const input = parseCreateEmployeeAdjustmentInput(formData);

  await browserBackendJson(`/api/v1/employees/${input.employeeId}/adjustments`, {
    body: {
      type: input.type,
      amount: String(input.amountCents / 100),
      comment: input.comment,
      date: input.date,
    },
  });

  window.location.assign(`/dashboard/employees/${input.employeeId}`);
}

export async function deleteEmployeeAction(formData: FormData) {
  const employeeId = Number(String(formData.get("employeeId") ?? "").trim());
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard/employees").trim();

  if (Number.isInteger(employeeId) && employeeId > 0) {
    await browserBackendJson(`/api/v1/employees/${employeeId}`, {
      method: "DELETE",
    });
  }

  return {
    redirectTo: redirectTo || "/dashboard/employees",
  };
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
    const input = parseClientIssueEmployeeAccessInput(formData);
    await browserBackendJson(`/api/v1/employees/${employeeId}/access`, {
      body: input,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
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
