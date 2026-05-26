"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PaginatedList } from "@/components/ui/paginated-list";
import {
  CATALOG_PRICE_LIST_LABELS,
  type CatalogItem,
  type CatalogPriceListType,
} from "@/modules/catalog/catalog.types";
import { CatalogItemDeleteButton } from "@/modules/catalog/components/catalog-item-delete-button";
import { matchesSmartSearch } from "@/shared/lib/smart-search";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CatalogDialogFrame({
  title,
  eyebrow,
  children,
  onClose,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4 py-4 backdrop-blur-sm" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff2f2_46%,#f8eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5" onClick={(event) => event.stopPropagation()}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />
        <div className="relative mb-4 flex flex-col gap-3 rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-sm shadow-red-950/5 backdrop-blur-2xl sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="foodlike-kicker">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-zinc-950">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="foodlike-button-secondary">
            Закрыть
          </button>
        </div>
        <div className="relative">{children}</div>
      </section>
    </div>
  );
}

export function CatalogListDialog({
  title,
  items,
  categories,
  initialCategory,
  canManageCatalog,
  onClose,
}: {
  title: string;
  items: CatalogItem[];
  categories: Array<{ category: string; count: number }>;
  initialCategory: string;
  canManageCatalog: boolean;
  onClose: () => void;
}) {
  const [priceListType, setPriceListType] = useState<CatalogPriceListType>("CLIENT");
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const priceCounts = useMemo(
    () => ({
      CLIENT: items.filter((item) => item.priceListType === "CLIENT").length,
      INTERNAL: items.filter((item) => item.priceListType === "INTERNAL").length,
    }),
    [items],
  );
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (item.priceListType !== priceListType) {
          return false;
        }

        if (category && item.category !== category) {
          return false;
        }

        if (!query.trim()) {
          return true;
        }

        return matchesSmartSearch(
          [
            item.name,
            item.category,
            item.description,
            item.pizzaSize,
            item.rollSize,
            item.technologicalCardName,
          ],
          query,
        );
      }),
    [category, items, priceListType, query],
  );

  return (
    <CatalogDialogFrame title={title} eyebrow="Прайс" onClose={onClose}>
      <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)]">
        <div className="rounded-[20px] border border-white/70 bg-white/74 p-3 shadow-sm shadow-red-950/5 backdrop-blur-2xl">
          <p className="foodlike-kicker">Тип прайса</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <PriceTypeButton
              active={priceListType === "CLIENT"}
              label="Клиентский"
              count={priceCounts.CLIENT}
              onClick={() => setPriceListType("CLIENT")}
            />
            <PriceTypeButton
              active={priceListType === "INTERNAL"}
              label="Внутренний"
              count={priceCounts.INTERNAL}
              onClick={() => setPriceListType("INTERNAL")}
            />
          </div>
        </div>

        <div className="rounded-[20px] border border-white/70 bg-white/74 p-3 shadow-sm shadow-red-950/5 backdrop-blur-2xl">
          <div className="flex flex-col gap-3 xl:flex-row">
            <label className="min-w-0 flex-1">
              <span className="foodlike-kicker">Поиск</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Название, категория, техкарта или размер"
                className="mt-2 h-11 w-full rounded-full border border-red-950/10 bg-white px-4 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
              />
            </label>
            <label className="min-w-0 xl:w-64">
              <span className="foodlike-kicker">Категория</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 h-11 w-full rounded-full border border-red-950/10 bg-white px-4 text-sm font-semibold text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
              >
                <option value="">Все категории</option>
                {categories.map((item) => (
                  <option key={item.category} value={item.category}>
                    {item.category} · {item.count}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm font-semibold text-zinc-600">
          Найдено: <span className="text-red-800">{visibleItems.length}</span>
        </p>
        {(query || category) ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("");
            }}
            className="text-sm font-semibold text-red-800 transition hover:text-red-950"
          >
            Сбросить фильтры
          </button>
        ) : null}
      </div>

      {visibleItems.length === 0 ? (
        <div className="foodlike-empty p-5">Пока пусто.</div>
      ) : (
        <div className="rounded-[22px] border border-white/70 bg-white/60 p-2 shadow-sm shadow-red-950/5 backdrop-blur-2xl">
          <PaginatedList itemLabel="позиций" pageSize={6}>
            {visibleItems.map((item) => (
              <CatalogItemCard key={item.id} item={item} canManageCatalog={canManageCatalog} />
            ))}
          </PaginatedList>
        </div>
      )}
    </CatalogDialogFrame>
  );
}

function PriceTypeButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-16 items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left transition",
        active
          ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
          : "border-red-100 bg-white text-red-800 hover:border-red-800",
      ].join(" ")}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className={active ? "text-lg font-black text-white" : "text-lg font-black text-red-800"}>
        {count}
      </span>
    </button>
  );
}

function CatalogItemCard({ item, canManageCatalog }: { item: CatalogItem; canManageCatalog: boolean }) {
  return (
    <article className="foodlike-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          <CatalogItemPhoto item={item} />
          <CatalogItemDetails item={item} />
        </div>
        {canManageCatalog ? (
          <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
            <Link href={`/dashboard/catalog/${item.id}`} className="foodlike-button-secondary min-h-9 px-4">
              Редактировать
            </Link>
            <CatalogItemDeleteButton catalogItemId={item.id} itemName={item.name} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CatalogItemPhoto({ item }: { item: CatalogItem }) {
  return (
    <div className="h-24 w-full shrink-0 overflow-hidden rounded-[16px] border border-red-950/10 bg-red-50 sm:w-32">
      {item.imageUrl ? (
        <Image src={item.imageUrl} alt={item.name} width={256} height={192} sizes="128px" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center px-3 text-center text-xs text-zinc-500">Нет фото</div>
      )}
    </div>
  );
}

function CatalogItemDetails({ item }: { item: CatalogItem }) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold leading-tight text-zinc-950">{item.name}</h3>
        <Badge>{CATALOG_PRICE_LIST_LABELS[item.priceListType]}</Badge>
        <Badge>{item.category || "Без категории"}</Badge>
        {item.pizzaSize ? <Badge>{item.pizzaSize}</Badge> : null}
        {item.rollSize ? <Badge>{item.rollSize}</Badge> : null}
      </div>
      <p className="text-sm text-zinc-600">Техкарта: {item.technologicalCardName}</p>
      <p className="text-sm font-semibold text-zinc-950">
        {item.variants.length > 1 ? `${item.variants.length} варианта` : formatMoney(item.variants[0]?.priceCents ?? item.priceCents)}
      </p>
      {item.variants.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {item.variants.map((variant) => (
            <Badge key={variant.id}>{variant.label} · {formatMoney(variant.priceCents)}</Badge>
          ))}
        </div>
      ) : null}
      {item.description ? <p className="text-sm leading-6 text-zinc-600">{item.description}</p> : null}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
      {children}
    </span>
  );
}
