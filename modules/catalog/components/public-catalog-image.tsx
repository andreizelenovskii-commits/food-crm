"use client";

import { useState } from "react";
import type { CatalogItem } from "@/modules/catalog/catalog.types";

function isRollCategory(category: string | null) {
  return Boolean(category?.toLowerCase().includes("ролл"));
}

function isPizzaCategory(category: string | null) {
  return Boolean(category?.toLowerCase().includes("пицц"));
}

function PublicCatalogImageFallback({ item }: { item: CatalogItem }) {
  const isRoll = isRollCategory(item.category);
  const isPizza = isPizzaCategory(item.category);

  return (
    <span className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#fff8f8_0%,#fff0f1_100%)]">
      <span className="absolute -right-8 -top-8 size-24 rounded-full bg-[#d50014]/10" />
      <span className="absolute -bottom-10 -left-10 size-28 rounded-full bg-[#241316]/5" />
      {isRoll ? <RollFallbackMark /> : isPizza ? <PizzaFallbackMark /> : <MenuFallbackMark />}
    </span>
  );
}

function PizzaFallbackMark() {
  return (
    <span className="relative block size-20 rotate-[-18deg] rounded-full bg-[#f9c24d] shadow-[inset_0_0_0_7px_#f6d089]">
      <span className="absolute left-7 top-1 h-[4.5rem] w-7 origin-bottom skew-x-[-18deg] bg-[#fff8f8]" />
      <span className="absolute left-4 top-5 size-3 rounded-full bg-[#d50014]" />
      <span className="absolute bottom-5 right-5 size-3 rounded-full bg-[#d50014]" />
      <span className="absolute right-5 top-4 size-2 rounded-full bg-[#7a3f22]" />
    </span>
  );
}

function RollFallbackMark() {
  return (
    <span className="grid grid-cols-2 gap-2">
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} className="flex size-8 items-center justify-center rounded-[10px] bg-white shadow-[inset_0_0_0_4px_#241316]">
          <span className="size-3 rounded-full bg-[#d50014]" />
        </span>
      ))}
    </span>
  );
}

function MenuFallbackMark() {
  return (
    <span className="rounded-[18px] border border-[#f0c9cd] bg-white/80 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#d50014]">
      Фото
      <br />
      скоро
    </span>
  );
}

export function PublicCatalogImage({
  item,
  className = "",
  imageClassName = "",
}: {
  item: CatalogItem;
  className?: string;
  imageClassName?: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {item.imageUrl && !hasImageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover object-center ${imageClassName}`}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <PublicCatalogImageFallback item={item} />
      )}
    </span>
  );
}
