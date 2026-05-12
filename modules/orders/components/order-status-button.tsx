"use client";

import { useTransition } from "react";
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

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const formData = new FormData();
          formData.set("orderId", String(orderId));
          formData.set("status", status);
          await updateOrderStatusAction(formData);
        });
      }}
      className={
        className ??
        "inline-flex h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white shadow-sm shadow-red-950/20 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {isPending ? "Сохраняем..." : label}
    </button>
  );
}
