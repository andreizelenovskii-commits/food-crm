"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/modules/orders/orders.actions";
import type { OrderStatus } from "@/modules/orders/orders.types";

export function OrderStatusButton({
  orderId,
  status,
  label,
  className,
}: {
  orderId: number;
  status: OrderStatus;
  label: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setErrorMessage(null);
          startTransition(async () => {
            const formData = new FormData();
            formData.set("orderId", String(orderId));
            formData.set("status", status);
            const result = await updateOrderStatusAction(formData);
            if (result?.errorMessage) {
              setErrorMessage(result.errorMessage);
            }
          });
        }}
        className={
          className ??
          "inline-flex h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white shadow-sm shadow-red-950/20 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {isPending ? "Сохраняем..." : label}
      </button>
      {errorMessage ? (
        <span className="max-w-72 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-800">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}
