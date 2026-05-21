"use client";

import { useActionState, useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { TechCardForm } from "@/modules/tech-cards/components/tech-card-form";
import { deleteTechCardAction } from "@/modules/tech-cards/tech-cards.actions";
import type {
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export function InventoryRecipeEditButton({
  card,
  products,
  componentOptions = [],
}: {
  card: TechCardItem;
  products: TechCardProductOption[];
  componentOptions?: TechCardItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
      >
        Редактировать
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <EditDialog
              card={card}
              products={products}
              componentOptions={componentOptions}
              onDelete={() => setIsDeleteOpen(true)}
              onClose={() => setIsOpen(false)}
            />,
            document.body,
          )
        : null}

      {isDeleteOpen && typeof document !== "undefined"
        ? createPortal(
            <DeleteDialog card={card} onClose={() => setIsDeleteOpen(false)} />,
            document.body,
          )
        : null}
    </>
  );
}

export function InventoryRecipeDeleteButton({ card }: { card: TechCardItem }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDeleteOpen(true)}
        className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
      >
        Удалить
      </button>
      {isDeleteOpen && typeof document !== "undefined"
        ? createPortal(
            <DeleteDialog card={card} onClose={() => setIsDeleteOpen(false)} />,
            document.body,
          )
        : null}
    </>
  );
}

function EditDialog({
  card,
  products,
  componentOptions,
  onDelete,
  onClose,
}: {
  card: TechCardItem;
  products: TechCardProductOption[];
  componentOptions: TechCardItem[];
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть редактирование техкарты" />
      <section className="relative mx-auto max-w-3xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                <ModuleIcon name="book" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                  Редактирование
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">{card.name}</h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Обнови состав, выход и нормы расхода технологической карты.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onDelete} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
                Удалить
              </button>
              <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
                Закрыть
              </button>
            </div>
          </div>
          <TechCardForm products={products} componentOptions={componentOptions} initialTechCard={card} />
        </div>
      </section>
    </div>
  );
}

function DeleteDialog({
  card,
  onClose,
}: {
  card: TechCardItem;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_previousState: { errorMessage: string | null }, formData: FormData) =>
      deleteTechCardAction(formData),
    { errorMessage: null },
  );

  return (
    <div className="fixed inset-0 z-90 flex items-start justify-center bg-zinc-950/30 px-4 py-8 backdrop-blur-sm" role="presentation">
      <button type="button" onClick={onClose} disabled={isPending} className="fixed inset-0 cursor-default" aria-label="Закрыть удаление техкарты" />
      <section role="dialog" aria-modal="true" aria-label="Удаление технологической карты" className="relative w-full max-w-xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Удаление</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Удалить техкарту?</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            “{card.name}” будет удалена вместе с составом и связанными позициями каталога.
          </p>
        </div>
        {state.errorMessage ? (
          <p className="mt-3 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {state.errorMessage}
          </p>
        ) : null}
        <form action={formAction} className="mt-4 flex flex-wrap justify-end gap-3">
          <input type="hidden" name="techCardId" value={card.id} />
          <button type="button" onClick={onClose} disabled={isPending} className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/85 px-5 text-sm font-medium tracking-[-0.01em] text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isPending} className="inline-flex h-10 items-center rounded-full bg-red-800 px-5 text-sm font-medium text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300">
            {isPending ? "Удаляем..." : "Удалить"}
          </button>
        </form>
      </section>
    </div>
  );
}
