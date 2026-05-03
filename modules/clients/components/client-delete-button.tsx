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
      buttonClassName="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white"
    />
  );
}
