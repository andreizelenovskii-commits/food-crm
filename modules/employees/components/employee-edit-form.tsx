"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { EMPLOYEE_ROLES, type EmployeeRole, type Employee } from "@/modules/employees/employees.types";
import { updateEmployeeAction } from "@/modules/employees/employees.actions";

export function EmployeeEditForm({ employee }: { employee: Employee }) {
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>(employee.role);

  return (
    <form action={(formData: FormData) => updateEmployeeAction(employee.id, formData)} className="space-y-5 rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Редактировать сотрудника</h2>
        <p className="text-sm leading-6 text-zinc-600">Обнови данные сотрудника.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Имя</span>
        <input
          name="name"
          type="text"
          defaultValue={employee.name}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Мессенджер</span>
        <input
          name="messenger"
          type="url"
          defaultValue={employee.messenger || ""}
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
          defaultValue={employee.phone || ""}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">График работы (JSON)</span>
        <textarea
          name="schedule"
          defaultValue={employee.schedule ? JSON.stringify(employee.schedule, null, 2) : ""}
          placeholder='{"monday": 8, "tuesday": 8, "wednesday": 8, "thursday": 8, "friday": 8}'
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          rows={3}
        />
        <p className="text-xs text-zinc-500">Необязательно. Укажи график в формате JSON, например дни недели и часы.</p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Часы работы за месяц (корректировка)</span>
        <input
          name="monthlyHours"
          type="number"
          step="0.01"
          defaultValue={employee.monthlyHours || ""}
          placeholder="160"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
        <p className="text-xs text-zinc-500">Необязательно. Оставь пустым для автоматического расчета по графику.</p>
      </label>

      <button
        type="submit"
        className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Сохранить изменения
      </button>
    </form>
  );
}
