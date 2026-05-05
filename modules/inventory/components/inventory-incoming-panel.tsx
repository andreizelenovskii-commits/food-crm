"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeIncomingActAction,
  createIncomingActAction,
  type WriteoffActCreateFormState,
  type WriteoffActProgressFormState,
} from "@/modules/inventory/inventory.actions";
import { InventoryIncomingDialogActions } from "@/modules/inventory/components/inventory-incoming-dialogs";
import { InventoryProductSearchDialog } from "@/modules/inventory/components/inventory-product-search-dialog";
import {
  formatPriceInput,
  normalizeDecimalDraft,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";
import {
  loadInventorySuppliers,
  subscribeInventorySuppliers,
  type InventorySupplierRecord,
} from "@/modules/inventory/components/inventory-supplier-storage";
import {
  filterInventoryProducts,
  groupInventoryProducts,
} from "@/modules/inventory/components/inventory-product-grouping";
import {
  IncomingOverview,
  IncomingPanelMessage,
} from "@/modules/inventory/components/inventory-incoming-sections";
import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

function buildMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number);
  return buildMonthKey(new Date(year, month - 1 + offset, 1));
}

function buildSupplierOptions(
  acts: IncomingActSummary[],
  savedSuppliers: InventorySupplierRecord[],
) {
  return Array.from(
    new Set(
      [
        ...savedSuppliers.map((supplier) => supplier.name.trim()),
        ...acts.map((act) => act.supplierName?.trim()),
      ].filter((supplier): supplier is string => Boolean(supplier)),
    ),
  ).sort((left, right) => left.localeCompare(right, "ru"));
}

