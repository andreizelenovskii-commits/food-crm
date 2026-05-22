import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import { normalizeSearchValue } from "@/modules/orders/components/order-create-utils";
import type { OrderFormState } from "@/modules/orders/orders.actions";
import {
  DEFAULT_DELIVERY_FEE_CENTS,
  INITIAL_ORDER_STATUS,
} from "@/modules/orders/orders.workflow";

export function createInitialOrderFormState(): OrderFormState {
  return {
    errorMessage: null,
    successMessage: null,
    values: {
      clientId: "",
      employeeId: "",
      status: INITIAL_ORDER_STATUS,
      source: "PHONE",
      deliveryFeeCents: String(DEFAULT_DELIVERY_FEE_CENTS),
      isInternal: false,
      items: "[]",
    },
  };
}

export function filterClients(clients: Client[], queryValue: string) {
  const query = normalizeSearchValue(queryValue);

  return clients.filter((client) => {
    if (!query) {
      return true;
    }

    const haystack = normalizeSearchValue(
      [client.name, client.phone, client.email, client.address].filter(Boolean).join(" "),
    );

    return haystack.includes(query);
  });
}

export function filterEmployees(employees: Employee[], queryValue: string) {
  const query = normalizeSearchValue(queryValue);

  return employees.filter((employee) => {
    if (!query) {
      return true;
    }

    const haystack = normalizeSearchValue(
      [employee.name, employee.phone, employee.email, employee.role].filter(Boolean).join(" "),
    );

    return haystack.includes(query);
  });
}
