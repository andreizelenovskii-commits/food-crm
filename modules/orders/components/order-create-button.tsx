"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createOrderAction } from "@/modules/orders/orders.actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import { getLoyaltyDiscountPercent } from "@/modules/loyalty/loyalty.rules";
import {
  OrderCreateDialog,
  OrderCreateFab,
} from "@/modules/orders/components/order-create-dialog";
import { OrderCreatePersonPickers } from "@/modules/orders/components/order-create-person-pickers";
import type { SelectedOrderItem } from "@/modules/orders/components/order-create.types";
import {
  createInitialOrderFormState,
  filterClients,
  filterEmployees,
} from "@/modules/orders/components/order-create-button-helpers";
import {
  canAdjustDeliveryFee,
  DEFAULT_DELIVERY_FEE_CENTS,
} from "@/modules/orders/orders.workflow";
import { matchesSmartSearch } from "@/shared/lib/smart-search";

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
  const initialState = createInitialOrderFormState();
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
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
  const [selectedChoices, setSelectedChoices] = useState<Record<number, Record<number, number>>>({});
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
        setSelectedVariants({});
        setSelectedChoices({});
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
        if (!catalogQuery.trim()) {
          return true;
        }

        return matchesSmartSearch(
          [item.name, item.category, item.description, item.pizzaSize, item.rollSize],
          catalogQuery,
        );
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

          const defaultVariant = item.variants.find((variant) => variant.isDefault) ?? item.variants[0] ?? null;
          const selectedVariant =
            item.variants.find((variant) => variant.id === selectedVariants[item.id]) ?? defaultVariant;
          const unitPriceCents = selectedVariant?.priceCents ?? item.priceCents;

          return {
            item,
            variant: selectedVariant,
            quantity,
            totalCents: unitPriceCents * quantity,
            choices: selectedChoices[item.id] ?? {},
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [catalogItems, selectedChoices, selectedItems, selectedVariants],
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
      catalogItemVariantId: entry.variant?.id,
      quantity: entry.quantity,
      choices: entry.item.choiceSlots.map((slot) => ({
        choiceSlotId: slot.id,
        selectedCatalogItemId: entry.choices[slot.id],
      })),
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

  const setVariant = (catalogItemId: number, catalogItemVariantId: number) => {
    setSelectedVariants((current) => ({
      ...current,
      [catalogItemId]: catalogItemVariantId,
    }));
  };

  const setChoice = (catalogItemId: number, choiceSlotId: number, selectedCatalogItemId: number) => {
    setSelectedChoices((current) => ({
      ...current,
      [catalogItemId]: {
        ...(current[catalogItemId] ?? {}),
        [choiceSlotId]: selectedCatalogItemId,
      },
    }));
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
    setSelectedVariants({});
    setSelectedChoices({});
  };

  const filteredClients = useMemo(() => filterClients(clients, clientQuery), [clientQuery, clients]);
  const filteredEmployees = useMemo(() => filterEmployees(employees, employeeQuery), [employeeQuery, employees]);

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
          selectedVariants={selectedVariants}
          selectedChoices={selectedChoices}
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
          onVariantChange={setVariant}
          onChoiceChange={setChoice}
          onOpenClientPicker={() => setActivePicker("client")}
          onOpenEmployeePicker={() => setActivePicker("employee")}
          onDeliveryFeeChange={setDeliveryFeeRubles}
        />
      ) : null}

      <OrderCreatePersonPickers
        activePicker={activePicker}
        clients={filteredClients}
        employees={filteredEmployees}
        selectedClientId={selectedClientId}
        selectedEmployeeId={selectedEmployeeId}
        clientQuery={clientQuery}
        employeeQuery={employeeQuery}
        onClientQueryChange={setClientQuery}
        onEmployeeQueryChange={setEmployeeQuery}
        onClientSelect={(client) => {
          setSelectedClientId(String(client.id));
          setClientQuery(client.name);
          closePicker();
        }}
        onEmployeeSelect={(employee) => {
          setSelectedEmployeeId(String(employee.id));
          setEmployeeQuery(employee.name);
          closePicker();
        }}
        onClose={closePicker}
      />
    </>
  );
}
