"use client";

import { useActionState } from "react";
import {
  addCatalogItemAction,
  type CatalogFormState,
} from "@/modules/catalog/catalog.actions";

export function CatalogItemForm({
  techCardOptions,
}: {
  techCardOptions: Array<{ id: number; name: string }>;
}) {
  const initialState: CatalogFormState = {
    errorMessage: null,
    values: {
      name: "",
      slug: "",
      category: "",
      description: "",
      price: "",
      displayOrder: "0",
      technologicalCardId: "",
      isPublished: false,
    },
  };
  const [state, formAction, isPending] = useActionState(addCatalogItemAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Новая позиция каталога</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Добавь позицию сайта и сразу привяжи её к технологической карте.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Название</span>
        <input
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Например: Пицца Маргарита"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Slug</span>
        <input
          name="slug"
          type="text"
          defaultValue={state.values.slug}
          placeholder="pizza-margarita"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Категория</span>
          <input
            name="category"
            type="text"
            defaultValue={state.values.category}
            placeholder="Пицца, роллы, десерты"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Цена</span>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={state.values.price}
            placeholder="0"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Технологическая карта</span>
          <select
            name="technologicalCardId"
            defaultValue={state.values.technologicalCardId}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          >
            <option value="">Выбери техкарту</option>
            {techCardOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Порядок</span>
          <input
            name="displayOrder"
            type="number"
            min="0"
            step="1"
            defaultValue={state.values.displayOrder}
            placeholder="0"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={state.values.description}
          placeholder="Короткое описание позиции для сайта"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
        <input
          name="isPublished"
          type="checkbox"
          defaultChecked={state.values.isPublished}
          className="h-4 w-4 rounded border-zinc-300"
        />
        Публиковать позицию на сайте
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
        {isPending ? "Сохраняем..." : "Добавить в каталог"}
      </button>
    </form>
  );
}
