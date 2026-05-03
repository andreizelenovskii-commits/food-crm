"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createOrderAction, type OrderFormState } from "@/modules/orders/orders.actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import { getLoyaltyDiscountPercent } from "@/modules/loyalty/loyalty.rules";
import {
  OrderCreateDialog,
  OrderCreateFab,
} from "@/modules/orders/components/order-create-dialog";
import {
  ClientPickerDialog,
  EmployeePickerDialog,
} from "@/modules/orders/components/order-person-picker-dialogs";
import type { SelectedOrderItem } from "@/modules/orders/components/order-create.types";
import { normalizeSearchValue } from "@/modules/orders/components/order-create-utils";
import {
  canAdjustDeliveryFee,
  DEFAULT_DELIVERY_FEE_CENTS,
  INITIAL_ORDER_STATUS,
} from "@/modules/orders/orders.workflow";

export function OrderCreateButton({
  user,
  clients,
  employees,
  catalogItems,
}: {
  user: SessionUser;
  clients: Client[];
  employees: Employee[];
  catalogItems: CatalogItem[];
}) {
  const initialState: OrderFormState = {
    errorMessage: null,
    successMessage: null,
    values: {
      clientId: "",
      employeeId: "",
      status: INITIAL_ORDER_STATUS,
      deliveryFeeCents: String(DEFAULT_DELIVERY_FEE_CENTS),
      isInternal: false,
      items: "[]",
    },
  };
  const [isOpen, setIsOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<"client" | "employee" | null>(null);
  const [isInternal, setIsInternal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [deliveryFeeRubles, setDeliveryFeeRubles] = useState(
    String(DEFAULT_DELIVERY_FEE_CENTS / 100),
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [state, formAction, isPending] = useActionState(createOrderAction, initialState);
  const canEditDeliveryFee = canAdjustDeliveryFee(user.role);

  useEffect(() => {
    if (!isPending && state.successMessage && isOpen) {
      const timeoutId = window.setTimeout(() => {
        setIsOpen(false);
        setActivePicker(null);
        setIsInternal(false);
        setSelectedClientId("");
        setSelectedEmployeeId("");
        setClientQuery("");
        setEmployeeQuery("");
        setCatalogQuery("");
        setDeliveryFeeRubles(String(DEFAULT_DELIVERY_FEE_CENTS / 100));
        setSelectedCategory("");
        setSelectedItems({});
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, isPending, state.successMessage]);

  const visibleCatalogItems = useMemo(
    () =>
      catalogItems.filter((item) =>
        isInternal ? item.priceListType === "INTERNAL" : item.priceListType === "CLIENT",
      ),
    [catalogItems, isInternal],
  );

  const availableCategories = useMemo(
    () =>
      Array.from(new Set(visibleCatalogItems.map((item) => item.category).filter(Boolean))).sort((a, b) =>
        String(a).localeCompare(String(b), "ru"),
      ) as string[],
    [visibleCatalogItems],
  );

  const filteredCatalogItems = useMemo(
    () =>
      visibleCatalogItems.filter((item) => {
        const matchesCategory = !selectedCategory || item.category === selectedCategory;

        if (!matchesCategory) {
          return false;
        }

        const query = normalizeSearchValue(catalogQuery);

        if (!query) {
          return true;
        }

        const haystack = normalizeSearchValue(
          [item.name, item.category, item.description, item.pizzaSize]
            .filter(Boolean)
            .join(" "),
        );

        return haystack.includes(query);
      }),
    [catalogQuery, selectedCategory, visibleCatalogItems],
  );

  const selectedOrderItems = useMemo<SelectedOrderItem[]>(
    () =>
      Object.entries(selectedItems)
        .map(([catalogItemId, quantity]) => {
          const item = catalogItems.find((entry) => entry.id === Number(catalogItemId));

          if (!item || quantity <= 0) {
            return null;
          }

          return {
            item,
            quantity,
            totalCents: item.priceCents * quantity,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [catalogItems, selectedItems],
  );

  const totalCents = selectedOrderItems.reduce((sum, entry) => sum + entry.totalCents, 0);
  const selectedClient = clients.find((client) => String(client.id) === selectedClientId) ?? null;
  const selectedEmployee =
    employees.find((employee) => String(employee.id) === selectedEmployeeId) ?? null;
  const parsedDeliveryRubles = Number(deliveryFeeRubles.replace(",", "."));
  const deliveryFeeCents =
    isInternal || Number.isNaN(parsedDeliveryRubles) || parsedDeliveryRubles < 0
      ? 0
      : Math.round(parsedDeliveryRubles * 100);
  const discountPercent =
    !isInternal && selectedClient?.loyaltyLevel
      ? getLoyaltyDiscountPercent(selectedClient.loyaltyLevel)
      : 0;
  const discountCents = Math.round((totalCents * discountPercent) / 100);
  const payableTotalCents = Math.max(totalCents - discountCents, 0) + deliveryFeeCents;
  const itemsPayload = JSON.stringify(
    selectedOrderItems.map((entry) => ({
      catalogItemId: entry.item.id,
      quantity: entry.quantity,
    })),
  );

  const setQuantity = (catalogItemId: number, quantity: number) => {
    setSelectedItems((current) => {
      const next = { ...current };

      if (quantity <= 0) {
        delete next[catalogItemId];
      } else {
        next[catalogItemId] = quantity;
      }

      return next;
    });
  };

  const switchOrderType = (value: boolean) => {
    setIsInternal(value);
    setSelectedCategory("");
    setSelectedItems((current) => {
      const allowedType = value ? "INTERNAL" : "CLIENT";
      const nextEntries = Object.entries(current).filter(([catalogItemId]) => {
        const item = catalogItems.find((entry) => entry.id === Number(catalogItemId));
        return item?.priceListType === allowedType;
      });

      return Object.fromEntries(nextEntries);
    });
  };

  const filteredClients = useMemo(() => {
    const query = normalizeSearchValue(clientQuery);

    return clients.filter((client) => {
      if (!query) {
        return true;
      }

      const haystack = normalizeSearchValue(
        [client.name, client.phone, client.email, client.address].filter(Boolean).join(" "),
      );

      return haystack.includes(query);
    });
  }, [clientQuery, clients]);

  const filteredEmployees = useMemo(() => {
    const query = normalizeSearchValue(employeeQuery);

    return employees.filter((employee) => {
      if (!query) {
        return true;
      }

      const haystack = normalizeSearchValue(
        [employee.name, employee.phone, employee.email, employee.role].filter(Boolean).join(" "),
      );

      return haystack.includes(query);
    });
  }, [employeeQuery, employees]);

  const closePicker = () => setActivePicker(null);

  return (
    <>
      <OrderCreateFab onOpen={() => setIsOpen(true)} />

      {isOpen ? (
        <OrderCreateDialog
          formAction={formAction}
          isInternal={isInternal}
          catalogQuery={catalogQuery}
          selectedCategory={selectedCategory}
          availableCategories={availableCategories}
          filteredCatalogItems={filteredCatalogItems}
          selectedItems={selectedItems}
          selectedClient={selectedClient}
          selectedEmployee={selectedEmployee}
          canEditDeliveryFee={canEditDeliveryFee}
          deliveryFeeRubles={deliveryFeeRubles}
          deliveryFeeCents={deliveryFeeCents}
          discountPercent={discountPercent}
          discountCents={discountCents}
          totalCents={totalCents}
          payableTotalCents={payableTotalCents}
          selectedOrderItems={selectedOrderItems}
          itemsPayload={itemsPayload}
          errorMessage={state.errorMessage}
          isPending={isPending}
          onClose={() => setIsOpen(false)}
          onSwitchOrderType={switchOrderType}
          onCatalogQueryChange={setCatalogQuery}
          onCategoryChange={setSelectedCategory}
          onQuantityChange={setQuantity}
          onOpenClientPicker={() => setActivePicker("client")}
          onOpenEmployeePicker={() => setActivePicker("employee")}
          onDeliveryFeeChange={setDeliveryFeeRubles}
        />
      ) : null}

      {activePicker === "client" ? (
        <ClientPickerDialog
          clients={filteredClients}
          selectedClientId={selectedClientId}
          query={clientQuery}
          onQueryChange={setClientQuery}
          onSelect={(client) => {
            setSelectedClientId(String(client.id));
            setClientQuery(client.name);
            closePicker();
          }}
          onClose={closePicker}
        />
      ) : null}

      {activePicker === "employee" ? (
        <EmployeePickerDialog
          employees={filteredEmployees}
          selectedEmployeeId={selectedEmployeeId}
          query={employeeQuery}
          onQueryChange={setEmployeeQuery}
          onSelect={(employee) => {
            setSelectedEmployeeId(String(employee.id));
            setEmployeeQuery(employee.name);
            closePicker();
          }}
          onClose={closePicker}
        />
      ) : null}
    </>
  );
}
