"use client";

import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteInventorySessionSubmitAction } from "@/modules/inventory/inventory.actions";

export function InventorySessionDeleteButton({
  sessionId,
  sessionLabel,
}: {
  sessionId: number;
  sessionLabel: string;
}) {
  return (
    <ConfirmDeleteButton
      action={deleteInventorySessionSubmitAction}
      ariaLabel={`Удаление инвентаризации ${sessionLabel}`}
      entityLabel="Инвентаризация"
      entityName={sessionLabel}
      hiddenFields={[
        { name: "sessionId", value: sessionId },
        { name: "redirectTo", value: "/dashboard/inventory?tab=audit" },
      ]}
      buttonClassName="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-800 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
