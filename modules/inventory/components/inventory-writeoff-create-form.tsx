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
  notes,
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
  onNotesChange,
  onOpenSearch,
  onQuantityChange,
  onRemoveProduct,
  onClearDraft,
}: {
  responsibleOptions: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  reason: WriteoffReason;
  notes: string;
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
  onNotesChange: (value: string) => void;
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onRemoveProduct: (productId: number) => void;
  onClearDraft: () => void;
}) {
  return (
    <aside className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:sticky xl:top-28 xl:self-start">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Новый акт списания</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Укажи ответственного, причину и количество по товарам. Остатки на складе изменятся после завершения акта.
        </p>
      </div>

      {errorMessage ? <WriteoffFormMessage>{errorMessage}</WriteoffFormMessage> : null}
      {successMessage ? <WriteoffFormMessage>{successMessage}</WriteoffFormMessage> : null}

      <form action={canManageInventory ? createFormAction : undefined} className="mt-4 space-y-5">
        <div className="grid gap-4">
          <WriteoffResponsiblePicker
            options={responsibleOptions}
            selectedResponsibleId={selectedResponsibleId}
            onChange={onResponsibleChange}
          />
          <WriteoffReasonPicker reason={reason} onChange={onReasonChange} />
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Комментарий</span>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            placeholder="Например: списание из-за порчи после разморозки"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

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
    </aside>
  );
}
