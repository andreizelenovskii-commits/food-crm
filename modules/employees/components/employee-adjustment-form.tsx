"use client";

import { useMemo, useState } from "react";
import { addEmployeeAdjustmentAction } from "@/modules/employees/employees.actions";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";
import {
  EMPLOYEE_ADJUSTMENT_TYPES,
  EMPLOYEE_ADJUSTMENT_LABELS,
  type EmployeeAdjustmentType,
} from "@/modules/employees/employees.types";

export function EmployeeAdjustmentForm({ employeeId, defaultType }: { employeeId: number; defaultType?: EmployeeAdjustmentType }) {
  const [adjustmentType, setAdjustmentType] = useState<EmployeeAdjustmentType>(defaultType || EMPLOYEE_ADJUSTMENT_TYPES[0]);
  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <form action={addEmployeeAdjustmentAction} className="space-y-5 rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Добавить запись</h2>
        <p className="text-sm leading-6 text-zinc-600">Занеси аванс, штраф или долг сотруднику.</p>
      </div>

      <input type="hidden" name="employeeId" value={employeeId} />

      {defaultType ? (
        <div className="rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-950">
          {EMPLOYEE_ADJUSTMENT_LABELS[defaultType]}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {EMPLOYEE_ADJUSTMENT_TYPES.map((type) => {
            const isSelected = adjustmentType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setAdjustmentType(type)}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                    : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {EMPLOYEE_ADJUSTMENT_LABELS[type]}
              </button>
            );
          })}
        </div>
      )}

      <input type="hidden" name="type" value={adjustmentType} />

      <EmployeeDatePicker name="date" label="Дата" defaultValue={defaultDate} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Сумма</span>
        <input
          name="amount"
          type="number"
          min="1"
          placeholder="1000"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Комментарий</span>
        <input
          name="comment"
          type="text"
          placeholder="Например: аванс за март"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Добавить запись
      </button>
    </form>
  );
}
