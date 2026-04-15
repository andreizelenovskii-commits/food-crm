import { ValidationError } from "@/shared/errors/app-error";
import {
  EMPLOYEE_ROLES,
  EMPLOYEE_ADJUSTMENT_TYPES,
  type EmployeeRole,
  type EmployeeSchedule,
} from "@/modules/employees/employees.types";

function normalizeInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function isEmployeeRole(value: string): value is EmployeeRole {
  return EMPLOYEE_ROLES.includes(value as EmployeeRole);
}

export type CreateEmployeeInput = {
  name: string;
  role: EmployeeRole;
  phone: string | null;
  messenger: string | null;
  schedule: EmployeeSchedule | null;
};

export type UpdateEmployeeInput = {
  name?: string;
  role?: EmployeeRole;
  phone?: string | null;
  messenger?: string | null;
  schedule?: EmployeeSchedule | null;
  monthlyHours?: number | null;
};

export type CreateEmployeeAdjustmentInput = {
  employeeId: number;
  type: string;
  amountCents: number;
  comment: string | null;
};

export function parseCreateEmployeeInput(formData: FormData): CreateEmployeeInput {
  const name = normalizeInput(formData.get("name"));
  const role = normalizeInput(formData.get("role"));
  const phone = normalizeInput(formData.get("phone"));
  const messenger = normalizeInput(formData.get("messenger"));
  const scheduleStr = normalizeInput(formData.get("schedule"));

  if (!name || !role) {
    throw new ValidationError("Заполните имя и роль сотрудника");
  }

  if (!isEmployeeRole(role)) {
    throw new ValidationError("Выберите корректную роль сотрудника");
  }

  if (messenger) {
    try {
      new URL(messenger);
    } catch {
      throw new ValidationError("Введите корректную ссылку на мессенджер");
    }
  }

  let schedule: EmployeeSchedule | null = null;
  if (scheduleStr) {
    try {
      schedule = JSON.parse(scheduleStr);
      if (typeof schedule !== "object" || Array.isArray(schedule) || schedule === null) {
        throw new Error();
      }
      for (const [day, hours] of Object.entries(schedule)) {
        if (typeof hours !== "number" || hours < 0) {
          throw new Error();
        }
      }
    } catch {
      throw new ValidationError("Некорректный формат графика работы");
    }
  }

  return {
    name,
    role,
    phone: phone || null,
    messenger: messenger || null,
    schedule,
  };
}

export function parseUpdateEmployeeInput(formData: FormData): UpdateEmployeeInput {
  const name = normalizeInput(formData.get("name"));
  const role = normalizeInput(formData.get("role"));
  const phone = normalizeInput(formData.get("phone"));
  const messenger = normalizeInput(formData.get("messenger"));
  const scheduleStr = normalizeInput(formData.get("schedule"));
  const monthlyHoursStr = normalizeInput(formData.get("monthlyHours"));

  const input: UpdateEmployeeInput = {};

  if (name) input.name = name;
  if (role) {
    if (!isEmployeeRole(role)) {
      throw new ValidationError("Выберите корректную роль сотрудника");
    }
    input.role = role;
  }
  if (phone !== undefined) input.phone = phone || null;
  if (messenger !== undefined) {
    if (messenger) {
      try {
        new URL(messenger);
      } catch {
        throw new ValidationError("Введите корректную ссылку на мессенджер");
      }
    }
    input.messenger = messenger || null;
  }

  if (scheduleStr !== undefined) {
    let schedule: EmployeeSchedule | null = null;
    if (scheduleStr) {
      try {
        schedule = JSON.parse(scheduleStr);
        if (typeof schedule !== "object" || Array.isArray(schedule) || schedule === null) {
          throw new Error();
        }
        for (const [day, hours] of Object.entries(schedule)) {
          if (typeof hours !== "number" || hours < 0) {
            throw new Error();
          }
        }
      } catch {
        throw new ValidationError("Некорректный формат графика работы");
      }
    }
    input.schedule = schedule;
  }

  if (monthlyHoursStr !== undefined) {
    if (monthlyHoursStr) {
      const monthlyHours = Number(monthlyHoursStr);
      if (!Number.isFinite(monthlyHours) || monthlyHours < 0) {
        throw new ValidationError("Часы работы должны быть неотрицательным числом");
      }
      input.monthlyHours = monthlyHours;
    } else {
      input.monthlyHours = null;
    }
  }

  return input;
}

export function parseCreateEmployeeAdjustmentInput(formData: FormData): CreateEmployeeAdjustmentInput {
  const employeeId = Number(normalizeInput(formData.get("employeeId")));
  const type = normalizeInput(formData.get("type"));
  const amount = Number(normalizeInput(formData.get("amount")));
  const comment = normalizeInput(formData.get("comment"));

  if (!employeeId || !type || !amount) {
    throw new ValidationError("Заполните тип, сумму и сотрудника");
  }

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    throw new ValidationError("Некорректный сотрудник");
  }

  if (!EMPLOYEE_ADJUSTMENT_TYPES.includes(type as any)) {
    throw new ValidationError("Выберите корректный тип записи");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("Сумма должна быть положительным числом");
  }

  return {
    employeeId,
    type,
    amountCents: Math.round(amount * 100),
    comment: comment || null,
  };
}
