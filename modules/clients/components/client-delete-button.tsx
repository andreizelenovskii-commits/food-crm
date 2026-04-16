"use client";

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
    <form
      action={deleteClientAction}
      className="relative z-10 shrink-0"
      onSubmit={(event) => {
        const isConfirmed = window.confirm(`Удалить клиента ${clientName}?`);

        if (!isConfirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="redirectTo" value="/dashboard/clients" />
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
