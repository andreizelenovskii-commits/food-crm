import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";
import type { SelectedOrderItem } from "@/modules/orders/components/order-create.types";
import { formatMoney } from "@/modules/orders/components/order-create-utils";
import {
  DEFAULT_DELIVERY_FEE_CENTS,
  INITIAL_ORDER_STATUS,
  ORDER_STATUS_LABELS,
} from "@/modules/orders/orders.workflow";

export function OrderCreateParamsPanel({
  selectedClient,
  selectedEmployee,
  isInternal,
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
  onOpenClientPicker,
  onOpenEmployeePicker,
  onDeliveryFeeChange,
  onClose,
}: {
  selectedClient: Client | null;
  selectedEmployee: Employee | null;
  isInternal: boolean;
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
  onOpenClientPicker: () => void;
  onOpenEmployeePicker: () => void;
  onDeliveryFeeChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <aside className="space-y-5 rounded-[22px] border border-red-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff4f2_100%)] p-5 shadow-sm shadow-red-950/5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-red-800/70">
          Параметры заказа
        </h3>
        <p className="text-sm leading-6 text-zinc-600">
          Заполни клиента, исполнителя и проверь состав перед созданием.
        </p>
      </div>

      <PersonPickButton
        label="Клиент"
        hiddenName="clientId"
        hiddenValue={selectedClient ? String(selectedClient.id) : ""}
        title={selectedClient ? selectedClient.name : "Выбери клиента"}
        subtitle={selectedClient ? selectedClient.phone : "Поиск откроется в отдельном окне"}
        onClick={onOpenClientPicker}
      />

      {!isInternal && selectedClient?.loyaltyLevel ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm shadow-red-950/5">
          <p className="font-medium">У клиента уровень {LOYALTY_LEVEL_LABELS[selectedClient.loyaltyLevel]}</p>
          <p className="mt-1 text-red-800">Автоматическая скидка на заказ: {discountPercent}%</p>
        </div>
      ) : null}

      <PersonPickButton
        label="Исполнитель"
        hiddenName="employeeId"
        hiddenValue={selectedEmployee ? String(selectedEmployee.id) : ""}
        title={selectedEmployee ? selectedEmployee.name : "Выбери исполнителя"}
        subtitle={
          selectedEmployee
            ? `${selectedEmployee.role}${selectedEmployee.phone ? ` · ${selectedEmployee.phone}` : ""}`
            : "Поиск откроется в отдельном окне"
        }
        onClick={onOpenEmployeePicker}
      />

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-700">Стартовый этап</span>
        <div className="rounded-2xl border border-red-100 bg-white/85 px-4 py-3 shadow-sm shadow-red-950/5">
          <p className="text-sm font-medium text-zinc-950">{ORDER_STATUS_LABELS[INITIAL_ORDER_STATUS]}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            После создания заказ сразу уходит на кухню. Дальше его последовательно двигают повар, диспетчер и курьер.
          </p>
        </div>
        <input type="hidden" name="status" value={INITIAL_ORDER_STATUS} />
      </label>

      <DeliveryFeeField
        isInternal={isInternal}
        canEditDeliveryFee={canEditDeliveryFee}
        deliveryFeeRubles={deliveryFeeRubles}
        deliveryFeeCents={deliveryFeeCents}
        onDeliveryFeeChange={onDeliveryFeeChange}
      />

      <input type="hidden" name="items" value={itemsPayload} />
      <OrderTotals
        isInternal={isInternal}
        deliveryFeeCents={deliveryFeeCents}
        discountPercent={discountPercent}
        discountCents={discountCents}
        totalCents={totalCents}
        payableTotalCents={payableTotalCents}
        selectedOrderItems={selectedOrderItems}
      />

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-800 transition hover:bg-red-50">
          Отмена
        </button>
        <button type="submit" disabled={isPending} className="rounded-2xl bg-red-800 px-5 py-3 text-sm font-medium text-white shadow-sm shadow-red-950/20 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300">
          {isPending ? "Создаём..." : "Создать заказ"}
        </button>
      </div>
    </aside>
  );
}

