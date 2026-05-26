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
} from "@/modules/catalog/components/catalog-workspace-dialogs";

type CatalogDialog = "prices" | "create" | "guide" | null;

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
  const clientItems = catalogItems.filter((item) => item.priceListType === "CLIENT");
  const internalItems = catalogItems.filter((item) => item.priceListType === "INTERNAL");
  const linkedCount = catalogItems.filter((item) => item.technologicalCardId > 0).length;
  const photoCount = catalogItems.filter((item) => item.imageUrl).length;
  const categoryCounts = CATALOG_SITE_CATEGORIES.map((category) => ({
    category,
    count: catalogItems.filter((item) => item.category === category).length,
  })).filter((item) => item.count > 0);

  return (
    <>
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff2f2_46%,#f8eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-white/80 blur-3xl" />

        <section className="relative grid gap-4 xl:grid-cols-[minmax(300px,0.86fr)_minmax(420px,1.14fr)]">
          <div className="foodlike-panel foodlike-float-soft p-5">
            <p className="foodlike-kicker">FoodLike catalog</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
              Каталог без лишних переходов
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
              Клиентский и внутренний прайс, категории сайта, фото и техкарты собраны
              в одном аккуратном рабочем окне.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveDialog("prices")}
                className="foodlike-button-primary"
              >
                Открыть прайсы
              </button>
              {canManageCatalog ? (
                <button
                  type="button"
                  onClick={() => setActiveDialog("create")}
                  className="foodlike-button-secondary"
                >
                  Новая позиция
                </button>
              ) : null}
            </div>
            {selectedCategory ? (
              <p className="mt-4 inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800">
                Активный фильтр: {selectedCategory}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Всего позиций" value={catalogItems.length} hint="В обоих прайсах" delay="0s" />
            <Metric label="Клиентский" value={clientItems.length} hint="Публикуется на сайте" delay="0.25s" />
            <Metric label="Внутренний" value={internalItems.length} hint="Для служебного прайса" delay="0.5s" />
            <Metric label="Фото" value={`${photoCount}/${linkedCount}`} hint="Готовность витрины" delay="0.75s" />
          </div>
        </section>

        <section className="relative mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <div className="foodlike-panel p-4">
            <p className="foodlike-kicker">Рабочий поток</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">Быстрые действия</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <ActionCard
                title="Прайсы и категории"
                hint="Один список с переключением типа прайса, поиском и фильтрами."
                action="Открыть"
                onClick={() => setActiveDialog("prices")}
              />
              <ActionCard
                title="Как устроен каталог"
                hint="Короткая схема: прайсы, категории сайта, фото и техкарты."
                action="Смотреть"
                onClick={() => setActiveDialog("guide")}
              />
            </div>
          </div>

          <div className="foodlike-panel p-4">
            <div>
              <p className="foodlike-kicker">Категории сайта</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                Что сейчас собрано в меню
              </h2>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categoryCounts.length ? (
                categoryCounts.slice(0, 9).map((item) => (
                  <CategoryStat key={item.category} label={item.category} count={item.count} />
                ))
              ) : (
                <div className="foodlike-empty p-4 sm:col-span-2 lg:col-span-3">
                  Категории появятся после добавления позиций каталога.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {activeDialog === "prices" ? (
        <CatalogListDialog
          title="Прайсы каталога"
          items={catalogItems}
          categories={categoryCounts}
          initialCategory={selectedCategory}
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

function Metric({
  label,
  value,
  hint,
  delay,
}: {
  label: string;
  value: string | number;
  hint: string;
  delay: string;
}) {
  return (
    <div className="foodlike-float-slow rounded-[18px] border border-red-950/10 bg-white/78 p-4 text-zinc-950 shadow-sm shadow-red-950/5" style={{ animationDelay: delay }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
    </div>
  );
}

function ActionCard({
  title,
  hint,
  action,
  onClick,
}: {
  title: string;
  hint: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[18px] border border-red-950/10 bg-white/78 p-4 text-left shadow-sm shadow-red-950/5 transition hover:-translate-y-1 hover:border-red-900/10 hover:bg-red-800 hover:text-white hover:shadow-red-950/15"
    >
      <span className="block text-sm font-semibold text-zinc-950 transition group-hover:text-white">
        {title}
      </span>
      <span className="mt-1 block text-xs leading-5 text-zinc-500 transition group-hover:text-red-50/78">
        {hint}
      </span>
      <span className="mt-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-800 transition group-hover:bg-white/16 group-hover:text-white">
        {action}
      </span>
    </button>
  );
}

function CategoryStat({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/74 p-3 shadow-sm shadow-red-950/5">
      <p className="truncate text-sm font-semibold text-zinc-950">{label}</p>
      <p className="mt-1 text-xs font-semibold text-red-800">{count} поз.</p>
    </div>
  );
}
