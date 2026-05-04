import { ModuleIcon } from "@/components/ui/module-icon";
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
    <aside className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5 xl:sticky xl:top-28 xl:self-start">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
          <ModuleIcon name="receipt" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Новый акт
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Новое поступление</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Добавляй существующие товары. Остатки попадут в систему после завершения акта.
          </p>
        </div>
      </div>

      {errorMessage ? <IncomingFormMessage>{errorMessage}</IncomingFormMessage> : null}
      {successMessage ? <IncomingFormMessage>{successMessage}</IncomingFormMessage> : null}

      <form action={canManageInventory ? createFormAction : undefined} className="mt-4 space-y-4">
        <IncomingResponsiblePicker
          options={responsibleOptions}
          selectedResponsibleId={selectedResponsibleId}
          onChange={onResponsibleChange}
        />
        <label className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-700">Поставщик</span>
          <input
            name="supplierName"
            type="text"
            value={supplierName}
            onChange={(event) => onSupplierNameChange(event.target.value)}
            placeholder="Например: Фермерский двор"
            className="h-10 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-700">Комментарий</span>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={3}
            placeholder="Например: поставка по утренней закупке"
            className="w-full rounded-[18px] border border-red-950/10 bg-white/85 px-4 py-2.5 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
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
