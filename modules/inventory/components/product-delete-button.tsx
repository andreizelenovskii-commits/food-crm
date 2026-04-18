"use client";

import { deleteProductAction } from "@/modules/inventory/inventory.actions";

export function ProductDeleteButton({
  productId,
  productName,
  disabled,
}: {
  productId: number;
  productName: string;
  disabled?: boolean;
}) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        const confirmed = window.confirm(
          `Удалить товар "${productName}"? Это действие нельзя отменить.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={disabled}
        className="relative z-10 rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
      >
        Удалить
      </button>
    </form>
  );
}
