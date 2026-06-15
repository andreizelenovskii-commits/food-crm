"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { EMPLOYEE_ROLE_GROUPS, type EmployeeRole, type Employee } from "@/modules/employees/employees.types";
import { updateEmployeeAction } from "@/modules/employees/employees.actions";

export function EmployeeEditForm({ employee }: { employee: Employee }) {
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>(employee.role);

  return (
    <form action={(formData: FormData) => updateEmployeeAction(employee.id, formData)} className="foodlike-panel space-y-5 p-4 sm:p-5">
      <div className="space-y-2">
        <p className="foodlike-kicker">Сотрудник</p>
        <h2 className="foodlike-title-sm">Редактировать сотрудника</h2>
        <p className="text-sm leading-6 text-zinc-600">Обнови данные сотрудника.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Имя</span>
        <input
          name="name"
          type="text"
          defaultValue={employee.name}
          className="foodlike-field"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Мессенджер</span>
        <input
          name="messenger"
          type="url"
          defaultValue={employee.messenger || ""}
          placeholder="https://t.me/ivan или https://wa.me/79991234567"
          className="foodlike-field"
        />
        <p className="text-xs text-zinc-500">Необязательно. Укажи любую ссылку на мессенджер.</p>
      </label>

      <div className="block space-y-3">
        <span className="text-sm font-medium text-zinc-700">Должность</span>
        {EMPLOYEE_ROLE_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{group.title}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.roles.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      isSelected
                        ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                        : "border-red-100 bg-white/85 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
          className="foodlike-field foodlike-textarea"
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
          className="foodlike-field"
        />
        <p className="text-xs text-zinc-500">Необязательно. Оставь пустым для автоматического расчета по графику.</p>
      </label>

      <button
        type="submit"
        className="foodlike-button-primary w-full"
      >
        Сохранить изменения
      </button>
    </form>
  );
}
