"use client";

import { useState } from "react";
import { CatalogItemForm } from "@/modules/catalog/components/catalog-item-form";
import type { CatalogTechCardOption } from "@/modules/catalog/components/catalog-item-form.model";
import {
  CATALOG_SITE_CATEGORIES,
  type CatalogItem,
} from "@/modules/catalog/catalog.types";
import {
  CatalogDialogFrame,
  CatalogListDialog,
  CategoryLink,
} from "@/modules/catalog/components/catalog-workspace-dialogs";

type CatalogDialog = "categories" | "client" | "internal" | "create" | "guide" | null;

type CatalogWorkspaceProps = {
  catalogItems: CatalogItem[];
  techCardOptions: CatalogTechCardOption[];
  selectedCategory: string;
  canManageCatalog: boolean;
};

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
