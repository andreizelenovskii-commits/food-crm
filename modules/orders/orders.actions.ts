"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/modules/auth/auth.session";
import { addOrder, updateOrderStatusById } from "@/modules/orders/orders.service";
import {
  getOrderFormValues,
  parseCreateOrderInput,
  type OrderFormValues,
} from "@/modules/orders/orders.validation";
import { ValidationError } from "@/shared/errors/app-error";
import { ORDER_STATUSES, type OrderStatus } from "@/modules/orders/orders.types";

export type OrderFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  values: OrderFormValues;
};

const EMPTY_VALUES: OrderFormValues = {
  clientId: "",
  employeeId: "",
  status: "PENDING",
  isInternal: false,
  items: "[]",
};

export async function createOrderAction(
  _previousState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  await requirePermission("manage_orders");

  try {
    const input = parseCreateOrderInput(formData);
    await addOrder(input);
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
        values: getOrderFormValues(formData),
      };
    }

    throw error;
  }

  revalidatePath("/dashboard/orders");

  return {
    errorMessage: null,
    successMessage: "Заказ создан",
    values: EMPTY_VALUES,
  };
}

export async function updateOrderStatusAction(formData: FormData) {
  await requirePermission("manage_orders");

  const orderId = Number(String(formData.get("orderId") ?? "").trim());
  const status = String(formData.get("status") ?? "").trim();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return;
  }

  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return;
  }

  await updateOrderStatusById(orderId, status as OrderStatus);
  revalidatePath("/dashboard/orders");
}
