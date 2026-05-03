import type { InventoryResponsibleOption } from "@/modules/inventory/inventory.types";
import {
  IncomingCreateFooter,
  IncomingDraftProducts,
  IncomingFormMessage,
  IncomingResponsiblePicker,
  type IncomingDraftProduct,
} from "@/modules/inventory/components/inventory-incoming-create-form-parts";

type FormAction = (formData: FormData) => void;

export function InventoryIncomingCreateForm({
  responsibleOptions,
  selectedResponsibleId,
  supplierName,
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
  onSupplierNameChange,
  onNotesChange,
  onOpenSearch,
  onQuantityChange,
  onPriceChange,
}: {
  responsibleOptions: InventoryResponsibleOption[];
  selectedResponsibleId: string;
  supplierName: string;
  notes: string;
  selectedProducts: IncomingDraftProduct[];
  draftEntries: Array<{ productId: string; quantity: string; price: string }>;
  draftTotalCents: number;
  canManageInventory: boolean;
  isCreatePending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  createFormAction: FormAction;
  onResponsibleChange: (value: string) => void;
  onSupplierNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onPriceChange: (productId: number, value: string) => void;
}) {
  return (
    <aside className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:sticky xl:top-28 xl:self-start">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Новое поступление</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Добавляй в акт только товары, которые уже есть на складе. Новые остатки попадут в систему после завершения акта.
        </p>
      </div>

      {errorMessage ? <IncomingFormMessage>{errorMessage}</IncomingFormMessage> : null}
      {successMessage ? <IncomingFormMessage>{successMessage}</IncomingFormMessage> : null}

      <form action={canManageInventory ? createFormAction : undefined} className="mt-4 space-y-5">
        <IncomingResponsiblePicker
          options={responsibleOptions}
          selectedResponsibleId={selectedResponsibleId}
          onChange={onResponsibleChange}
        />
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Поставщик</span>
          <input
            name="supplierName"
            type="text"
            value={supplierName}
            onChange={(event) => onSupplierNameChange(event.target.value)}
            placeholder="Например: Фермерский двор"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Комментарий</span>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            placeholder="Например: поставка по утренней закупке"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        {draftEntries.map((entry) => (
          <div key={entry.productId}>
            <input type="hidden" name="productId" value={entry.productId} />
            <input type="hidden" name="quantity" value={entry.quantity} />
            <input type="hidden" name="price" value={entry.price} />
          </div>
        ))}

        <IncomingDraftProducts
          selectedProducts={selectedProducts}
          onOpenSearch={onOpenSearch}
          onQuantityChange={onQuantityChange}
          onPriceChange={onPriceChange}
        />
        <IncomingCreateFooter
          draftEntriesCount={draftEntries.length}
          draftTotalCents={draftTotalCents}
          selectedResponsibleId={selectedResponsibleId}
          canManageInventory={canManageInventory}
          isCreatePending={isCreatePending}
        />
      </form>
    </aside>
  );
}
