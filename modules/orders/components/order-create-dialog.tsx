import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import { OrderCreateCatalogSection } from "@/modules/orders/components/order-create-catalog-section";
import { OrderCreateParamsPanel } from "@/modules/orders/components/order-create-params-panel";
import type { SelectedOrderItem } from "@/modules/orders/components/order-create.types";

export function OrderCreateFab({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-full bg-red-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/25 transition hover:bg-red-900"
      aria-label="Создать заказ"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/16">
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M10 4.5V15.5M4.5 10H15.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span>Создать заказ</span>
    </button>
  );
}

export function OrderCreateDialog({
  formAction,
  isInternal,
  catalogQuery,
  selectedCategory,
  availableCategories,
  filteredCatalogItems,
  selectedItems,
  selectedClient,
  selectedEmployee,
  canEditDeliveryFee,
  deliveryFeeRubles,
  deliveryFeeCents,
  discountPercent,
  discountCents,
  totalCents,
  payableTotalCents,
  selectedOrderItems,
  itemsPayload,
  errorMessage,
  isPending,
  onClose,
  onSwitchOrderType,
  onCatalogQueryChange,
  onCategoryChange,
  onQuantityChange,
  onOpenClientPicker,
  onOpenEmployeePicker,
  onDeliveryFeeChange,
}: {
  formAction: (formData: FormData) => void;
  isInternal: boolean;
  catalogQuery: string;
  selectedCategory: string;
  availableCategories: string[];
  filteredCatalogItems: CatalogItem[];
  selectedItems: Record<number, number>;
  selectedClient: Client | null;
  selectedEmployee: Employee | null;
  canEditDeliveryFee: boolean;
  deliveryFeeRubles: string;
  deliveryFeeCents: number;
  discountPercent: number;
  discountCents: number;
  totalCents: number;
  payableTotalCents: number;
  selectedOrderItems: SelectedOrderItem[];
  itemsPayload: string;
  errorMessage: string | null;
  isPending: boolean;
  onClose: () => void;
  onSwitchOrderType: (value: boolean) => void;
  onCatalogQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onQuantityChange: (catalogItemId: number, quantity: number) => void;
  onOpenClientPicker: () => void;
  onOpenEmployeePicker: () => void;
  onDeliveryFeeChange: (value: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center overflow-y-auto bg-zinc-950/35 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-5xl overflow-hidden rounded-[30px] border border-red-100 bg-[#fffdfc] shadow-2xl shadow-red-950/20"
        onClick={(event) => event.stopPropagation()}
      >
        <form action={formAction} className="flex max-h-[calc(100vh-2rem)] flex-col p-4 sm:max-h-[calc(100vh-3rem)] sm:p-5">
          <DialogHeader onClose={onClose} />

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <OrderCreateCatalogSection
                isInternal={isInternal}
                catalogQuery={catalogQuery}
                selectedCategory={selectedCategory}
                availableCategories={availableCategories}
                filteredCatalogItems={filteredCatalogItems}
                selectedItems={selectedItems}
                onSwitchOrderType={onSwitchOrderType}
                onCatalogQueryChange={onCatalogQueryChange}
                onCategoryChange={onCategoryChange}
                onQuantityChange={onQuantityChange}
              />
              <OrderCreateParamsPanel
                selectedClient={selectedClient}
                selectedEmployee={selectedEmployee}
                isInternal={isInternal}
                canEditDeliveryFee={canEditDeliveryFee}
                deliveryFeeRubles={deliveryFeeRubles}
                deliveryFeeCents={deliveryFeeCents}
                discountPercent={discountPercent}
                discountCents={discountCents}
                totalCents={totalCents}
                payableTotalCents={payableTotalCents}
                selectedOrderItems={selectedOrderItems}
                itemsPayload={itemsPayload}
                errorMessage={errorMessage}
                isPending={isPending}
                onOpenClientPicker={onOpenClientPicker}
                onOpenEmployeePicker={onOpenEmployeePicker}
                onDeliveryFeeChange={onDeliveryFeeChange}
                onClose={onClose}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function DialogHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff3f3_100%)] px-4 py-4 shadow-sm shadow-red-950/5">
      <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-800/70">
          Новый заказ
        </p>
        <h2 className="text-xl font-semibold text-zinc-950">Создать заказ</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Выбери тип заказа, нужные позиции из подходящего прайса, клиента и исполнителя.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900"
        aria-label="Закрыть окно"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      </div>
    </div>
  );
}
