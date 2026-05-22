"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { KindDialog } from "@/modules/inventory/components/inventory-recipes-kind-dialog";
import {
  getKindMeta,
  type RecipeKind,
} from "@/modules/inventory/components/inventory-recipes-kind-meta";
import type {
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}


export function RecipeKindLinks({
  priceTechCards,
  ingredientTechCards,
  compositeTechCards,
  products,
  canManageInventory,
}: {
  priceTechCards: TechCardItem[];
  ingredientTechCards: TechCardItem[];
  compositeTechCards: TechCardItem[];
  products: TechCardProductOption[];
  canManageInventory: boolean;
}) {
  const [openKind, setOpenKind] = useState<RecipeKind | null>(null);
  const componentOptions = [...priceTechCards, ...ingredientTechCards];

  return (
    <>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <KindButton kind="price" count={priceTechCards.length} onClick={() => setOpenKind("price")} />
        <KindButton kind="ingredient" count={ingredientTechCards.length} onClick={() => setOpenKind("ingredient")} />
        <KindButton kind="composite" count={compositeTechCards.length} onClick={() => setOpenKind("composite")} />
      </div>

      {openKind && typeof document !== "undefined"
        ? createPortal(
            <KindDialog
              kind={openKind}
              cards={
                openKind === "ingredient"
                  ? ingredientTechCards
                  : openKind === "composite"
                    ? compositeTechCards
                    : priceTechCards
              }
              products={products}
              componentOptions={componentOptions}
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
