"use client";

import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteIncomingActSubmitAction } from "@/modules/inventory/inventory.actions";

export function IncomingActDeleteButton({
  actId,
  isCompleted,
}: {
  actId: number;
  isCompleted: boolean;
}) {
  return (
    <ConfirmDeleteButton
      action={deleteIncomingActSubmitAction}
      ariaLabel={`Удаление акта поступления ${actId}`}
      entityLabel="Акт поступления"
      entityName={`№${actId}`}
      warningMessage={
        isCompleted
          ? "Акт уже проведён. При удалении система уменьшит складские остатки по его строкам."
          : "Открытый акт будет удалён без движения складских остатков."
      }
      hiddenFields={[
        { name: "actId", value: actId },
        { name: "redirectTo", value: "/dashboard/inventory?tab=incoming" },
      ]}
      buttonClassName="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
