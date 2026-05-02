"use client";

import { useState } from "react";
import { OHA_CLIENT_ADDRESS_SUGGESTIONS } from "@/modules/clients/client-addresses";

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

function parseAddressPart(address: string | null | undefined, pattern: RegExp) {
  if (!address) {
    return "";
  }

  const match = address.match(pattern);
  return match?.[1]?.trim() ?? "";
}

export function ClientAddressFieldsWithDefaults({
  defaultAddress,
  fieldDefaults,
}: {
  defaultAddress?: string | null;
  fieldDefaults?: {
    residenceType?: string;
    city?: string;
    street?: string;
    house?: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
  };
}) {
  const initialResidenceType =
    fieldDefaults?.residenceType ||
    (defaultAddress?.toLowerCase().includes("частный дом") ? "PRIVATE_HOUSE" : "APARTMENT");
  const [residenceType, setResidenceType] = useState(initialResidenceType);
  const defaultCity =
    (fieldDefaults?.city ?? parseAddressPart(defaultAddress, /г\.\s*([^,]+)/i)) || "Оха";
  const defaultStreet =
    fieldDefaults?.street ?? parseAddressPart(defaultAddress, /ул\.\s*([^,]+)/i);
  const defaultHouse =
    fieldDefaults?.house ?? parseAddressPart(defaultAddress, /д\.\s*([^,]+)/i);
  const defaultEntrance =
    fieldDefaults?.entrance ?? parseAddressPart(defaultAddress, /подъезд\s*([^,]+)/i);
  const defaultFloor =
    fieldDefaults?.floor ?? parseAddressPart(defaultAddress, /этаж\s*([^,]+)/i);
  const defaultApartment =
    fieldDefaults?.apartment ?? parseAddressPart(defaultAddress, /кв\.\s*([^,]+)/i);

  return (
    <div className="space-y-3 rounded-[14px] border border-zinc-200 bg-zinc-50/80 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-700">Адрес</p>
        <p className="text-xs leading-5 text-zinc-500">
          Заполни части адреса отдельно. Город по умолчанию можно не менять.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setResidenceType("APARTMENT")}
          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
            residenceType === "APARTMENT"
              ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
              : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-500 hover:bg-zinc-50"
          }`}
        >
          Квартира
        </button>
        <button
          type="button"
          onClick={() => setResidenceType("PRIVATE_HOUSE")}
          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
            residenceType === "PRIVATE_HOUSE"
              ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
              : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-500 hover:bg-zinc-50"
          }`}
        >
          Частный дом
        </button>
      </div>

      <input type="hidden" name="addressResidenceType" value={residenceType} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Город</span>
          <input
            name="addressCity"
            type="text"
            defaultValue={defaultCity}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Улица</span>
          <input
            name="addressStreet"
            type="text"
            list="oha-client-streets"
            placeholder="Например: Ленина"
            defaultValue={defaultStreet}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
          <datalist id="oha-client-streets">
            {OHA_STREET_OPTIONS.map((street) => (
              <option key={street} value={street} />
            ))}
          </datalist>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Дом</span>
          <input
            name="addressHouse"
            type="text"
            placeholder="10"
            defaultValue={defaultHouse}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        {residenceType === "APARTMENT" ? (
          <>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">Подъезд</span>
              <input
                name="addressEntrance"
                type="text"
                placeholder="2"
                defaultValue={defaultEntrance}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">Этаж</span>
              <input
                name="addressFloor"
                type="text"
                placeholder="5"
                defaultValue={defaultFloor}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700">Квартира</span>
              <input
                name="addressApartment"
                type="text"
                placeholder="17"
                defaultValue={defaultApartment}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              />
            </label>
          </>
        ) : (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:col-span-2">
            Для частного дома достаточно указать город, улицу и дом.
          </div>
        )}
      </div>
    </div>
  );
}
