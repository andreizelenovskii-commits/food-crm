"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import { ClientAddressFieldsWithDefaults } from "@/modules/clients/components/client-address-fields";
import { formatPublicMenuMoney } from "@/modules/catalog/components/public-menu-utils";
import { ORDER_STATUS_LABELS } from "@/modules/orders/orders.workflow";
import type { PublicOrderStatus } from "@/modules/catalog/components/public-menu-cart";

const DELIVERY_FEE_CENTS = 17000;

export function CheckoutPanel({
  createdOrder,
  currentClient,
  deliveryFeeCents,
  isPending,
  message,
  payableCents,
  subtotalCents,
}: {
  createdOrder: PublicOrderStatus | null;
  currentClient: PublicClientProfile | null;
  deliveryFeeCents: number;
  isPending: boolean;
  message: string | null;
  payableCents: number;
  subtotalCents: number;
}) {
  return (
    <aside className="border-t border-[#f6e2e5] bg-[#fffafa] p-5 sm:p-7 lg:border-l lg:border-t-0">
      <div className="rounded-[24px] bg-white p-5 shadow-sm shadow-[#d50014]/5">
        <TotalRow label="Блюда" value={formatPublicMenuMoney(subtotalCents)} />
        <TotalRow label="Доставка" value={formatPublicMenuMoney(deliveryFeeCents)} hint="фиксировано" />
        <TotalRow label="Итого" value={formatPublicMenuMoney(payableCents)} strong />
      </div>
      <CheckoutFields currentClient={currentClient} />
      {message ? <p className="mt-4 rounded-[16px] border border-[#f3dadd] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#6b5960]">{message}</p> : null}
      {createdOrder ? <p className="mt-3 text-sm font-black text-[#b00012]">Статус: {ORDER_STATUS_LABELS[createdOrder.status]}</p> : null}
      <button type="submit" disabled={isPending} className="mt-5 min-h-[52px] w-full rounded-full bg-[#d50014] px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(213,0,20,0.20)] transition hover:bg-[#b90012] disabled:opacity-60">
        {currentClient ? "Оформить заказ" : "Войти для заказа"}
      </button>
    </aside>
  );
}