function PersonPickButton({
  label,
  hiddenName,
  hiddenValue,
  title,
  subtitle,
  onClick,
}: {
  label: string;
  hiddenName: string;
  hiddenValue: string;
  title: string;
  subtitle: string | null;
  onClick: () => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <div className="space-y-3">
        <input type="hidden" name={hiddenName} value={hiddenValue} />
        <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-red-100 bg-white px-4 py-3 text-left text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition hover:border-red-200 hover:bg-red-50/50 focus:border-red-300 focus:ring-2 focus:ring-red-800/10">
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{title}</span>
            <span className="mt-1 block truncate text-xs text-zinc-500">{subtitle}</span>
          </span>
          <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800">
            Найти
          </span>
        </button>
      </div>
    </label>
  );
}

function DeliveryFeeField({
  isInternal,
  canEditDeliveryFee,
  deliveryFeeRubles,
  deliveryFeeCents,
  onDeliveryFeeChange,
}: {
  isInternal: boolean;
  canEditDeliveryFee: boolean;
  deliveryFeeRubles: string;
  deliveryFeeCents: number;
  onDeliveryFeeChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-700">Доставка</span>
      {isInternal ? (
        <FeeNotice title="Не добавляется" hint="Во внутренние заказы доставка автоматически не включается." />
      ) : canEditDeliveryFee ? (
        <div className="space-y-2">
          <input
            type="number"
            min="0"
            step="1"
            value={deliveryFeeRubles}
            onChange={(event) => onDeliveryFeeChange(event.target.value)}
            className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
          <p className="text-xs leading-5 text-zinc-500">Базовая стоимость доставки 170 ₽. Менять её может только управляющий.</p>
          <input type="hidden" name="deliveryFeeCents" value={String(deliveryFeeCents)} />
        </div>
      ) : (
        <>
          <FeeNotice title={formatMoney(DEFAULT_DELIVERY_FEE_CENTS)} hint="Доставка добавится к клиентскому заказу автоматически." />
          <input type="hidden" name="deliveryFeeCents" value={String(DEFAULT_DELIVERY_FEE_CENTS)} />
        </>
      )}
      {canEditDeliveryFee && !isInternal ? null : isInternal ? (
        <input type="hidden" name="deliveryFeeCents" value="0" />
      ) : null}
    </label>
  );
}

function FeeNotice({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white/85 px-4 py-3 shadow-sm shadow-red-950/5">
      <p className="text-sm font-medium text-zinc-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>
    </div>
  );
}

function OrderTotals({
  isInternal,
  deliveryFeeCents,
  discountPercent,
  discountCents,
  totalCents,
  payableTotalCents,
  selectedOrderItems,
}: {
  isInternal: boolean;
  deliveryFeeCents: number;
  discountPercent: number;
  discountCents: number;
  totalCents: number;
  payableTotalCents: number;
  selectedOrderItems: SelectedOrderItem[];
}) {
  return (
    <div className="rounded-[18px] border border-red-100 bg-white/85 p-4 shadow-sm shadow-red-950/5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-600">Выбрано позиций</span>
        <span className="text-sm font-semibold text-zinc-950">{selectedOrderItems.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {selectedOrderItems.length === 0 ? (
          <p className="text-sm text-zinc-500">Добавь позиции слева.</p>
        ) : (
          selectedOrderItems.map((entry) => (
            <div key={entry.item.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">
                  {entry.item.name}
                  {entry.item.pizzaSize ? ` · ${entry.item.pizzaSize}` : ""}
                </p>
                <p className="text-zinc-500">{entry.quantity} × {formatMoney(entry.item.priceCents)}</p>
              </div>
              <span className="shrink-0 font-medium text-zinc-900">{formatMoney(entry.totalCents)}</span>
            </div>
          ))
        )}
      </div>
      <TotalRow label="Подытог" value={formatMoney(totalCents)} withBorder />
      {!isInternal ? <TotalRow label="Доставка" value={formatMoney(deliveryFeeCents)} /> : null}
      {!isInternal && discountPercent > 0 ? (
        <TotalRow label={`Скидка по лояльности (${discountPercent}%)`} value={`-${formatMoney(discountCents)}`} tone="text-red-800" />
      ) : null}
      <TotalRow label="Итого" value={formatMoney(payableTotalCents)} withBorder size="lg" />
    </div>
  );
}

function TotalRow({
  label,
  value,
  tone = "text-zinc-950",
  withBorder = false,
  size = "base",
}: {
  label: string;
  value: string;
  tone?: string;
  withBorder?: boolean;
  size?: "base" | "lg";
}) {
  return (
    <div className={`${withBorder ? "mt-4 border-t border-red-100 pt-4" : "mt-3"} flex items-center justify-between gap-3`}>
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className={`${size === "lg" ? "text-lg" : "text-base"} font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
