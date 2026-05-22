"use client";

import Image from "next/image";
import Link from "next/link";
import { PaginatedList } from "@/components/ui/paginated-list";
import { CATALOG_PRICE_LIST_LABELS, type CatalogItem } from "@/modules/catalog/catalog.types";
import { CatalogItemDeleteButton } from "@/modules/catalog/components/catalog-item-delete-button";

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
      <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="foodlike-kicker">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="foodlike-button-secondary">
            Закрыть
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function CategoryLink({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link href={href} scroll={false} className={[
      "flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3 text-sm font-semibold transition",
      active
        ? "border-red-800 bg-red-800 text-white"
        : "border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white",
    ].join(" ")}>
      <span>{label}</span>
      <span>{count}</span>
    </Link>
  );
}

export function CatalogListDialog({
  title,
  items,
  canManageCatalog,
  onClose,
}: {
  title: string;
  items: CatalogItem[];
  canManageCatalog: boolean;
  onClose: () => void;
}) {
  return (
    <CatalogDialogFrame title={title} eyebrow="Прайс" onClose={onClose}>
      {items.length === 0 ? (
        <div className="foodlike-empty p-5">Пока пусто.</div>
      ) : (
        <PaginatedList itemLabel="позиций" pageSize={6}>
          {items.map((item) => (
            <CatalogItemCard key={item.id} item={item} canManageCatalog={canManageCatalog} />
          ))}
        </PaginatedList>
      )}
    </CatalogDialogFrame>
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
          <div className="flex shrink-0 flex-wrap gap-2">
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
    <div className="h-24 w-full shrink-0 overflow-hidden rounded-[16px] bg-red-50 sm:w-32">
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
        <h3 className="text-base font-semibold text-zinc-950">{item.name}</h3>
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
