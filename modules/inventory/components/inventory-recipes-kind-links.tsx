"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import {
  InventoryRecipeDeleteButton,
  InventoryRecipeEditButton,
} from "@/modules/inventory/components/inventory-recipes-edit-button";
import type {
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

type RecipeKind = "price" | "ingredient";

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function getKindMeta(kind: RecipeKind) {
  return kind === "ingredient"
    ? {
        eyebrow: "Заготовки",
        icon: "box" as const,
        title: "Технологические карты ингредиентов",
        description: "Заготовки, соусы и полуфабрикаты, которые используются внутри других карт.",
      }
    : {
        eyebrow: "Прайс",
        icon: "book" as const,
        title: "Прайсовые технологические карты",
        description: "Позиции меню и прайса: пиццы, роллы, комбо, напитки и десерты.",
      };
}

export function RecipeKindLinks({
  priceTechCards,
  ingredientTechCards,
  products,
  canManageInventory,
}: {
  priceTechCards: TechCardItem[];
  ingredientTechCards: TechCardItem[];
  products: TechCardProductOption[];
  canManageInventory: boolean;
}) {
  const [openKind, setOpenKind] = useState<RecipeKind | null>(null);

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <KindButton kind="price" count={priceTechCards.length} onClick={() => setOpenKind("price")} />
        <KindButton kind="ingredient" count={ingredientTechCards.length} onClick={() => setOpenKind("ingredient")} />
      </div>

      {openKind && typeof document !== "undefined"
        ? createPortal(
            <KindDialog
              kind={openKind}
              cards={openKind === "ingredient" ? ingredientTechCards : priceTechCards}
              products={products}
              canManageInventory={canManageInventory}
              onClose={() => setOpenKind(null)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function KindButton({
  kind,
  count,
  onClick,
}: {
  kind: RecipeKind;
  count: number;
  onClick: () => void;
}) {
  const meta = getKindMeta(kind);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[22px] border border-white/70 bg-white/72 p-4 text-left shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white/82"
    >
      <span className="flex h-full flex-col justify-between gap-4">
        <span className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name={meta.icon} className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
              {meta.eyebrow}
            </span>
            <span className="mt-1 block text-lg font-semibold text-zinc-950">{meta.title}</span>
            <span className="mt-2 block text-xs leading-5 text-zinc-500">{meta.description}</span>
          </span>
        </span>
        <span className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition group-hover:bg-red-900 group-hover:shadow-red-950/25">
          Открыть список · {count}
          <ArrowIcon className="h-3.5 w-3.5" />
        </span>
      </span>
    </button>
  );
}

function KindDialog({
  kind,
  cards,
  products,
  canManageInventory,
  onClose,
}: {
  kind: RecipeKind;
  cards: TechCardItem[];
  products: TechCardProductOption[];
  canManageInventory: boolean;
  onClose: () => void;
}) {
  const meta = getKindMeta(kind);

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть список техкарт" />
      <section role="dialog" aria-modal="true" aria-label={meta.title} className="relative mx-auto max-w-5xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Технологические карты</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">{meta.title}</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{meta.description}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Закрыть
          </button>
        </div>
        <div className="mt-3 space-y-2.5">
          {cards.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-red-950/14 bg-white/70 p-5 text-sm leading-6 text-zinc-500">
              В этом разделе пока нет технологических карт.
            </div>
          ) : (
            cards.map((card) => (
              <DialogCard
                key={card.id}
                card={card}
                products={products}
                canManageInventory={canManageInventory}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function DialogCard({
  card,
  products,
  canManageInventory,
}: {
  card: TechCardItem;
  products: TechCardProductOption[];
  canManageInventory: boolean;
}) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-red-950/10 bg-white/84 px-4 py-3 shadow-sm shadow-red-950/5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-red-100">
            {card.category}
          </span>
          {card.pizzaSize ? (
            <span className="rounded-full bg-red-800 px-3 py-0.5 text-[12px] font-bold text-white shadow-sm shadow-red-950/15">
              {card.pizzaSize}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1.5 truncate text-[15px] font-semibold leading-5 text-zinc-950">{card.name}</h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-zinc-400">Ингредиентов: {card.ingredients.length}</span>
        {canManageInventory ? (
          <div className="flex flex-wrap items-center gap-2">
            <InventoryRecipeEditButton card={card} products={products} />
            <InventoryRecipeDeleteButton card={card} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
