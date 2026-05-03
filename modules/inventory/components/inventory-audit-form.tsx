"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type InventoryAuditFormState,
  submitInventoryAuditAction,
} from "@/modules/inventory/inventory.actions";
import {
  INVENTORY_AUDIT_DRAFT_KEY,
  type InventoryAuditDraft,
  normalizeAuditDecimalDraft,
  normalizeAuditDraftValue,
  readInventoryAuditDraft,
} from "@/modules/inventory/components/inventory-audit-draft";
import {
  InventoryAuditFilters,
  InventoryAuditFooter,
  InventoryAuditHeader,
  InventoryAuditProductRows,
} from "@/modules/inventory/components/inventory-audit-form-parts";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryAuditForm({
  products,
  canManageInventory,
  onSuccess,
}: {
  products: ProductItem[];
  canManageInventory: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [draft, setDraft] = useState<InventoryAuditDraft>({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const initialState: InventoryAuditFormState = {
    errorMessage: null,
    successMessage: null,
    checkedCount: 0,
    updatedCount: 0,
    differenceCount: 0,
  };
  const [state, formAction, isPending] = useActionState(
    submitInventoryAuditAction,
    initialState,
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setDraft(readInventoryAuditDraft());
      setIsDraftLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) {
      return;
    }

    if (Object.keys(draft).length === 0) {
      window.localStorage.removeItem(INVENTORY_AUDIT_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(INVENTORY_AUDIT_DRAFT_KEY, JSON.stringify(draft));
  }, [draft, isDraftLoaded]);

  useEffect(() => {
    if (!state.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setDraft({});
      window.localStorage.removeItem(INVENTORY_AUDIT_DRAFT_KEY);
      onSuccess?.();
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [onSuccess, router, state.successMessage]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = !selectedCategory || product.category === selectedCategory;

        if (!matchesCategory) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return (
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.sku?.toLowerCase().includes(normalizedQuery) ||
          product.category?.toLowerCase().includes(normalizedQuery)
        );
      }),
    [normalizedQuery, products, selectedCategory],
  );

  const categorySummaries = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((category) => ({
        category,
        count: products.filter((product) => product.category === category).length,
      })).filter((item) => item.count > 0),
    [products],
  );

  const draftEntries = useMemo(
    () =>
      Object.entries(draft).flatMap(([productId, value]) => {
        const normalizedValue = normalizeAuditDraftValue(value);

        if (!normalizedValue) {
          return [];
        }

        return [{ productId, actualQuantity: normalizedValue }];
      }),
    [draft],
  );

  const touchedCount = draftEntries.length;
  const differenceCount = useMemo(
    () =>
      draftEntries.reduce((sum, entry) => {
        const product = products.find((item) => String(item.id) === entry.productId);

        if (!product) {
          return sum;
        }

        return sum + (String(product.stockQuantity) === entry.actualQuantity ? 0 : 1);
      }, 0),
    [draftEntries, products],
  );

  const setDraftValue = (productId: number, value: string) => {
    setDraft((currentDraft) => {
      const normalizedValue = normalizeAuditDecimalDraft(value);
      const nextDraft = { ...currentDraft };

      if (!normalizedValue) {
        delete nextDraft[String(productId)];
        return nextDraft;
      }

      nextDraft[String(productId)] = normalizedValue;
      return nextDraft;
    });
  };

  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5">
      <InventoryAuditHeader touchedCount={touchedCount} differenceCount={differenceCount} />
      <InventoryAuditFilters
        query={query}
        selectedCategory={selectedCategory}
        categorySummaries={categorySummaries}
        onQueryChange={setQuery}
        onCategoryChange={setSelectedCategory}
      />

      {state.errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.errorMessage}
        </div>
      ) : null}

      {state.successMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.successMessage}
        </div>
      ) : null}

      <form action={canManageInventory ? formAction : undefined} className="mt-4 space-y-4">
        {draftEntries.map((entry) => (
          <div key={entry.productId}>
            <input type="hidden" name="productId" value={entry.productId} />
            <input type="hidden" name="actualQuantity" value={entry.actualQuantity} />
          </div>
        ))}

        <div className="space-y-3">
          <InventoryAuditProductRows
            products={filteredProducts}
            draft={draft}
            canManageInventory={canManageInventory}
            isPending={isPending}
            onDraftChange={setDraftValue}
          />
        </div>

        <InventoryAuditFooter
          canManageInventory={canManageInventory}
          isPending={isPending}
          touchedCount={touchedCount}
          onClearDraft={() => setDraft({})}
        />
      </form>
    </section>
  );
}
