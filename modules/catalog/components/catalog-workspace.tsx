"use client";

import Link from "next/link";
import { useState } from "react";
import { PaginatedList } from "@/components/ui/paginated-list";
import { CatalogItemDeleteButton } from "@/modules/catalog/components/catalog-item-delete-button";
import { CatalogItemForm } from "@/modules/catalog/components/catalog-item-form";
import type { CatalogTechCardOption } from "@/modules/catalog/components/catalog-item-form.model";
import {
  CATALOG_PRICE_LIST_LABELS,
  CATALOG_SITE_CATEGORIES,
  type CatalogItem,
} from "@/modules/catalog/catalog.types";

type CatalogDialog = "categories" | "client" | "internal" | "create" | "guide" | null;

type CatalogWorkspaceProps = {
  catalogItems: CatalogItem[];
  techCardOptions: CatalogTechCardOption[];
  selectedCategory: string;
  canManageCatalog: boolean;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CatalogWorkspace({
  catalogItems,
  techCardOptions,
  selectedCategory,
  canManageCatalog,
}: CatalogWorkspaceProps) {
  const [activeDialog, setActiveDialog] = useState<CatalogDialog>(null);
  const filteredItems = selectedCategory
    ? catalogItems.filter((item) => item.category === selectedCategory)
    : catalogItems;
  const clientItems = filteredItems.filter((item) => item.priceListType === "CLIENT");
  const internalItems = filteredItems.filter((item) => item.priceListType === "INTERNAL");
  const linkedCount = catalogItems.filter((item) => item.technologicalCardId > 0).length;
  const photoCount = catalogItems.filter((item) => item.imageUrl).length;
  const categoryCounts = CATALOG_SITE_CATEGORIES.map((category) => ({
    category,
    count: catalogItems.filter((item) => item.category === category).length,
  })).filter((item) => item.count > 0);

  return (
    <>
      <div className="foodlike-frame space-y-4 p-4 sm:p-5">
        <section className="grid gap-4 xl:grid-cols-[minmax(340px,0.95fr)_minmax(460px,1.05fr)]">
          <div className="foodlike-panel p-4 sm:p-5">
            <p className="foodlike-kicker">FoodLike catalog</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Прайсы без длинной простыни
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Управляй категориями, клиентским и внутренним прайсом через рабочие окна.
              Основной экран остаётся коротким и пригодным для смены.
            </p>
            {selectedCategory ? (
              <p className="mt-4 inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800">
                Фильтр: {selectedCategory}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Всего позиций" value={catalogItems.length} hint="Во всех прайсах" />
            <Metric label="Клиентский" value={clientItems.length} hint="В текущем фильтре" />
            <Metric label="Внутренний" value={internalItems.length} hint="В текущем фильтре" />
            <Metric label="Фото" value={`${photoCount}/${linkedCount}`} hint="У связанных позиций" />
          </div>
        </section>

        <section className="foodlike-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="foodlike-kicker">Действия</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">Рабочие окна каталога</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton label="Категории" onClick={() => setActiveDialog("categories")} />
              <ActionButton label="Клиентский прайс" onClick={() => setActiveDialog("client")} />
              <ActionButton label="Внутренний прайс" onClick={() => setActiveDialog("internal")} />
              <ActionButton label="Как устроено" onClick={() => setActiveDialog("guide")} />
              {canManageCatalog ? (
                <button
                  type="button"
                  onClick={() => setActiveDialog("create")}
                  className="foodlike-button-primary"
                >
                  Новая позиция
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {activeDialog === "categories" ? (
        <CatalogDialogFrame title="Категории" eyebrow="Фильтр" onClose={() => setActiveDialog(null)}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryLink href="/dashboard/catalog" label="Все категории" count={catalogItems.length} active={!selectedCategory} />
            {categoryCounts.map((item) => (
              <CategoryLink
                key={item.category}
                href={`/dashboard/catalog?category=${encodeURIComponent(item.category)}`}
                label={item.category}
                count={item.count}
                active={selectedCategory === item.category}
              />
            ))}
          </div>
        </CatalogDialogFrame>
      ) : null}

      {activeDialog === "client" ? (
        <CatalogListDialog
          title="Клиентский прайс"
          items={clientItems}
          canManageCatalog={canManageCatalog}
          onClose={() => setActiveDialog(null)}
        />
      ) : null}

      {activeDialog === "internal" ? (
        <CatalogListDialog
          title="Внутренний прайс"
          items={internalItems}
          canManageCatalog={canManageCatalog}
          onClose={() => setActiveDialog(null)}
        />
      ) : null}

      {activeDialog === "create" && canManageCatalog ? (
        <CatalogDialogFrame title="Новая позиция" eyebrow="Каталог" onClose={() => setActiveDialog(null)}>
          <CatalogItemForm techCardOptions={techCardOptions} />
        </CatalogDialogFrame>
      ) : null}

      {activeDialog === "guide" ? (
        <CatalogDialogFrame title="Как устроен модуль" eyebrow="Справка" onClose={() => setActiveDialog(null)}>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Каждая позиция относится к клиентскому или внутреннему прайсу.",
              "Категория управляет тем, где позиция появится в меню сайта.",
              "Фото, цена и техкарта держатся в одной карточке позиции.",
              "Длинные списки открываются в рабочих окнах и не растягивают страницу.",
            ].map((item) => (
              <p key={item} className="rounded-[16px] border border-red-950/10 bg-white/75 p-4 text-sm leading-6 text-zinc-600">
                {item}
              </p>
            ))}
          </div>
        </CatalogDialogFrame>
      ) : null}
    </>
  );
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/75 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="foodlike-button-secondary">
      {label}
    </button>
  );
}

function CatalogDialogFrame({
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
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
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

function CategoryLink({
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
    <Link
      href={href}
      scroll={false}
      className={[
        "flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3 text-sm font-semibold transition",
        active
          ? "border-red-800 bg-red-800 text-white"
          : "border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white",
      ].join(" ")}
    >
      <span>{label}</span>
      <span>{count}</span>
    </Link>
  );
}

function CatalogListDialog({
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
          <div className="h-24 w-full shrink-0 overflow-hidden rounded-[16px] bg-red-50 sm:w-32">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-xs text-zinc-500">
                Нет фото
              </div>
            )}
          </div>
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
              {item.variants.length > 1
                ? `${item.variants.length} варианта`
                : formatMoney(item.variants[0]?.priceCents ?? item.priceCents)}
            </p>
            {item.variants.length > 1 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.variants.map((variant) => (
                  <Badge key={variant.id}>
                    {variant.label} · {formatMoney(variant.priceCents)}
                  </Badge>
                ))}
              </div>
            ) : null}
            {item.description ? <p className="text-sm leading-6 text-zinc-600">{item.description}</p> : null}
          </div>
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
      {children}
    </span>
  );
}
