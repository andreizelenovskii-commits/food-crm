"use client";

import {
  getOrderFormValues,
  parseCreateOrderInput,
  type OrderFormValues,
} from "@/modules/orders/orders.validation";
import { ValidationError } from "@/shared/errors/app-error";
import { ORDER_STATUSES, type OrderStatus } from "@/modules/orders/orders.types";
import {
  DEFAULT_DELIVERY_FEE_CENTS,
  INITIAL_ORDER_STATUS,
} from "@/modules/orders/orders.workflow";
import { browserBackendJson } from "@/shared/api/browser-backend";

export type OrderFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  values: OrderFormValues;
};

const EMPTY_VALUES: OrderFormValues = {
  clientId: "",
  employeeId: "",
  source: "PHONE",
  status: INITIAL_ORDER_STATUS,
  deliveryFeeCents: String(DEFAULT_DELIVERY_FEE_CENTS),
  isInternal: false,
  items: "[]",
};

export async function createOrderAction(
  _previousState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  try {
    const input = parseCreateOrderInput(formData);
    const deliveryFeeCents = input.isInternal
      ? 0
      : input.deliveryFeeCents || DEFAULT_DELIVERY_FEE_CENTS;

    await browserBackendJson("/api/v1/orders", {
      body: {
        ...input,
        status: INITIAL_ORDER_STATUS,
        deliveryFeeCents,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        successMessage: null,
        values: getOrderFormValues(formData),
      };
    }

    throw error;
  }

  return {
    errorMessage: null,
    successMessage: "Заказ создан",
    values: EMPTY_VALUES,
  };
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = Number(String(formData.get("orderId") ?? "").trim());
  const status = String(formData.get("status") ?? "").trim();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { errorMessage: "Не удалось определить заказ" };
  }

  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return { errorMessage: "Недопустимый статус заказа" };
  }

  try {
    await browserBackendJson(`/api/v1/orders/${orderId}/status`, {
      method: "PATCH",
      body: {
        status: status as OrderStatus,
      },
    });
  } catch (error) {
    return {
      errorMessage: error instanceof Error ? error.message : "Не удалось изменить статус",
    };
  }

  window.location.reload();
  return { errorMessage: null };
}

export async function chooseOrderPackagingAction(formData: FormData) {
  const orderId = Number(String(formData.get("orderId") ?? "").trim());
  const orderItemId = Number(String(formData.get("orderItemId") ?? "").trim());
  const unitIndex = Number(String(formData.get("unitIndex") ?? "").trim());
  const kitchenZone = String(formData.get("kitchenZone") ?? "").trim();
  const packageProductId = Number(String(formData.get("packageProductId") ?? "").trim());

  if (![orderId, orderItemId, unitIndex, packageProductId].every((value) => Number.isInteger(value) && value > 0)) {
    return;
  }

  await browserBackendJson(`/api/v1/orders/${orderId}/packaging`, {
    body: {
      orderItemId,
      unitIndex,
      kitchenZone,
      packageProductId,
    },
  });
  window.location.reload();
}
