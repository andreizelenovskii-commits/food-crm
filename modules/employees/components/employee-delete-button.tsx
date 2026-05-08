"use client";

import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
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
    <ConfirmDeleteButton
      action={deleteEmployeeAction}
      ariaLabel={`Удаление сотрудника ${employeeName}`}
      entityLabel="Сотрудник"
      entityName={employeeName}
      disabled={disabled}
      hiddenFields={[
        { name: "employeeId", value: employeeId },
        { name: "redirectTo", value: "/dashboard/employees" },
      ]}
      buttonClassName="relative z-10 inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:shadow-none"
    />
  );
}
