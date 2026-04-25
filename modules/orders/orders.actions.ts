"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireSessionUser } from "@/modules/auth/auth.session";
import { addOrder, fetchOrderById, updateOrderStatusById } from "@/modules/orders/orders.service";
import {
  getOrderFormValues,
  parseCreateOrderInput,
  type OrderFormValues,
} from "@/modules/orders/orders.validation";
import { ValidationError } from "@/shared/errors/app-error";
import { ORDER_STATUSES, type OrderStatus } from "@/modules/orders/orders.types";
import {
  canAdvanceOrder,
  canAdjustDeliveryFee,
  canCancelOrder,
  canCreateOrders,
  DEFAULT_DELIVERY_FEE_CENTS,
  getNextOrderStatus,
  INITIAL_ORDER_STATUS,
  isOrderClosed,
} from "@/modules/orders/orders.workflow";

export type OrderFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  values: OrderFormValues;
};

const EMPTY_VALUES: OrderFormValues = {
  clientId: "",
  employeeId: "",
  status: INITIAL_ORDER_STATUS,
  deliveryFeeCents: String(DEFAULT_DELIVERY_FEE_CENTS),
  isInternal: false,
  items: "[]",
};

export async function createOrderAction(
  _previousState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const user = await requirePermission("manage_orders");

  if (!canCreateOrders(user.role)) {
    return {
      errorMessage: "У тебя нет доступа к созданию заказов",
      successMessage: null,
      values: getOrderFormValues(formData),
    };
  }

  try {
    const input = parseCreateOrderInput(formData);
    const deliveryFeeCents = input.isInternal
      ? 0
      : canAdjustDeliveryFee(user.role)
        ? input.deliveryFeeCents
        : DEFAULT_DELIVERY_FEE_CENTS;

    await addOrder({
      ...input,
      status: INITIAL_ORDER_STATUS,
      deliveryFeeCents,
    });
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
  const user = await requireSessionUser();

  const orderId = Number(String(formData.get("orderId") ?? "").trim());
  const status = String(formData.get("status") ?? "").trim();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return;
  }

  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return;
  }

  const order = await fetchOrderById(orderId);

  if (!order || isOrderClosed(order.status)) {
    return;
  }

  const nextExpectedStatus = getNextOrderStatus(order.status);
  const nextStatus = status as OrderStatus;

  if (nextStatus === "CANCELLED") {
    if (!canCancelOrder(order.status, user.role)) {
      return;
    }
  } else {
    if (!nextExpectedStatus || nextExpectedStatus !== nextStatus) {
      return;
    }

    if (!canAdvanceOrder(order.status, user.role)) {
      return;
    }
  }

  await updateOrderStatusById(orderId, status as OrderStatus);
  revalidatePath("/dashboard/orders");
}
