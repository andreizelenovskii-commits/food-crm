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
      buttonClassName="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
    />
  );
}
