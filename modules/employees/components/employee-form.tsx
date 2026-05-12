"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/modules/employees/employees.types";
import { addEmployeeAction } from "@/modules/employees/employees.actions";

export function EmployeeForm() {
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>(EMPLOYEE_ROLES[0]);

  return (
    <form action={addEmployeeAction} className="foodlike-panel space-y-5 p-4 sm:p-5">
      <div className="space-y-2">
        <p className="foodlike-kicker">Новый сотрудник</p>
        <h2 className="foodlike-title-sm">Добавить сотрудника</h2>
        <p className="text-xs leading-5 text-zinc-600">Заполни данные и выбери роль.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Имя</span>
        <input
          name="name"
          type="text"
          placeholder="Иван Иванов"
          className="foodlike-field"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Мессенджер</span>
        <input
          name="messenger"
          type="url"
          placeholder="https://t.me/ivan или https://wa.me/79991234567"
          className="foodlike-field"
        />
        <p className="text-xs text-zinc-500">Необязательно. Укажи любую ссылку на мессенджер.</p>
      </label>

      <div className="block space-y-3">
        <span className="text-sm font-medium text-zinc-700">Роль</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {EMPLOYEE_ROLES.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  isSelected
                    ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "border-red-950/10 bg-white/90 text-zinc-950 hover:border-red-200 hover:bg-white"
                }`}
                aria-pressed={isSelected}
              >
                {role}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="role" value={selectedRole} />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Телефон</span>
        <PhoneInput
          name="phone"
        />
      </label>

      <EmployeeDatePicker
        name="hireDate"
        label="Дата приема на работу"
        placeholder="Укажи дату выхода"
      />

      <EmployeeDatePicker
        name="birthDate"
        label="Дата рождения"
        placeholder="Укажи дату рождения"
      />

      <button type="submit" className="foodlike-button-primary w-full">
        Добавить сотрудника
      </button>
    </form>
  );
}
