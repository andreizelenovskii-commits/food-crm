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
      buttonClassName="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
