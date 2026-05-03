"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeWriteoffActAction,
  createWriteoffActAction,
  deleteWriteoffActAction,
  type WriteoffActCreateFormState,
  type WriteoffActProgressFormState,
} from "@/modules/inventory/inventory.actions";
import { InventoryProductSearchDialog } from "@/modules/inventory/components/inventory-product-search-dialog";
import { InventoryWriteoffCreateForm } from "@/modules/inventory/components/inventory-writeoff-create-form";
import {
  WriteoffCompletedActsDialog,
  WriteoffDeleteDialog,
} from "@/modules/inventory/components/inventory-writeoff-dialogs";
import {
  InventoryPanelMessage,
  WriteoffCompletedActsSection,
  WriteoffOpenActsSection,
  WriteoffOverview,
} from "@/modules/inventory/components/inventory-writeoff-sections";
import {
  normalizeDecimalDraft,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";
import {
  filterInventoryProducts,
  groupInventoryProducts,
  groupWriteoffActsByReason,
} from "@/modules/inventory/components/inventory-product-grouping";
import {
  WRITEOFF_REASONS,
  type InventoryResponsibleOption,
  type ProductCategory,
  type ProductItem,
  type WriteoffActSummary,
  type WriteoffReason,
} from "@/modules/inventory/inventory.types";

export function InventoryWriteoffPanel({
  products,
  responsibleOptions,
  acts,
  canManageInventory,
}: {
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  acts: WriteoffActSummary[];
  canManageInventory: boolean;
}) {
  const router = useRouter();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isCompletedActsDialogOpen, setIsCompletedActsDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<WriteoffActSummary | null>(null);
  const [selectedCompletedReason, setSelectedCompletedReason] = useState<WriteoffReason | "">("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [selectedResponsibleId, setSelectedResponsibleId] = useState("");
  const [reason, setReason] = useState<WriteoffReason>(WRITEOFF_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [draft, setDraft] = useState<Record<number, string>>({});
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
    createWriteoffActAction,
    createInitialState,
  );
  const [completeState, completeFormAction, isCompletePending] = useActionState(
    completeWriteoffActAction,
    progressInitialState,
  );
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    deleteWriteoffActAction,
    progressInitialState,
  );

  useEffect(() => {
    if (!createState.successMessage && !completeState.successMessage && !deleteState.successMessage) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (createState.successMessage) {
        clearDraft();
        setNotes("");
        setSelectedResponsibleId("");
        setReason(WRITEOFF_REASONS[0]);
        setIsSearchDialogOpen(false);
      }
      if (deleteState.successMessage) {
        setDeleteCandidate(null);
      }
      router.refresh();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [completeState.successMessage, createState.successMessage, deleteState.successMessage, router]);

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
          return product ? { product, quantity: draft[productId] ?? "" } : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [draft, products, selectedProductIds],
  );
  const draftEntries = useMemo(
    () =>
      selectedProductIds.flatMap((productId) => {
        const quantity = draft[productId]?.trim() ?? "";
        return quantity ? [{ productId: String(productId), quantity }] : [];
      }),
    [draft, selectedProductIds],
  );
  const draftTotalCents = useMemo(
    () =>
      selectedProducts.reduce((sum, item) => {
        const quantity = parseQuantity(item.quantity || "0");
        return quantity > 0 ? sum + quantity * item.product.priceCents : sum;
      }, 0),
    [selectedProducts],
  );
  const openActs = acts.filter((act) => !act.isCompleted);
  const completedActs = acts.filter((act) => act.isCompleted);
  const latestCompletedAct = completedActs[0] ?? null;
  const totalCompletedWriteoffCents = completedActs.reduce((sum, act) => sum + act.totalCents, 0);
  const completedActsByReason = useMemo(() => groupWriteoffActsByReason(completedActs), [completedActs]);
  const visibleCompletedReason = selectedCompletedReason || completedActsByReason[0]?.reason || "";
  const visibleCompletedActs =
    completedActsByReason.find((group) => group.reason === visibleCompletedReason)?.acts ?? [];

  function setDraftValue(productId: number, value: string) {
    setDraft((current) => ({ ...current, [productId]: normalizeDecimalDraft(value) }));
  }

  function addProductToDraft(productId: number) {
    setSelectedProductIds((current) => (current.includes(productId) ? current : [...current, productId]));
    setDraft((current) => (productId in current ? current : { ...current, [productId]: "" }));
  }

  function removeProductFromDraft(productId: number) {
    setSelectedProductIds((current) => current.filter((id) => id !== productId));
    setDraft((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  function clearDraft() {
    setSelectedProductIds([]);
    setDraft({});
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
      <div className="space-y-4">
        <WriteoffOverview
          openCount={openActs.length}
          completedCount={completedActs.length}
          totalCompletedCents={totalCompletedWriteoffCents}
        />
        {completeState.errorMessage ? <InventoryPanelMessage>{completeState.errorMessage}</InventoryPanelMessage> : null}
        {deleteState.errorMessage ? <InventoryPanelMessage>{deleteState.errorMessage}</InventoryPanelMessage> : null}
        {completeState.successMessage ? <InventoryPanelMessage>{completeState.successMessage}</InventoryPanelMessage> : null}
        {deleteState.successMessage ? <InventoryPanelMessage>{deleteState.successMessage}</InventoryPanelMessage> : null}
        <WriteoffOpenActsSection
          acts={openActs}
          canManageInventory={canManageInventory}
          isCompletePending={isCompletePending}
          completeFormAction={completeFormAction}
          onDelete={setDeleteCandidate}
        />
        <WriteoffCompletedActsSection
          latestAct={latestCompletedAct}
          totalCount={completedActs.length}
          canManageInventory={canManageInventory}
          isCompletePending={isCompletePending}
          completeFormAction={completeFormAction}
          onOpenArchive={() => {
            setSelectedCompletedReason(completedActsByReason[0]?.reason ?? "");
            setIsCompletedActsDialogOpen(true);
          }}
          onDelete={setDeleteCandidate}
        />
      </div>

      <InventoryWriteoffCreateForm
        responsibleOptions={responsibleOptions}
        selectedResponsibleId={selectedResponsibleId}
        reason={reason}
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
        onReasonChange={setReason}
        onNotesChange={setNotes}
        onOpenSearch={() => setIsSearchDialogOpen(true)}
        onQuantityChange={setDraftValue}
        onRemoveProduct={removeProductFromDraft}
        onClearDraft={clearDraft}
      />

      {isSearchDialogOpen ? (
        <InventoryProductSearchDialog
          title="Добавить товар в акт списания"
          description="Найди товар по названию, SKU или категории и добавь его в состав акта."
          searchLabel="Поиск по товару"
          categoryTone="rose"
          products={products}
          groupedProducts={filteredProductsByCategory}
          selectedProductIds={selectedProductIds}
          selectedCategory={selectedCategory}
          query={query}
          onClose={() => setIsSearchDialogOpen(false)}
          onQueryChange={setQuery}
          onCategoryChange={setSelectedCategory}
          onAddProduct={addProductToDraft}
          productNote={(product) => `Списание проводится в ${product.unit}`}
        />
      ) : null}

      {isCompletedActsDialogOpen ? (
        <WriteoffCompletedActsDialog
          groups={completedActsByReason}
          visibleReason={visibleCompletedReason}
          visibleActs={visibleCompletedActs}
          canManageInventory={canManageInventory}
          isCompletePending={isCompletePending}
          completeFormAction={completeFormAction}
          onReasonChange={setSelectedCompletedReason}
          onClose={() => setIsCompletedActsDialogOpen(false)}
          onDelete={setDeleteCandidate}
        />
      ) : null}

      {deleteCandidate ? (
        <WriteoffDeleteDialog
          act={deleteCandidate}
          isDeletePending={isDeletePending}
          deleteFormAction={deleteFormAction}
          onClose={() => setDeleteCandidate(null)}
        />
      ) : null}
    </div>
  );
}
