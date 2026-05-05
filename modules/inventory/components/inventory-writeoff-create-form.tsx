import { ModuleIcon } from "@/components/ui/module-icon";
import type {
  InventoryResponsibleOption,
  WriteoffReason,
} from "@/modules/inventory/inventory.types";
import {
  WriteoffCreateFooter,
  WriteoffDraftProducts,
  WriteoffFormMessage,
  WriteoffReasonPicker,
  WriteoffResponsiblePicker,
  type WriteoffDraftProduct,
} from "@/modules/inventory/components/inventory-writeoff-create-form-parts";

type FormAction = (formData: FormData) => void;

export function InventoryWriteoffCreateForm({
  responsibleOptions,
  selectedResponsibleId,
  reason,
  selectedProducts,
  draftEntries,
  draftTotalCents,
  canManageInventory,
  isCreatePending,
  errorMessage,
  successMessage,
  createFormAction,
  onResponsibleChange,
  onReasonChange,
  onOpenSearch,
  onQuantityChange,
  onRemoveProduct,
  onClearDraft,
  variant = "panel",
}: {
  responsibleOptions: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  reason: WriteoffReason;
  selectedProducts: WriteoffDraftProduct[];
  draftEntries: Array<{ productId: string; quantity: string }>;
  draftTotalCents: number;
  canManageInventory: boolean;
  isCreatePending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  createFormAction: FormAction;
  onResponsibleChange: (value: string) => void;
  onReasonChange: (value: WriteoffReason) => void;
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onRemoveProduct: (productId: number) => void;
  onClearDraft: () => void;
  variant?: "panel" | "dialog";
}) {
  const containerClassName =
    variant === "dialog"
      ? "rounded-[20px] border border-white/70 bg-white/72 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4"
      : "rounded-[20px] border border-white/70 bg-white/72 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4 xl:sticky xl:top-28 xl:self-start";
  const Container = variant === "dialog" ? "section" : "aside";
  const shouldShowHeader = variant !== "dialog";

  return (
    <Container className={containerClassName}>
      {shouldShowHeader ? (
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="receipt" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
              Новый акт
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-zinc-950">Новое списание</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Остатки изменятся после завершения акта.
            </p>
          </div>
        </div>
      ) : null}

      {errorMessage ? <WriteoffFormMessage>{errorMessage}</WriteoffFormMessage> : null}
      {successMessage ? <WriteoffFormMessage>{successMessage}</WriteoffFormMessage> : null}

      <form action={canManageInventory ? createFormAction : undefined} className={shouldShowHeader ? "mt-3 space-y-3" : "space-y-3"}>
        <WriteoffResponsiblePicker
          options={responsibleOptions}
          selectedResponsibleId={selectedResponsibleId}
          onChange={onResponsibleChange}
        />
        <WriteoffReasonPicker reason={reason} onChange={onReasonChange} />

        {draftEntries.map((entry) => (
          <div key={entry.productId}>
            <input type="hidden" name="productId" value={entry.productId} />
            <input type="hidden" name="quantity" value={entry.quantity} />
          </div>
        ))}

        <WriteoffDraftProducts
          selectedProducts={selectedProducts}
          onOpenSearch={onOpenSearch}
          onQuantityChange={onQuantityChange}
          onRemoveProduct={onRemoveProduct}
        />
        <WriteoffCreateFooter
          draftEntriesCount={draftEntries.length}
          draftTotalCents={draftTotalCents}
          selectedResponsibleId={selectedResponsibleId}
          canManageInventory={canManageInventory}
          isCreatePending={isCreatePending}
          onClearDraft={onClearDraft}
        />
      </form>
    </Container>
  );
}
