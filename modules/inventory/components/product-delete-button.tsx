"use client";

import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteProductAction } from "@/modules/inventory/inventory.actions";

export function ProductDeleteButton({
  productId,
  productName,
  disabled,
  redirectTo,
}: {
  productId: number;
  productName: string;
  disabled?: boolean;
  redirectTo?: string;
}) {
  return (
    <ConfirmDeleteButton
      action={deleteProductAction}
      ariaLabel={`Удаление товара ${productName}`}
      entityLabel="Товар"
      entityName={productName}
      disabled={disabled}
      disabledMessage={
        disabled
          ? "Этот товар уже используется в заказах, поэтому удалить его нельзя."
          : undefined
      }
      hiddenFields={[
        { name: "productId", value: productId },
        { name: "redirectTo", value: redirectTo ?? "/dashboard/inventory" },
      ]}
    />
  );
}
