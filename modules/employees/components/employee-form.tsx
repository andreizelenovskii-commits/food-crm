"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/modules/employees/employees.types";
import { addEmployeeAction } from "@/modules/employees/employees.actions";

export function EmployeeForm() {
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>(EMPLOYEE_ROLES[0]);

  return (
    <form action={addEmployeeAction} className="space-y-5 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Новый сотрудник</p>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">Добавить сотрудника</h2>
        <p className="text-xs leading-5 text-zinc-600">Заполни данные и выбери роль.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Имя</span>
        <input
          name="name"
          type="text"
          placeholder="Иван Иванов"
          className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Мессенджер</span>
        <input
          name="messenger"
          type="url"
          placeholder="https://t.me/ivan или https://wa.me/79991234567"
          className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
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

      <button type="submit" className="h-11 w-full rounded-[14px] bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
        Добавить сотрудника
      </button>
    </form>
  );
}
