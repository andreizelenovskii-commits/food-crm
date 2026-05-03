"use client";

import { useActionState } from "react";
import {
  addClientAction,
  type ClientFormState,
  updateClientAction,
} from "@/modules/clients/clients.actions";
import { PhoneInput } from "@/components/ui/phone-input";
import { ClientAddressFieldsWithDefaults } from "@/modules/clients/components/client-address-fields";
import type { Client, ClientType } from "@/modules/clients/clients.types";
import { EmployeeDatePicker } from "@/modules/employees/components/employee-date-picker";

export function ClientForm({
  type,
  initialClient,
}: {
  type: ClientType;
  initialClient?: Client;
}) {
  const action = initialClient ? updateClientAction : addClientAction;
  const initialState: ClientFormState = {
    errorMessage: null,
    values: {
      name: initialClient?.name ?? "",
      phone: initialClient?.phone ?? "",
      birthDate: initialClient?.birthDate ?? "",
      email: initialClient?.email ?? "",
      addressResidenceType: "",
      addressCity: "",
      addressStreet: "",
      addressHouse: "",
      addressEntrance: "",
      addressFloor: "",
      addressApartment: "",
      addressesJson: "",
      notes: initialClient?.notes ?? "",
    },
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isOrganization = type === "ORGANIZATION";
  const isEditing = Boolean(initialClient);
  const title = isEditing
    ? isOrganization
      ? "Редактировать организацию"
      : "Редактировать клиента"
    : isOrganization
      ? "Добавить организацию"
      : "Добавить клиента";
  const nameLabel = isOrganization ? "Название организации" : "Имя клиента";
  const namePlaceholder = isOrganization
    ? 'Например: ООО "Ромашка"'
    : "Например: Иван Петров";
  const values = state.values;

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-3 rounded-[22px] border border-white/70 bg-white/72 p-3.5 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl"
    >
      <input type="hidden" name="type" value={type} />
      {initialClient ? <input type="hidden" name="clientId" value={initialClient.id} /> : null}

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
          Профиль
        </p>
        <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
        <p className="text-[11px] leading-5 text-zinc-500">
          {isOrganization
            ? "Сохрани контакты организации и детали для работы."
            : "Сохрани контактные данные и короткую заметку по клиенту."}
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">{nameLabel}</span>
        <input
          name="name"
          type="text"
          placeholder={namePlaceholder}
          defaultValue={values.name}
          className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">Телефон</span>
        <PhoneInput
          name="phone"
          defaultValue={values.phone}
          className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          required
        />
      </label>

      {!isOrganization ? (
        <EmployeeDatePicker
          key={`birthDate-${values.birthDate}-${initialClient?.id ?? "new"}`}
          name="birthDate"
          label="Дата рождения"
          placeholder="Укажи дату рождения"
          defaultValue={values.birthDate}
        />
      ) : null}

      {isEditing ? (
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-700">Email</span>
          <input
            name="email"
            type="text"
            inputMode="email"
            placeholder="client@example.com"
            defaultValue={values.email}
            className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>
      ) : null}

      <ClientAddressFieldsWithDefaults
        key={[
          values.addressesJson,
          values.addressResidenceType,
          values.addressCity,
          values.addressStreet,
          values.addressHouse,
          values.addressEntrance,
          values.addressFloor,
          values.addressApartment,
          initialClient?.id ?? "new",
        ].join(":")}
        defaultAddress={initialClient?.address}
        addressesJsonDefault={values.addressesJson}
        fieldDefaults={{
          residenceType: values.addressResidenceType,
          city: values.addressCity,
          street: values.addressStreet,
          house: values.addressHouse,
          entrance: values.addressEntrance,
          floor: values.addressFloor,
          apartment: values.addressApartment,
        }}
      />

      <label className="block space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">Заметка</span>
        <textarea
          name="notes"
          placeholder="Комментарий по клиенту, условия, особенности"
          rows={4}
          defaultValue={values.notes}
          className="w-full rounded-[18px] border border-red-950/10 bg-white/85 px-4 py-2.5 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />
      </label>

      {state.errorMessage ? (
        <p className="rounded-[18px] border border-red-100 bg-red-50/80 px-4 py-3 text-xs font-semibold leading-5 text-red-800 shadow-sm shadow-red-950/5">
          {state.errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-sm hover:shadow-red-950/20 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white disabled:hover:shadow-none"
      >
        {isPending ? "Сохраняем..." : isEditing ? "Сохранить" : title}
      </button>
    </form>
  );
}
