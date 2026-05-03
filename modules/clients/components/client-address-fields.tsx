"use client";

import { useState } from "react";
import { OHA_CLIENT_ADDRESS_SUGGESTIONS } from "@/modules/clients/client-addresses";
import {
  createEmptyAddressDraft,
  formatAddressDraft,
  getInitialAddressDrafts,
  type AddressDraft,
  type AddressFieldDefaults,
} from "@/modules/clients/components/client-address-draft";

function extractStreetName(address: string) {
  const match = address.match(/ул\.\s*([^,]+)/i);
  return match?.[1]?.trim() ?? address;
}

const OHA_STREET_OPTIONS = Array.from(
  new Set(OHA_CLIENT_ADDRESS_SUGGESTIONS.map(extractStreetName)),
).sort((left, right) => left.localeCompare(right, "ru"));

export function ClientAddressFields() {
  return <ClientAddressFieldsWithDefaults />;
}

export function ClientAddressFieldsWithDefaults({
  defaultAddress,
  addressesJsonDefault,
  fieldDefaults,
}: {
  defaultAddress?: string | null;
  addressesJsonDefault?: string;
  fieldDefaults?: AddressFieldDefaults;
}) {
  const [addresses, setAddresses] = useState<AddressDraft[]>(() =>
    getInitialAddressDrafts(defaultAddress, addressesJsonDefault, fieldDefaults),
  );
  const serializedAddresses = JSON.stringify(
    addresses
      .map(formatAddressDraft)
      .filter(Boolean),
  );

  const updateAddress = (id: string, patch: Partial<AddressDraft>) => {
    setAddresses((current) =>
      current.map((address) => (address.id === id ? { ...address, ...patch } : address)),
    );
  };

  const collapseAddress = (id: string) => {
    setAddresses((current) =>
      current.map((address) => (address.id === id ? { ...address, isCollapsed: true } : address)),
    );
  };

  const expandAddress = (id: string) => {
    setAddresses((current) =>
      current.map((address) => (address.id === id ? { ...address, isCollapsed: false } : address)),
    );
  };

  const addAddress = () => {
    setAddresses((current) => [...current, createEmptyAddressDraft()]);
  };

  const removeAddress = (id: string) => {
    setAddresses((current) =>
      current.length === 1 ? [createEmptyAddressDraft()] : current.filter((address) => address.id !== id),
    );
  };

  return (
    <div className="space-y-3 rounded-[18px] border border-red-950/10 bg-white/55 p-3">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-zinc-900">Адреса</p>
        <p className="text-[11px] leading-4 text-zinc-500">
          Можно добавить несколько адресов доставки для одного клиента.
        </p>
      </div>

      <input type="hidden" name="addressesJson" value={serializedAddresses} />

      <div className="space-y-3">
        {addresses.map((address, index) => (
          <AddressDraftFields
            key={address.id}
            address={address}
            index={index}
            canRemove={addresses.length > 1 || Boolean(formatAddressDraft(address))}
            onChange={(patch) => updateAddress(address.id, patch)}
            onSave={() => collapseAddress(address.id)}
            onEdit={() => expandAddress(address.id)}
            onRemove={() => removeAddress(address.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addAddress}
        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
      >
        Добавить ещё адрес
      </button>
    </div>
  );
}

function AddressDraftFields({
  address,
  index,
  canRemove,
  onChange,
  onSave,
  onEdit,
  onRemove,
}: {
  address: AddressDraft;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<AddressDraft>) => void;
  onSave: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const summary = formatAddressDraft(address);

  if (address.isCollapsed && summary) {
    return (
      <div className="animate-[module-slide-in_260ms_ease-out] rounded-[16px] border border-red-950/10 bg-white/85 px-3 py-2.5 shadow-sm shadow-red-950/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
              Адрес {index + 1}
            </p>
            <p className="mt-1 truncate text-xs font-medium text-zinc-950">{summary}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Изменить
            </button>
            {canRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                Удалить
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-[module-slide-in_260ms_ease-out] space-y-3 rounded-[16px] border border-red-950/10 bg-white/85 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-zinc-950">Адрес {index + 1}</p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Удалить
          </button>
        ) : null}
      </div>

      {summary ? (
        <p className="rounded-[16px] bg-red-50/70 px-3 py-2 text-xs leading-5 text-red-900">
          {summary}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange({ residenceType: "APARTMENT" })}
          className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
            address.residenceType === "APARTMENT"
              ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/20"
              : "border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
          }`}
        >
          Квартира
        </button>
        <button
          type="button"
          onClick={() => onChange({ residenceType: "PRIVATE_HOUSE" })}
          className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
            address.residenceType === "PRIVATE_HOUSE"
              ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/20"
              : "border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
          }`}
        >
          Частный дом
        </button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <AddressInput label="Город" value={address.city} onChange={(city) => onChange({ city })} />
        <AddressInput
          label="Улица"
          value={address.street}
          placeholder="Например: Ленина"
          list="oha-client-streets"
          onChange={(street) => onChange({ street })}
        />
        <AddressInput label="Дом" value={address.house} placeholder="10" onChange={(house) => onChange({ house })} />

        {address.residenceType === "APARTMENT" ? (
          <>
            <AddressInput label="Подъезд" value={address.entrance} placeholder="2" onChange={(entrance) => onChange({ entrance })} />
            <AddressInput label="Этаж" value={address.floor} placeholder="5" onChange={(floor) => onChange({ floor })} />
            <AddressInput label="Квартира" value={address.apartment} placeholder="17" onChange={(apartment) => onChange({ apartment })} />
          </>
        ) : (
          <div className="rounded-[18px] border border-red-100 bg-red-50/70 px-3 py-2 text-xs leading-5 text-red-800 sm:col-span-2">
            Для частного дома достаточно указать город, улицу и дом.
          </div>
        )}
      </div>

      <datalist id="oha-client-streets">
        {OHA_STREET_OPTIONS.map((street) => (
          <option key={street} value={street} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={onSave}
        disabled={!summary}
        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-sm hover:shadow-red-950/20 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white disabled:hover:shadow-none"
      >
        Сохранить адрес
      </button>
    </div>
  );
}

function AddressInput({
  label,
  value,
  placeholder,
  list,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  list?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold text-zinc-700">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        list={list}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
      />
    </label>
  );
}

