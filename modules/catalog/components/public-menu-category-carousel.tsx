"use client";

import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { PublicMenuCard } from "@/modules/catalog/components/public-menu-card";

export type MenuCategorySection = {
  value: string;
  label: string;
  items: CatalogItem[];
};

export function PublicMenuCategoryCarousel({
  layout = "carousel",
  onSelect,
  section,
}: {
  layout?: "carousel" | "grid";
  onSelect: (item: CatalogItem) => void;
  section: MenuCategorySection;
}) {
  const isGrid = layout === "grid";

  return (
    <section id={section.value} className="scroll-mt-36">
      <div className={`mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end ${isGrid ? "border-b border-[#f5dadd] pb-4" : ""}`}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d50014]">
            Меню FoodLike
          </p>
          <h3 className={`${isGrid ? "mt-1 text-2xl sm:text-3xl" : "mt-2 text-3xl"} font-black leading-tight text-[#241316]`}>
            {section.label}
          </h3>
        </div>
        <span className="w-fit rounded-full border border-[#f0d9dc] bg-white px-4 py-2 text-sm font-black text-[#b00012] shadow-sm shadow-[#d50014]/5">
          {section.items.length} поз.
        </span>
      </div>

      {section.items.length ? (
        <div className={isGrid ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8"}>
          {section.items.map((item) => (
            <div key={item.id} className={isGrid ? "min-w-0" : "w-[min(23rem,84vw)] shrink-0 snap-start md:w-[24rem] xl:w-[25rem]"}>
              <PublicMenuCard item={item} onSelect={onSelect} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[#f2d8dc] bg-[#fffafa] p-6">
          <p className="text-sm font-semibold leading-6 text-[#7b5e64]">
            В этой подкатегории пока нет доступных позиций. Посмотрите соседние разделы меню.
          </p>
        </div>
      )}
    </section>
  );
}
