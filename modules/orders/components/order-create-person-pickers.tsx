"use client";

import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import {
  ClientPickerDialog,
  EmployeePickerDialog,
} from "@/modules/orders/components/order-person-picker-dialogs";

export function OrderCreatePersonPickers({
  activePicker,
  clients,
  employees,
  selectedClientId,
  selectedEmployeeId,
  clientQuery,
  employeeQuery,
  onClientQueryChange,
  onEmployeeQueryChange,
  onClientSelect,
  onEmployeeSelect,
  onClose,
}: {
  activePicker: "client" | "employee" | null;
  clients: Client[];
  employees: Employee[];
  selectedClientId: string;
  selectedEmployeeId: string;
  clientQuery: string;
  employeeQuery: string;
  onClientQueryChange: (value: string) => void;
  onEmployeeQueryChange: (value: string) => void;
  onClientSelect: (client: Client) => void;
  onEmployeeSelect: (employee: Employee) => void;
  onClose: () => void;
}) {
  return (
    <>
      {activePicker === "client" ? (
        <ClientPickerDialog
          clients={clients}
          selectedClientId={selectedClientId}
          query={clientQuery}
          onQueryChange={onClientQueryChange}
          onSelect={onClientSelect}
          onClose={onClose}
        />
      ) : null}

      {activePicker === "employee" ? (
        <EmployeePickerDialog
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          query={employeeQuery}
          onQueryChange={onEmployeeQueryChange}
          onSelect={onEmployeeSelect}
          onClose={onClose}
        />
      ) : null}
    </>
  );
}
