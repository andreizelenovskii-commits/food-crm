"use client";

import { useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
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
    <aside className="border-t border-[#f6e2e5] bg-[#fffafa] p-4 sm:p-5 lg:border-l lg:border-t-0">
      <div className="rounded-[18px] bg-white p-4 shadow-sm shadow-[#d50014]/5">
        <TotalRow label="Блюда" value={formatPublicMenuMoney(subtotalCents)} />
        <TotalRow label="Доставка" value={formatPublicMenuMoney(deliveryFeeCents)} />
        <TotalRow label="Итого" value={formatPublicMenuMoney(payableCents)} strong />
      </div>
      <CheckoutFields currentClient={currentClient} />
      {message ? <p className="mt-3 rounded-[14px] border border-[#f3dadd] bg-white px-4 py-3 text-sm text-[#6b5960]">{message}</p> : null}
      {createdOrder ? <p className="mt-3 text-sm font-semibold text-[#b00012]">Статус: {ORDER_STATUS_LABELS[createdOrder.status]}</p> : null}
      <button type="submit" disabled={isPending} className="mt-4 min-h-12 w-full rounded-[16px] bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012] disabled:opacity-60">
        {currentClient ? "Оформить заказ" : "Войти для заказа"}
      </button>
    </aside>
  );
}

function CheckoutFields({ currentClient }: { currentClient: PublicClientProfile | null }) {
  const [isOtherRecipient, setIsOtherRecipient] = useState(false);
  const addressOptions = (currentClient?.address ?? "").split("\n").map((address) => address.trim()).filter(Boolean);
  const hasCompleteProfile = Boolean(currentClient?.birthDate && addressOptions.length);

  return (
    <div className="mt-4 space-y-3">
      {currentClient && !hasCompleteProfile ? (
        <div className="rounded-[16px] border border-[#ffd0d6] bg-[#fff1f2] p-3 text-sm leading-5 text-[#a00010]">
          Профиль заполнен не полностью. Откройте личный кабинет и сохраните дату рождения и адреса доставки.
        </div>
      ) : null}
      <div className="rounded-[16px] border border-[#f3dadd] bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b00012]">Получатель</p>
        <p className="mt-1 text-sm font-semibold text-[#241316]">{currentClient?.phone ?? "Войдите для заказа"}</p>
        <button type="button" onClick={() => setIsOtherRecipient((current) => !current)} className="mt-3 rounded-full border border-[#f0d9dc] px-3 py-1.5 text-xs font-semibold text-[#b00012] transition hover:bg-[#fff1f2]">
          {isOtherRecipient ? "Получатель снова я" : "Получатель не я"}
        </button>
      </div>
      {isOtherRecipient ? (
        <>
          <CartInput name="recipientPhone" label="Телефон получателя" defaultValue="" required />
          <CartInput name="deliveryAddress" label="Адрес получателя" defaultValue="" required />
        </>
      ) : (
        <>
          <input type="hidden" name="recipientPhone" value={currentClient?.phone ?? ""} />
          <AddressPicker addresses={addressOptions} fallbackAddress={currentClient?.address ?? ""} />
        </>
      )}
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#3a292d]">Оплата</span>
        <select name="paymentMethod" className="foodlike-field min-h-12 rounded-[14px]" defaultValue="cash" required>
          <option value="cash">Наличными</option>
          <option value="courier_card">Картой курьеру</option>
          <option value="online">Онлайн оплата</option>
        </select>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#3a292d]">Комментарий</span>
        <textarea name="customerComment" className="foodlike-field min-h-24 rounded-[14px] py-3" />
      </label>
    </div>
  );
}

function AddressPicker({ addresses, fallbackAddress }: { addresses: string[]; fallbackAddress: string }) {
  if (addresses.length > 1) {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#3a292d]">Адрес доставки</span>
        <select name="deliveryAddress" className="foodlike-field min-h-12 rounded-[14px]" required>
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
      <span className="text-sm font-semibold text-[#3a292d]">{label}</span>
      <input name={name} defaultValue={defaultValue} className="foodlike-field min-h-12 rounded-[14px]" required={required} />
    </label>
  );
}

function TotalRow({ label, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-1 ${strong ? "mt-2 border-t border-[#f3dadd] pt-3 text-lg font-semibold text-[#241316]" : "text-sm text-[#6b5960]"}`}>
      <span>{label}</span>
      <span className={strong ? "text-[#c90013]" : "font-semibold text-[#241316]"}>{value}</span>
    </div>
  );
}

export { DELIVERY_FEE_CENTS };
