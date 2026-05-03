"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  closeInventorySessionAction,
  createInventorySessionAction,
  saveInventorySessionActualsAction,
  type InventorySessionCreateFormState,
  type InventorySessionProgressFormState,
} from "@/modules/inventory/inventory.actions";
import { InventoryAuditActionsPanel } from "@/modules/inventory/components/inventory-audit-actions-panel";
import { InventoryAuditActiveDialog } from "@/modules/inventory/components/inventory-audit-active-dialog";
import { InventoryAuditCreateDialog } from "@/modules/inventory/components/inventory-audit-create-dialog";
import { InventoryAuditHistoryDialog } from "@/modules/inventory/components/inventory-audit-history-dialog";
import {
  filterInventoryProducts,
} from "@/modules/inventory/components/inventory-product-grouping";
import { normalizeDecimalDraft } from "@/modules/inventory/components/inventory-panel-utils";
import type {
  InventoryResponsibleOption,
  InventorySessionSummary,
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryAuditDialogs({
  products,
  responsibleOptions,
  sessions,
  canManageInventory,
  lowStockCount,
  zeroStockCount,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  sessions: InventorySessionSummary[];
  canManageInventory: boolean;
  lowStockCount: number;
  zeroStockCount: number;
}) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isActiveDialogOpen, setIsActiveDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [selectedResponsibleId, setSelectedResponsibleId] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [actualDrafts, setActualDrafts] = useState<Record<number, string>>({});
  const createInitialState: InventorySessionCreateFormState = {
    errorMessage: null,
    successMessage: null,
    createdSessionId: null,
  };
  const progressInitialState: InventorySessionProgressFormState = {
    errorMessage: null,
    successMessage: null,
  };
  const [createState, createFormAction, isCreatePending] = useActionState(
    createInventorySessionAction,
    createInitialState,
  );
  const [saveState, saveFormAction, isSavePending] = useActionState(
    saveInventorySessionActualsAction,
    progressInitialState,
  );
  const [closeState, closeFormAction, isClosePending] = useActionState(
    closeInventorySessionAction,
    progressInitialState,
  );
  const activeSessions = useMemo(() => sessions.filter((session) => !session.isClosed), [sessions]);
  const closedSessions = useMemo(() => sessions.filter((session) => session.isClosed), [sessions]);
  const filteredProducts = useMemo(
    () => filterInventoryProducts(products, selectedCategory, query),
    [products, query, selectedCategory],
  );
  const categorySummaries = useMemo(() => buildCategorySummaries(products), [products]);
  const selectedProducts = useMemo(
    () =>
      selectedProductIds
        .map((productId) => products.find((product) => product.id === productId))
        .filter((product): product is ProductItem => Boolean(product)),
    [products, selectedProductIds],
  );
  const selectedActiveSession =
    activeSessions.find((session) => session.id === selectedSessionId) ?? activeSessions[0] ?? null;
  const selectedHistorySession =
    closedSessions.find((session) => session.id === selectedSessionId) ?? closedSessions[0] ?? null;

  useEffect(() => {
    if (!createState.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsCreateDialogOpen(false);
      setSelectedResponsibleId("");
      setSelectedProductIds([]);
      setNotes("");
      setQuery("");
      setSelectedCategory("");
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [createState.successMessage, router]);

  useEffect(() => {
    if (!saveState.successMessage && !closeState.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (closeState.successMessage) {
        setActualDrafts({});
      }
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [closeState.successMessage, router, saveState.successMessage]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      if (!isActiveDialogOpen || !selectedActiveSession) {
        setActualDrafts({});
        return;
      }

      setActualDrafts(
        Object.fromEntries(
          selectedActiveSession.items.map((item) => [
            item.id,
            item.actualQuantity === null ? "" : String(item.actualQuantity),
          ]),
        ),
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isActiveDialogOpen, selectedActiveSession]);

  function toggleProduct(productId: number) {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  }

  function updateActualDraft(itemId: number, value: string) {
    setActualDrafts((current) => ({ ...current, [itemId]: normalizeDecimalDraft(value) }));
  }

  return (
    <>
      <InventoryAuditActionsPanel
        productsCount={products.length}
        activeSessionsCount={activeSessions.length}
        lowStockCount={lowStockCount}
        zeroStockCount={zeroStockCount}
        onCreate={() => setIsCreateDialogOpen(true)}
        onOpenActive={() => {
          setSelectedSessionId(activeSessions[0]?.id ?? null);
          setIsActiveDialogOpen(true);
        }}
        onOpenHistory={() => {
          setSelectedSessionId(closedSessions[0]?.id ?? activeSessions[0]?.id ?? null);
          setIsHistoryDialogOpen(true);
        }}
      />

      {isCreateDialogOpen ? (
        <InventoryAuditCreateDialog
          products={products}
          filteredProducts={filteredProducts}
          categorySummaries={categorySummaries}
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
          responsibleOptions={responsibleOptions}
          selectedResponsibleId={selectedResponsibleId}
          selectedCategory={selectedCategory}
          query={query}
          notes={notes}
          canManageInventory={canManageInventory}
          isCreatePending={isCreatePending}
          errorMessage={createState.errorMessage}
          successMessage={createState.successMessage}
          createFormAction={createFormAction}
          onClose={() => setIsCreateDialogOpen(false)}
          onQueryChange={setQuery}
          onCategoryChange={setSelectedCategory}
          onResponsibleChange={setSelectedResponsibleId}
          onNotesChange={setNotes}
          onToggleProduct={toggleProduct}
        />
      ) : null}

      {isActiveDialogOpen ? (
        <InventoryAuditActiveDialog
          sessions={activeSessions}
          selectedSession={selectedActiveSession}
          selectedSessionId={selectedSessionId}
          actualDrafts={actualDrafts}
          canManageInventory={canManageInventory}
          isSavePending={isSavePending}
          isClosePending={isClosePending}
          saveErrorMessage={saveState.errorMessage}
          saveSuccessMessage={saveState.successMessage}
          closeErrorMessage={closeState.errorMessage}
          closeSuccessMessage={closeState.successMessage}
          saveFormAction={saveFormAction}
          closeFormAction={closeFormAction}
          onClose={() => setIsActiveDialogOpen(false)}
          onSelectSession={setSelectedSessionId}
          onActualDraftChange={updateActualDraft}
        />
      ) : null}

      {isHistoryDialogOpen ? (
        <InventoryAuditHistoryDialog
          sessions={closedSessions}
          selectedSession={selectedHistorySession}
          selectedSessionId={selectedSessionId}
          canManageInventory={canManageInventory}
          onClose={() => setIsHistoryDialogOpen(false)}
          onSelectSession={setSelectedSessionId}
        />
      ) : null}
    </>
  );
}

function buildCategorySummaries(products: ProductItem[]) {
  return Array.from(
    new Set(
      products
        .map((product) => product.category)
        .filter((category): category is ProductCategory => Boolean(category)),
    ),
  ).map((category) => ({
    category,
    count: products.filter((product) => product.category === category).length,
  }));
}
