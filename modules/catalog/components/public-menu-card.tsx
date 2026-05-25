"use client";

import Image from "next/image";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import {
  describePublicMenuItem,
  getPublicMenuCardPrice,
} from "@/modules/catalog/components/public-menu-utils";

export function PublicMenuCard({
  item,
  onSelect,
}: {
  item: CatalogItem;
  onSelect: (item: CatalogItem) => void;
}) {
  const cardPrice = getPublicMenuCardPrice(item);

  return (
    <article id={`product-${item.id}`} className="group flex h-full scroll-mt-40 overflow-hidden rounded-[12px] border border-[#f2d9dc] bg-white shadow-[0_14px_34px_rgba(86,24,31,0.07)] transition hover:-translate-y-0.5 hover:border-[#efc4c9] hover:shadow-[0_20px_46px_rgba(86,24,31,0.11)]">
      <div className="flex w-full flex-col">
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="relative block aspect-square w-full overflow-hidden bg-[#fbf8f6]"
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-center transition duration-500 group-hover:scale-[1.025]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.2em] text-[#d50014]">
              FoodLike
            </span>
          )}
        </button>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex min-h-[72px] items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                {item.category ?? "Меню"}
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight text-[#241316]">{item.name}</h3>
            </div>
            <div className="shrink-0 pt-0.5 text-right">
              <p className="text-lg font-semibold leading-none text-[#c90013]">{cardPrice.label}</p>
              {cardPrice.hint ? (
                <p className="mt-2 text-xs font-semibold text-[#9b7d83]">{cardPrice.hint}</p>
              ) : null}
            </div>
          </div>

          <p className="mt-3 min-h-[96px] overflow-hidden text-sm leading-6 text-[#6b5960] [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">
            {describePublicMenuItem(item)}
          </p>

          <button
            type="button"
            onClick={() => onSelect(item)}
            className="mt-auto min-h-12 w-full rounded-full bg-[#d50014] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(213,0,20,0.18)] transition hover:bg-[#b90012]"
          >
            Выбрать
          </button>
        </div>
      </div>
    </article>
  );
}
