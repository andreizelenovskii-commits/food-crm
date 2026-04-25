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
        "rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {isPending ? "Сохраняем..." : label}
    </button>
  );
}