export function InventoryIncomingPanel({
  products,
  responsibleOptions,
  acts,
  canManageInventory,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  acts: IncomingActSummary[];
  canManageInventory: boolean;
}) {
  const router = useRouter();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [supplierName, setSupplierName] = useState("");
  const [savedSuppliers, setSavedSuppliers] = useState<InventorySupplierRecord[]>(
    loadInventorySuppliers,
  );
  const [selectedResponsibleId, setSelectedResponsibleId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => buildMonthKey(new Date()));
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});
  const createInitialState: WriteoffActCreateFormState = {
    errorMessage: null,
    successMessage: null,
    createdActId: null,
  };
  const progressInitialState: WriteoffActProgressFormState = {
    errorMessage: null,
    successMessage: null,
  };
  const [createState, createFormAction, isCreatePending] = useActionState(
    createIncomingActAction,
    createInitialState,
  );
  const [completeState, completeFormAction, isCompletePending] = useActionState(
    completeIncomingActAction,
    progressInitialState,
  );

  useEffect(() => {
    if (!createState.successMessage && !completeState.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (createState.successMessage) {
        setSelectedProductIds([]);
        setDraft({});
        setDraftPrices({});
        setSupplierName("");
        setSelectedResponsibleId("");
        setIsSearchDialogOpen(false);
      }
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [completeState.successMessage, createState.successMessage, router]);

  useEffect(() => {
    return subscribeInventorySuppliers(() => {
      setSavedSuppliers(loadInventorySuppliers());
    });
  }, []);

  const filteredProducts = useMemo(
    () => filterInventoryProducts(products, selectedCategory, query),
    [products, query, selectedCategory],
  );
  const filteredProductsByCategory = useMemo(
    () => groupInventoryProducts(filteredProducts),
    [filteredProducts],
  );

  const selectedProducts = useMemo(
    () =>
      selectedProductIds
        .map((productId) => {
          const product = products.find((item) => item.id === productId);

          if (!product) {
            return null;
          }

          return {
            product,
            quantity: draft[productId] ?? "",
            price: draftPrices[productId] ?? formatPriceInput(product.priceCents),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [draft, draftPrices, products, selectedProductIds],
  );

  const draftEntries = useMemo(
    () =>
      selectedProducts.flatMap(({ product, quantity, price }) => {
        const trimmedQuantity = quantity.trim();
        const trimmedPrice = price.trim();

        if (!trimmedQuantity || !trimmedPrice) {
          return [];
        }

        return [{ productId: String(product.id), quantity: trimmedQuantity, price: trimmedPrice }];
      }),
    [selectedProducts],
  );

  const draftTotalCents = useMemo(
    () =>
      selectedProducts.reduce((sum, item) => {
        const quantity = parseQuantity(item.quantity);
        const priceCents = Math.round(parseQuantity(item.price) * 100);
        if (quantity <= 0) {
          return sum;
        }
        return sum + quantity * priceCents;
      }, 0),
    [selectedProducts],
  );

  const monthActs = acts.filter((act) => buildMonthKey(new Date(act.createdAt)) === selectedMonth);
  const openActs = monthActs.filter((act) => !act.isCompleted);
  const completedActs = monthActs.filter((act) => act.isCompleted);
  const supplierOptions = buildSupplierOptions(acts, savedSuppliers);
  const totalCompletedIncomingCents = completedActs.reduce((sum, act) => sum + act.totalCents, 0);
  const incomingTodayCount = monthActs.filter((act) => {
    const date = new Date(act.createdAt);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  }).length;
  const monthLabel = formatMonthLabel(selectedMonth);

  const setDraftValue = (productId: number, value: string) => {
    setDraft((current) => ({
      ...current,
      [productId]: normalizeDecimalDraft(value),
    }));
  };

  const addProductToDraft = (productId: number) => {
    setSelectedProductIds((current) => (current.includes(productId) ? current : [...current, productId]));
    setDraft((current) => (productId in current ? current : { ...current, [productId]: "" }));
    setDraftPrices((current) => {
      if (productId in current) {
        return current;
      }

      const product = products.find((item) => item.id === productId);
      return { ...current, [productId]: formatPriceInput(product?.priceCents ?? 0) };
    });
  };

  const setDraftPriceValue = (productId: number, value: string) => {
    setDraftPrices((current) => ({
      ...current,
      [productId]: normalizeDecimalDraft(value),
    }));
  };

  return (
    <div className="space-y-4">
      <IncomingOverview
        openCount={openActs.length}
        incomingTodayCount={incomingTodayCount}
        totalCompletedCents={totalCompletedIncomingCents}
        monthLabel={monthLabel}
        onPreviousMonth={() => setSelectedMonth((current) => shiftMonth(current, -1))}
        onNextMonth={() => setSelectedMonth((current) => shiftMonth(current, 1))}
      />
        {completeState.errorMessage ? <IncomingPanelMessage>{completeState.errorMessage}</IncomingPanelMessage> : null}
        {completeState.successMessage ? <IncomingPanelMessage>{completeState.successMessage}</IncomingPanelMessage> : null}
      <InventoryIncomingDialogActions
        openActs={openActs}
        completedActs={completedActs}
        products={products}
        responsibleOptions={responsibleOptions}
        supplierOptions={supplierOptions}
        selectedResponsibleId={selectedResponsibleId}
        supplierName={supplierName}
        selectedProducts={selectedProducts}
        draftEntries={draftEntries}
        draftTotalCents={draftTotalCents}
        canManageInventory={canManageInventory}
        isCreatePending={isCreatePending}
        isCompletePending={isCompletePending}
        errorMessage={createState.errorMessage}
        successMessage={createState.successMessage}
        createFormAction={createFormAction}
        completeFormAction={completeFormAction}
        onResponsibleChange={setSelectedResponsibleId}
        onSupplierNameChange={setSupplierName}
        onOpenSearch={() => setIsSearchDialogOpen(true)}
        onQuantityChange={setDraftValue}
        onPriceChange={setDraftPriceValue}
      />

      {isSearchDialogOpen ? (
        <InventoryProductSearchDialog
          title="Добавить товар в акт поступления"
          description="В поступление можно добавить только товары, которые уже существуют на складе."
          searchLabel="Поиск по товару"
          categoryTone="red"
          products={products}
          groupedProducts={filteredProductsByCategory}
          selectedProductIds={selectedProductIds}
          selectedCategory={selectedCategory}
          query={query}
          onClose={() => setIsSearchDialogOpen(false)}
          onQueryChange={setQuery}
          onCategoryChange={setSelectedCategory}
          onAddProduct={addProductToDraft}
        />
      ) : null}
    </div>
  );
}
