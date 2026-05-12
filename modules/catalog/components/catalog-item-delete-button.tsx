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
      buttonClassName="foodlike-button-secondary min-h-9 px-4 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
