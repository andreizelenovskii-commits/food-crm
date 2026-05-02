"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/modules/employees/employees.types";
import { addEmployeeAction } from "@/modules/employees/employees.actions";

export function EmployeeForm() {
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>(EMPLOYEE_ROLES[0]);

  return (
    <form action={addEmployeeAction} className="space-y-5 rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Добавить сотрудника</h2>
        <p className="text-sm leading-6 text-zinc-600">Заполни данные и выбери роль.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Имя</span>
        <input
          name="name"
          type="text"
          placeholder="Иван Иванов"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Мессенджер</span>
        <input
          name="messenger"
          type="url"
          placeholder="https://t.me/ivan или https://wa.me/79991234567"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
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
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                    : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-500 hover:bg-zinc-50"
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

      <button
        type="submit"
        className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Добавить сотрудника
      </button>
    </form>
  );
}
