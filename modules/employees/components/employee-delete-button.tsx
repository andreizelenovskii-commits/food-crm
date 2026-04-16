"use client";

import { deleteEmployeeAction } from "@/modules/employees/employees.actions";

type EmployeeDeleteButtonProps = {
  employeeId: number;
  employeeName: string;
  disabled?: boolean;
};

export function EmployeeDeleteButton({
  employeeId,
  employeeName,
  disabled = false,
}: EmployeeDeleteButtonProps) {
  return (
    <form
      action={deleteEmployeeAction}
      className="relative z-10 shrink-0"
      onSubmit={(event) => {
        const isConfirmed = window.confirm(
          `Удалить сотрудника ${employeeName}?`,
        );

        if (!isConfirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="redirectTo" value="/dashboard/employees" />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
      >
        Удалить
      </button>
    </form>
  );
}
