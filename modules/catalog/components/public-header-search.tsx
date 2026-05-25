"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { SearchIcon } from "@/modules/catalog/components/public-icons";
import { getMenuCategoryHref } from "@/modules/catalog/components/public-menu-category-utils";
import { formatPublicMenuMoney } from "@/modules/catalog/components/public-menu-utils";

function getSearchProductHref(item: CatalogItem) {
  return item.category ? `${getMenuCategoryHref(item.category)}#product-${item.id}` : `/#product-${item.id}`;
}

function isCatalogUploadImage(imageUrl: string) {
  return imageUrl.startsWith("/uploads/catalog/");
}

function SearchResultsPopover({
  items,
  query,
  onResultClick,
}: {
  items: CatalogItem[];
  query: string;
  onResultClick: () => void;
}) {
  if (!query.trim()) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[22px] border border-[#f3dadd] bg-white/98 shadow-[0_22px_60px_rgba(90,12,20,0.18)] backdrop-blur-xl">
      {items.length ? (
        <div className="max-h-[28rem] overflow-y-auto p-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={getSearchProductHref(item)}
              onClick={onResultClick}
              className="group flex gap-3 rounded-[18px] p-2.5 transition hover:bg-[#fff1f2]"
            >
              <span className="relative size-16 shrink-0 overflow-hidden rounded-[14px] bg-[#fff7f8]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    unoptimized={isCatalogUploadImage(item.imageUrl)}
                    sizes="64px"
                    className="object-cover object-center transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-[0.14em] text-[#d50014]">
                    Food
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1 py-1">
                <span className="block truncate text-sm font-black text-[#241316]">{item.name}</span>
                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#d50014]">
                  {item.category ?? "Меню"}
                </span>
                <span className="mt-1 block text-sm font-black text-[#b00012]">
                  {formatPublicMenuMoney(item.priceCents)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-5">
          <p className="text-sm font-black text-[#241316]">Ничего не нашли</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#7b5e64]">
            Попробуйте другое название блюда или категорию.
          </p>
        </div>
      )}
    </div>
  );
}

export function PublicHeaderSearch({ items }: { items: CatalogItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return items
      .filter((item) =>
        [item.name, item.category, item.description, item.pizzaSize, item.rollSize]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 7);
  }, [items, searchQuery]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = searchResults[0];

    if (firstResult) {
      window.location.href = getSearchProductHref(firstResult);
      setIsSearchOpen(false);
      return;
    }

    const menu = document.getElementById("menu");

    if (menu) {
      menu.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <form
      onSubmit={submitSearch}
      className="relative order-last min-w-full flex-1 md:order-none md:min-w-[180px] xl:min-w-[230px]"
      role="search"
      onBlur={() => {
        window.setTimeout(() => setIsSearchOpen(false), 120);
      }}
    >
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#9b7d83]" />
      <input
        name="search"
        type="search"
        placeholder="Поиск"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          setIsSearchOpen(true);
        }}
        onFocus={() => setIsSearchOpen(true)}
        className="h-10 w-full rounded-full border border-[#f0d9dc] bg-[#fff8f8] pl-10 pr-4 text-sm font-medium text-[#241316] outline-none transition placeholder:text-[#a98f95] focus:border-[#d50014] focus:bg-white focus:ring-2 focus:ring-[#d50014]/12"
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setIsSearchOpen(false);
          }}
          className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-sm font-black text-[#31568d] transition hover:bg-[#fff1f2] hover:text-[#d50014]"
          aria-label="Очистить поиск"
        >
          ×
        </button>
      ) : null}
      {isSearchOpen ? (
        <SearchResultsPopover
          items={searchResults}
          query={searchQuery}
          onResultClick={() => setIsSearchOpen(false)}
        />
      ) : null}
    </form>
  );
}
