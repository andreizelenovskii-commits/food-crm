import { useState } from "react";
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

function SelectArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SupplierPicker({
  supplierOptions,
  supplierName,
  onSupplierNameChange,
}: {
  supplierOptions: string[];
  supplierName: string;
  onSupplierNameChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSupplierOptions = supplierOptions.length > 0;

  return (
    <label className="mb-2 block space-y-1.5">
      <span className="text-[11px] font-semibold text-zinc-700">Поставщик</span>
      <input type="hidden" name="supplierName" value={supplierName} />
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          disabled={!hasSupplierOptions}
          className="flex h-10 w-full items-center justify-between gap-3 rounded-full border border-red-950/10 bg-white/85 px-4 text-left text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition hover:border-red-200 hover:bg-white focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-800/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          <span className={supplierName ? "truncate" : "truncate text-zinc-400"}>
            {supplierName || (hasSupplierOptions ? "Выбери поставщика" : "Поставщиков пока нет")}
          </span>
          <span className="shrink-0 text-red-800/60">
            <SelectArrowIcon />
          </span>
        </button>
        {isOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[18px] border border-red-100 bg-white/95 p-1.5 shadow-[0_18px_50px_rgba(127,29,29,0.16)] backdrop-blur-xl">
            {supplierOptions.map((supplier) => {
              const isActive = supplierName === supplier;

              return (
                <button
                  key={supplier}
                  type="button"
                  onClick={() => {
                    onSupplierNameChange(supplier);
                    setIsOpen(false);
                  }}
                  className={[
                    "block w-full rounded-[14px] px-3.5 py-2 text-left text-sm font-semibold transition",
                    isActive
                      ? "bg-red-800 text-white"
                      : "text-zinc-800 hover:bg-red-50 hover:text-red-800",
                  ].join(" ")}
                >
                  {supplier}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {!hasSupplierOptions ? (
        <span className="block text-xs leading-5 text-zinc-500">
          Сначала добавь поставщика во вкладке «Поставщики».
        </span>
      ) : null}
    </label>
  );
}

export function InventoryIncomingCreateForm({
  responsibleOptions,
  supplierOptions,
  selectedResponsibleId,
  supplierName,
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
  onOpenSearch,
  onQuantityChange,
  onPriceChange,
  variant = "panel",
}: {
  responsibleOptions: InventoryResponsibleOption[];
  supplierOptions: string[];
  selectedResponsibleId: string;
  supplierName: string;
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
  onOpenSearch: () => void;
  onQuantityChange: (productId: number, value: string) => void;
  onPriceChange: (productId: number, value: string) => void;
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
            <h2 className="mt-0.5 text-base font-semibold text-zinc-950">Новое поступление</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Товары попадут в остатки после завершения акта.
            </p>
          </div>
        </div>
      ) : null}

      {errorMessage ? <IncomingFormMessage>{errorMessage}</IncomingFormMessage> : null}
      {successMessage ? <IncomingFormMessage>{successMessage}</IncomingFormMessage> : null}

      <form
        action={canManageInventory ? createFormAction : undefined}
        className={shouldShowHeader ? "mt-3 space-y-3" : "space-y-3"}
      >
        <IncomingResponsiblePicker
          options={responsibleOptions}
          selectedResponsibleId={selectedResponsibleId}
          onChange={onResponsibleChange}
        />
        <SupplierPicker
          supplierOptions={supplierOptions}
          supplierName={supplierName}
          onSupplierNameChange={onSupplierNameChange}
        />
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
          selectedSupplierName={supplierName}
          canManageInventory={canManageInventory}
          isCreatePending={isCreatePending}
        />
      </form>
    </Container>
  );
}
