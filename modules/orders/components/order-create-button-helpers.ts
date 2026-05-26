import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import type { OrderFormState } from "@/modules/orders/orders.actions";
import {
  DEFAULT_DELIVERY_FEE_CENTS,
  INITIAL_ORDER_STATUS,
} from "@/modules/orders/orders.workflow";
import { matchesSmartSearch } from "@/shared/lib/smart-search";

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
  return clients.filter((client) => {
    if (!queryValue.trim()) {
      return true;
    }

    return matchesSmartSearch([client.name, client.phone, client.email, client.address], queryValue);
  });
}

export function filterEmployees(employees: Employee[], queryValue: string) {
  return employees.filter((employee) => {
    if (!queryValue.trim()) {
      return true;
    }

    return matchesSmartSearch([employee.name, employee.phone, employee.email, employee.role], queryValue);
  });
}
