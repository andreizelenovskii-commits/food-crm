"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type WriteoffActCreateFormState,
  updateIncomingActAction,
} from "@/modules/inventory/inventory.actions";
import {
  IncomingDraftProducts,
  IncomingFormMessage,
  IncomingResponsiblePicker,
} from "@/modules/inventory/components/inventory-incoming-create-form-parts";
import { InventoryProductSearchDialog } from "@/modules/inventory/components/inventory-product-search-dialog";
import {
  IncomingActEditFields,
  IncomingActEditFooter,
  IncomingActEditHeader,
} from "@/modules/inventory/components/incoming-act-edit-sections";
import {
  filterInventoryProducts,
  groupInventoryProducts,
} from "@/modules/inventory/components/inventory-product-grouping";
import {
  formatPriceInput,
  normalizeDecimalDraft,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";
import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

export function IncomingActEditForm({
  act,
  products,
  responsibleOptions,
}: {
  act: IncomingActSummary;
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
}) {
  const router = useRouter();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [supplierName, setSupplierName] = useState(act.supplierName ?? "");
  const [selectedResponsibleId, setSelectedResponsibleId] = useState(String(act.responsibleEmployeeId));
  const [notes, setNotes] = useState(act.notes ?? "");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    act.items.map((item) => item.productId),
  );
  const [draft, setDraft] = useState<Record<number, string>>(
    Object.fromEntries(act.items.map((item) => [item.productId, String(item.quantity).replace(".", ",")])),
  );
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>(
    Object.fromEntries(act.items.map((item) => [item.productId, formatPriceInput(item.priceCents)])),
  );
  const initialState: WriteoffActCreateFormState = {
    errorMessage: null,
    successMessage: null,
    createdActId: act.id,
  };
  const [state, formAction, isPending] = useActionState(updateIncomingActAction, initialState);

  useEffect(() => {
    if (!state.successMessage) {
      return;
    }

    router.replace("/dashboard/inventory?tab=incoming", { scroll: false });
    router.refresh();
  }, [router, state.successMessage]);

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

          return product
            ? {
                product,
                quantity: draft[productId] ?? "",
                price: draftPrices[productId] ?? formatPriceInput(product.priceCents),
              }
            : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [draft, draftPrices, products, selectedProductIds],
  );
  const draftEntries = useMemo(
    () =>
      selectedProducts.flatMap(({ product, quantity, price }) => {
        const trimmedQuantity = quantity.trim();
        const trimmedPrice = price.trim();
        return trimmedQuantity && trimmedPrice
          ? [{ productId: String(product.id), quantity: trimmedQuantity, price: trimmedPrice }]
          : [];
      }),
    [selectedProducts],
  );
  const draftTotalCents = useMemo(
    () =>
      selectedProducts.reduce((sum, item) => {
        const quantity = parseQuantity(item.quantity);
        const priceCents = Math.round(parseQuantity(item.price) * 100);
        return quantity > 0 ? sum + quantity * priceCents : sum;
      }, 0),
    [selectedProducts],
  );

  function setDraftValue(productId: number, value: string) {
    setDraft((current) => ({ ...current, [productId]: normalizeDecimalDraft(value) }));
  }

  function setDraftPriceValue(productId: number, value: string) {
    setDraftPrices((current) => ({ ...current, [productId]: normalizeDecimalDraft(value) }));
  }

  function addProductToDraft(productId: number) {
    setSelectedProductIds((current) => (current.includes(productId) ? current : [...current, productId]));
    setDraft((current) => (productId in current ? current : { ...current, [productId]: "" }));
    setDraftPrices((current) => {
      if (productId in current) {
        return current;
      }
      const product = products.find((item) => item.id === productId);
      return { ...current, [productId]: formatPriceInput(product?.priceCents ?? 0) };
    });
  }

  function removeProductFromDraft(productId: number) {
    setSelectedProductIds((current) => current.filter((id) => id !== productId));
    setDraft((current) => removeKey(current, productId));
    setDraftPrices((current) => removeKey(current, productId));
  }

  return (
    <>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="actId" value={act.id} />
        <IncomingActEditHeader
          actId={act.id}
          rowsCount={selectedProducts.length}
          totalCents={draftTotalCents}
        />
        {state.errorMessage ? <IncomingFormMessage>{state.errorMessage}</IncomingFormMessage> : null}
        <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5">
            <IncomingResponsiblePicker
              options={responsibleOptions}
              selectedResponsibleId={selectedResponsibleId}
              onChange={setSelectedResponsibleId}
            />
            <IncomingActEditFields
              supplierName={supplierName}
              notes={notes}
              onSupplierNameChange={setSupplierName}
              onNotesChange={setNotes}
            />
          </div>
          <div className="space-y-4">
            {draftEntries.map((entry) => (
              <div key={entry.productId}>
                <input type="hidden" name="productId" value={entry.productId} />
                <input type="hidden" name="quantity" value={entry.quantity} />
                <input type="hidden" name="price" value={entry.price} />
              </div>
            ))}
            <IncomingDraftProducts
              selectedProducts={selectedProducts}
              onOpenSearch={() => setIsSearchDialogOpen(true)}
              onQuantityChange={setDraftValue}
              onPriceChange={setDraftPriceValue}
              onRemoveProduct={removeProductFromDraft}
            />
            <IncomingActEditFooter
              draftEntriesCount={draftEntries.length}
              selectedResponsibleId={selectedResponsibleId}
              isPending={isPending}
            />
          </div>
        </section>
      </form>

      {isSearchDialogOpen ? (
        <InventoryProductSearchDialog
          title="Добавить товар в акт поступления"
          description="В редактирование можно добавить только товары, которые уже существуют на складе."
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
    </>
  );
}

function removeKey<T>(record: Record<number, T>, key: number) {
  const next = { ...record };
  delete next[key];
  return next;
}
