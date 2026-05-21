"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { TechCardForm, type TechCardFormKind } from "@/modules/tech-cards/components/tech-card-form";
import type { TechCardItem, TechCardProductOption } from "@/modules/tech-cards/tech-cards.types";

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function getKindMeta(kind: TechCardFormKind) {
  return kind === "ingredient"
    ? {
        eyebrow: "Ингредиентная карта",
        title: "Техкарта ингредиента",
        description: "Соусы, заготовки и полуфабрикаты: например, соус барбекю и его состав.",
      }
    : kind === "composite"
      ? {
          eyebrow: "Комбинированная карта",
          title: "Комбинированные",
          description: "Комбо, сеты и другие наборы из уже готовых технологических карт.",
        }
      : {
        eyebrow: "Прайсовая карта",
        title: "Прайсовая техкарта",
        description: "Блюда из каталога: например, пицца Маргарита, ролл или комбо из прайса.",
      };
}

export function InventoryRecipesActions({
  products,
  componentOptions,
  clearDraft,
}: {
  products: TechCardProductOption[];
  componentOptions: TechCardItem[];
  clearDraft: boolean;
}) {
  const [createKind, setCreateKind] = useState<TechCardFormKind | null>(null);

  return (
    <>
      <RecipeActionCard onClick={() => setCreateKind("price")} />

      {createKind && typeof document !== "undefined"
        ? createPortal(
            <TechCardCreateDialog
              kind={createKind}
              products={products}
              componentOptions={componentOptions}
              clearDraft={clearDraft}
              onKindChange={setCreateKind}
              onClose={() => setCreateKind(null)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function RecipeActionCard({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <section className="group rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white/82">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="book" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Новая карта</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">Создать технологическую карту</h2>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Открой форму и выбери тип: прайсовая позиция или ингредиентная заготовка.
            </p>
          </div>
        </div>
        <button type="button" onClick={onClick} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 hover:shadow-red-950/25">
          Создать технологическую карту
          <ArrowIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function TechCardCreateDialog({
  kind,
  products,
  componentOptions,
  clearDraft,
  onKindChange,
  onClose,
}: {
  kind: TechCardFormKind;
  products: TechCardProductOption[];
  componentOptions: TechCardItem[];
  clearDraft: boolean;
  onKindChange: (kind: TechCardFormKind) => void;
  onClose: () => void;
}) {
  const meta = getKindMeta(kind);
  const kinds: TechCardFormKind[] = ["price", "ingredient", "composite"];

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть создание техкарты" />
      <section className="relative mx-auto max-w-3xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                <ModuleIcon name={kind === "ingredient" ? "box" : "book"} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{meta.eyebrow}</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">{meta.title}</h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{meta.description}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Закрыть
            </button>
          </div>
          <div className="grid gap-2 rounded-[18px] border border-white/70 bg-white/74 p-2 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl md:grid-cols-3">
            {kinds.map((item) => {
              const itemMeta = getKindMeta(item);
              const isActive = kind === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onKindChange(item)}
                  className={`rounded-[14px] px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                      : "bg-white/82 text-zinc-600 ring-1 ring-red-100 hover:bg-red-50 hover:text-red-900"
                  }`}
                >
                  <span className="block text-sm font-semibold">{itemMeta.title}</span>
                  <span className={`mt-1 block text-xs leading-5 ${isActive ? "text-white/72" : "text-zinc-500"}`}>
                    {itemMeta.description}
                  </span>
                </button>
              );
            })}
          </div>
          <TechCardForm key={kind} products={products} componentOptions={componentOptions} clearDraft={clearDraft} cardKind={kind} />
        </div>
      </section>
    </div>
  );
}
