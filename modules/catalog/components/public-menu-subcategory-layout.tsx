"use client";

import { CategoryNavIcon } from "@/modules/catalog/components/public-category-nav-icon";
import {
  PublicMenuCategoryCarousel,
  type MenuCategorySection,
} from "@/modules/catalog/components/public-menu-category-carousel";
import type { CatalogItem } from "@/modules/catalog/catalog.types";

export function PublicMenuSubcategoryLayout({
  categoryLinks,
  sections,
  onSelect,
}: {
  categoryLinks: readonly { value: string; label: string }[];
  sections: MenuCategorySection[];
  onSelect: (item: CatalogItem) => void;
}) {
  const countsByCategory = new Map(sections.map((section) => [section.value, section.items.length]));

  return (
    <div className="relative mt-10 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      <aside className="lg:sticky lg:top-36">
        <div className="rounded-[8px] border border-[#f4d5d9] bg-[#fffafa] p-3 shadow-[0_18px_45px_rgba(87,18,28,0.07)]">
          <div className="px-2 pb-3 pt-1">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d50014]">Разделы</p>
            <p className="mt-1 text-sm font-semibold text-[#7b5e64]">Выберите тип роллов</p>
          </div>
          <nav className="grid gap-2" aria-label="Подкатегории меню">
            {categoryLinks.map((category) => {
              const count = countsByCategory.get(category.value) ?? 0;

              return (
                <a
                  key={category.value}
                  href={`#${encodeURIComponent(category.value)}`}
                  className="group flex min-h-14 items-center gap-3 rounded-[8px] border border-transparent bg-white px-3 text-left shadow-sm shadow-[#d50014]/5 transition hover:border-[#ffc9cf] hover:bg-[#fff1f2]"
                >
                  <CategoryNavIcon category={category.value} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-[#3b2429] transition group-hover:text-[#d50014]">
                      {category.label}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold text-[#9b7d83]">{count} поз.</span>
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="space-y-12">
        {sections.map((section) => (
          <PublicMenuCategoryCarousel key={section.value} section={section} layout="grid" onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