function CheckoutFields({ currentClient }: { currentClient: PublicClientProfile | null }) {
  const [isOtherRecipient, setIsOtherRecipient] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "courier_card">("cash");
  const addressOptions = (currentClient?.address ?? "").split("\n").map((address) => address.trim()).filter(Boolean);
  const hasCompleteProfile = Boolean(currentClient?.birthDate && addressOptions.length);

  return (
    <div className="mt-5 space-y-4">
      {currentClient && !hasCompleteProfile ? (
        <div className="rounded-[18px] border border-[#ffd0d6] bg-[#fff1f2] p-4 text-sm font-semibold leading-6 text-[#a00010]">
          Профиль заполнен не полностью. Откройте личный кабинет и сохраните дату рождения и адреса доставки.
        </div>
      ) : null}
      <div className="rounded-[22px] border border-[#f3dadd] bg-white p-4 shadow-sm shadow-[#d50014]/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b00012]">Получатель</p>
            <p className="mt-2 text-base font-black text-[#241316]">{currentClient?.phone ?? "Войдите для заказа"}</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-sm font-black text-[#b00012]">
            {currentClient?.name?.slice(0, 1).toLocaleUpperCase("ru-RU") ?? "F"}
          </span>
        </div>
        <button type="button" onClick={() => setIsOtherRecipient((current) => !current)} className="mt-4 min-h-10 rounded-full border border-[#f0d9dc] bg-white px-4 text-sm font-black text-[#b00012] transition hover:border-[#d50014] hover:bg-[#fff1f2]">
          {isOtherRecipient ? "Получатель снова я" : "Получатель не я"}
        </button>
      </div>
      {isOtherRecipient ? (
        <OtherRecipientFields />
      ) : (
        <>
          <input type="hidden" name="recipientPhone" value={currentClient?.phone ?? ""} />
          <AddressPicker addresses={addressOptions} fallbackAddress={currentClient?.address ?? ""} />
        </>
      )}
      <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
      <label className="block space-y-2">
        <span className="text-sm font-black text-[#3a292d]">Комментарий</span>
        <textarea
          name="customerComment"
          className="foodlike-field min-h-28 rounded-[18px] bg-white py-3 font-semibold shadow-sm shadow-[#d50014]/5"
          placeholder="Комментарий к заказу"
        />
      </label>
    </div>
  );
}

function PaymentMethodPicker({
  onChange,
  value,
}: {
  onChange: (value: "cash" | "courier_card") => void;
  value: "cash" | "courier_card";
}) {
  return (
    <section className="rounded-[22px] border border-[#f3dadd] bg-white p-4 shadow-sm shadow-[#d50014]/5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b00012]">Оплата</p>
      <input type="hidden" name="paymentMethod" value={value} />
      <div className="mt-4 grid gap-2">
        <PaymentOption
          active={value === "cash"}
          description="Подготовим сдачу заранее."
          label="Наличными"
          onClick={() => onChange("cash")}
        />
        <PaymentOption
          active={value === "courier_card"}
          description="Наш курьер привезет с собой терминал."
          label="Картой курьеру"
          onClick={() => onChange("courier_card")}
        />
      </div>

      {value === "cash" ? (
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-black text-[#3a292d]">Сдача с купюры</span>
          <input
            name="cashChangeFrom"
            inputMode="numeric"
            placeholder="Например, 5000"
            className="foodlike-field min-h-[52px] rounded-[16px] bg-white font-semibold shadow-sm shadow-[#d50014]/5"
          />
        </label>
      ) : null}

      {value === "courier_card" ? (
        <p className="mt-4 rounded-[16px] border border-[#f3dadd] bg-[#fff7f8] px-4 py-3 text-sm font-semibold leading-6 text-[#6b5960]">
          Наш курьер привезет с собой терминал. Оплатить можно картой при получении.
        </p>
      ) : null}

    </section>
  );
}

function PaymentOption({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-16 items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left transition",
        active
          ? "border-[#d50014] bg-[#fff1f2] shadow-sm shadow-[#d50014]/10"
          : "border-[#f3dadd] bg-white hover:border-[#d50014] hover:bg-[#fff8f8]",
      ].join(" ")}
    >
      <span>
        <span className="block text-sm font-black text-[#241316]">{label}</span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-[#7b5e64]">{description}</span>
      </span>
      <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${active ? "border-[#d50014] bg-[#d50014]" : "border-[#f0cfd3] bg-white"}`}>
        <span className={`size-2.5 rounded-full bg-white ${active ? "opacity-100" : "opacity-0"}`} />
      </span>
    </button>
  );
}

function OtherRecipientFields() {
  return (
    <div className="rounded-[22px] border border-[#f3dadd] bg-white p-4 shadow-sm shadow-[#d50014]/5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b00012]">Другой получатель</p>
      <div className="mt-4 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-black text-[#3a292d]">Телефон получателя</span>
          <PhoneInput
            name="recipientPhone"
            className="foodlike-field min-h-[52px] rounded-[16px] bg-white font-semibold shadow-sm shadow-[#d50014]/5"
            required
          />
        </label>
        <div>
          <p className="mb-3 text-sm font-black text-[#3a292d]">Адрес получателя</p>
          <ClientAddressFieldsWithDefaults />
        </div>
      </div>
    </div>
  );
}

function AddressPicker({ addresses, fallbackAddress }: { addresses: string[]; fallbackAddress: string }) {
  if (addresses.length > 1) {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-black text-[#3a292d]">Адрес доставки</span>
        <select name="deliveryAddress" className="foodlike-field min-h-[52px] rounded-[16px] bg-white font-semibold shadow-sm shadow-[#d50014]/5" required>
          {addresses.map((address) => <option key={address} value={address}>{address}</option>)}
        </select>
      </label>
    );
  }

  return <CartInput name="deliveryAddress" label="Адрес доставки" defaultValue={addresses[0] ?? fallbackAddress} required />;
}

function CartInput({ defaultValue, label, name, required }: { defaultValue: string; label: string; name: string; required?: boolean }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-black text-[#3a292d]">{label}</span>
      <input name={name} defaultValue={defaultValue} className="foodlike-field min-h-[52px] rounded-[16px] bg-white font-semibold shadow-sm shadow-[#d50014]/5" required={required} />
    </label>
  );
}

function TotalRow({ hint, label, strong, value }: { hint?: string; label: string; strong?: boolean; value: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-1.5 ${strong ? "mt-3 border-t border-[#f3dadd] pt-4 text-xl font-black text-[#241316]" : "text-sm font-semibold text-[#6b5960]"}`}>
      <span>
        {label}
        {hint ? <span className="ml-2 text-xs font-black uppercase tracking-[0.12em] text-[#b00012]">{hint}</span> : null}
      </span>
      <span className={strong ? "text-[#c90013]" : "font-semibold text-[#241316]"}>{value}</span>
    </div>
  );
}

export { DELIVERY_FEE_CENTS };
