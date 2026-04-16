"use client";

import { useActionState } from "react";
import {
  addClientAction,
  type ClientFormState,
  updateClientAction,
} from "@/modules/clients/clients.actions";
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
      className="space-y-5 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
    >
      <input type="hidden" name="type" value={type} />
      {initialClient ? <input type="hidden" name="clientId" value={initialClient.id} /> : null}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        <p className="text-sm leading-6 text-zinc-600">
          {isOrganization
            ? "Сохрани контакты организации и детали для работы."
            : "Сохрани контактные данные и короткую заметку по клиенту."}
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">{nameLabel}</span>
        <input
          name="name"
          type="text"
          placeholder={namePlaceholder}
          defaultValue={values.name}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Телефон</span>
        <input
          name="phone"
          type="tel"
          placeholder="+7 900 123 45 67"
          defaultValue={values.phone}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Email</span>
        <input
          name="email"
          type="email"
          placeholder="client@example.com"
          defaultValue={values.email}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      <ClientAddressFieldsWithDefaults
        key={[
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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Заметка</span>
        <textarea
          name="notes"
          placeholder="Комментарий по клиенту, условия, особенности"
          rows={4}
          defaultValue={values.notes}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      {state.errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
      >
        {isPending ? "Сохраняем..." : title}
      </button>
    </form>
  );
}
