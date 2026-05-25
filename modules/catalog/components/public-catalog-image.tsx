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
    <span className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#fff7f8]">
      {isRoll ? <RollFallbackMark /> : isPizza ? <PizzaFallbackMark /> : <MenuFallbackMark />}
    </span>
  );
}

function PizzaFallbackMark() {
  return (
    <span className="relative block size-10 rotate-[-18deg] rounded-full bg-[#f9c24d] shadow-[inset_0_0_0_4px_#f6d089]">
      <span className="absolute left-[1.15rem] top-0 h-10 w-4 origin-bottom skew-x-[-18deg] bg-[#fff8f8]" />
      <span className="absolute left-2 top-3 size-2 rounded-full bg-[#d50014]" />
      <span className="absolute bottom-2 right-2 size-2 rounded-full bg-[#d50014]" />
      <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#7a3f22]" />
    </span>
  );
}

function RollFallbackMark() {
  return (
    <span className="grid grid-cols-2 gap-2">
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} className="flex size-5 items-center justify-center rounded-[7px] bg-white shadow-[inset_0_0_0_2px_#241316]">
          <span className="size-2 rounded-full bg-[#d50014]" />
        </span>
      ))}
    </span>
  );
}

function MenuFallbackMark() {
  return (
    <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#d50014]">
      Food
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
