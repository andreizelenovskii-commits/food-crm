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
    <form action={addEmployeeAdjustmentAction} className="space-y-5 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Корректировки</p>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">Добавить запись</h2>
        <p className="text-xs leading-5 text-zinc-600">Занеси аванс, штраф или долг сотруднику.</p>
      </div>

      <input type="hidden" name="employeeId" value={employeeId} />

      {defaultType ? (
        <div className="rounded-[14px] border border-red-950/10 bg-white/84 px-4 py-3 text-sm font-semibold text-zinc-950">
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
                    ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "border-red-950/10 bg-white/90 text-zinc-950 hover:border-red-200 hover:bg-white"
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
          className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Комментарий</span>
        <input
          name="comment"
          type="text"
          placeholder="Например: аванс за март"
          className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />
      </label>

      <button type="submit" className="h-11 w-full rounded-[14px] bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
        Добавить запись
      </button>
    </form>
  );
}
