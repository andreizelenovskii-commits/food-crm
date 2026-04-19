"use client";

import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteClientAction } from "@/modules/clients/clients.actions";

type ClientDeleteButtonProps = {
  clientId: number;
  clientName: string;
  disabled?: boolean;
};

export function ClientDeleteButton({
  clientId,
  clientName,
  disabled = false,
}: ClientDeleteButtonProps) {
  return (
    <ConfirmDeleteButton
      action={deleteClientAction}
      ariaLabel={`Удаление клиента ${clientName}`}
      entityLabel="Клиент"
      entityName={clientName}
      disabled={disabled}
      hiddenFields={[
        { name: "clientId", value: clientId },
        { name: "redirectTo", value: "/dashboard/clients" },
      ]}
      buttonClassName="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
    />
  );
}
