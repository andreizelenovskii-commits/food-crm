"use client";

import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteCatalogItemAction } from "@/modules/catalog/catalog.actions";

export function CatalogItemDeleteButton({
  catalogItemId,
  itemName,
}: {
  catalogItemId: number;
  itemName: string;
}) {
  return (
    <ConfirmDeleteButton
      action={deleteCatalogItemAction}
      ariaLabel={`Удаление позиции каталога ${itemName}`}
      entityLabel="Позиция каталога"
      entityName={itemName}
      warningMessage="Позиция исчезнет из каталога, но технологическая карта останется без изменений."
      hiddenFields={[
        { name: "catalogItemId", value: catalogItemId },
        { name: "redirectTo", value: "/dashboard/catalog" },
      ]}
      buttonClassName="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
    />
  );
}
