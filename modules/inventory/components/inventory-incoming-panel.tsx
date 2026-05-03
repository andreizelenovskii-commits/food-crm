"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeIncomingActAction,
  createIncomingActAction,
  type WriteoffActCreateFormState,
  type WriteoffActProgressFormState,
} from "@/modules/inventory/inventory.actions";
import { InventoryIncomingCreateForm } from "@/modules/inventory/components/inventory-incoming-create-form";
import { InventoryProductSearchDialog } from "@/modules/inventory/components/inventory-product-search-dialog";
import {
  formatPriceInput,
  normalizeDecimalDraft,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";
import {
  filterInventoryProducts,
  groupInventoryProducts,
} from "@/modules/inventory/components/inventory-product-grouping";
import {
  IncomingCompletedActsSection,
  IncomingOpenActsSection,
  IncomingOverview,
  IncomingPanelMessage,
} from "@/modules/inventory/components/inventory-incoming-sections";
import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

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
  const [selectedResponsibleId, setSelectedResponsibleId] = useState("");
  const [notes, setNotes] = useState("");
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
        setNotes("");
        setSupplierName("");
        setSelectedResponsibleId("");
        setIsSearchDialogOpen(false);
      }
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [completeState.successMessage, createState.successMessage, router]);

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

  const openActs = acts.filter((act) => !act.isCompleted);
  const completedActs = acts.filter((act) => act.isCompleted);
  const totalCompletedIncomingCents = completedActs.reduce((sum, act) => sum + act.totalCents, 0);
  const incomingTodayCount = acts.filter((act) => {
    const date = new Date(act.createdAt);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  }).length;
  const totalCompletedUnits = completedActs.reduce((sum, act) => sum + act.totalQuantity, 0);

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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
      <div className="space-y-4">
        <IncomingOverview
          openCount={openActs.length}
          incomingTodayCount={incomingTodayCount}
          totalCompletedCents={totalCompletedIncomingCents}
        />
        {completeState.errorMessage ? <IncomingPanelMessage>{completeState.errorMessage}</IncomingPanelMessage> : null}
        {completeState.successMessage ? <IncomingPanelMessage>{completeState.successMessage}</IncomingPanelMessage> : null}
        <IncomingOpenActsSection
          acts={openActs}
          canManageInventory={canManageInventory}
          isCompletePending={isCompletePending}
          completeFormAction={completeFormAction}
        />
        <IncomingCompletedActsSection
          acts={completedActs}
          totalCompletedUnits={totalCompletedUnits}
          canManageInventory={canManageInventory}
          isCompletePending={isCompletePending}
          completeFormAction={completeFormAction}
        />
      </div>

      <InventoryIncomingCreateForm
        responsibleOptions={responsibleOptions}
        selectedResponsibleId={selectedResponsibleId}
        supplierName={supplierName}
        notes={notes}
        selectedProducts={selectedProducts}
        draftEntries={draftEntries}
        draftTotalCents={draftTotalCents}
        canManageInventory={canManageInventory}
        isCreatePending={isCreatePending}
        errorMessage={createState.errorMessage}
        successMessage={createState.successMessage}
        createFormAction={createFormAction}
        onResponsibleChange={setSelectedResponsibleId}
        onSupplierNameChange={setSupplierName}
        onNotesChange={setNotes}
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
