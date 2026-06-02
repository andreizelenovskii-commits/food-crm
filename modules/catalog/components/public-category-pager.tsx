"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { CategoryNavIcon } from "@/modules/catalog/components/public-category-nav-icon";
import { getMenuCategoryHref } from "@/modules/catalog/components/public-menu-category-utils";

const CATEGORY_PAGE_SIZE = 6;

type PublicMenuCategoryLink = {
  value: string;
  label: string;
};

function CategoryArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        d={direction === "left" ? "M14.5 6.5 9 12l5.5 5.5" : "M9.5 6.5 15 12l-5.5 5.5"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function CategoryPagerButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#f0d9dc] bg-white text-[#b00012] shadow-sm shadow-[#d50014]/8 transition hover:border-[#ffc3ca] hover:bg-[#fff1f2] hover:text-[#d50014] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d50014]/25 disabled:pointer-events-none disabled:opacity-35"
      aria-label={direction === "left" ? "Показать предыдущие категории" : "Показать следующие категории"}
    >
      <CategoryArrowIcon direction={direction} />
    </button>
  );
}

function getCurrentCategoryFromPath(pathname: string | null) {
  const categorySlug = pathname?.match(/^\/menu\/([^/]+)/)?.[1];

  if (!categorySlug) {
    return "";
  }

  try {
    return decodeURIComponent(categorySlug);
  } catch {
    return categorySlug;
  }
}

function getCategoryPageForValue(categories: readonly PublicMenuCategoryLink[], categoryValue: string) {
  const index = categories.findIndex((category) => category.value === categoryValue);
  return index >= 0 ? Math.floor(index / CATEGORY_PAGE_SIZE) : 0;
}

export function PublicCategoryPager({ categories }: { categories: readonly PublicMenuCategoryLink[] }) {
  const pathname = usePathname();
  const currentCategory = getCurrentCategoryFromPath(pathname);
  const isCategoryPage = Boolean(currentCategory);
  const currentCategoryPage = getCategoryPageForValue(categories, currentCategory);
  const [categoryPage, setCategoryPage] = useState(currentCategoryPage);
  const categoryPagesCount = Math.max(Math.ceil(categories.length / CATEGORY_PAGE_SIZE), 1);
  const normalizedCategoryPage = Math.min(isCategoryPage ? currentCategoryPage : categoryPage, categoryPagesCount - 1);
  const visibleCategories = useMemo(
    () =>
      categories.slice(
        normalizedCategoryPage * CATEGORY_PAGE_SIZE,
        normalizedCategoryPage * CATEGORY_PAGE_SIZE + CATEGORY_PAGE_SIZE,
      ),
    [categories, normalizedCategoryPage],
  );

  function changeCategoryPage(direction: "left" | "right") {
    setCategoryPage((current) => {
      const next = direction === "left" ? current - 1 : current + 1;
      return Math.min(Math.max(next, 0), categoryPagesCount - 1);
    });
  }

  return (
    <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6">
      <CategoryPagerButton
        direction="left"
        disabled={isCategoryPage || normalizedCategoryPage === 0}
        onClick={() => changeCategoryPage("left")}
      />
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden">
        {visibleCategories.map((category) => {
          const isCurrent = category.value === currentCategory;

          return (
            <a
              key={category.value}
              href={getMenuCategoryHref(category.value)}
              data-current={isCurrent ? "true" : "false"}
              aria-current={isCurrent ? "page" : undefined}
              className={`group flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-black transition xl:px-3.5 ${
                isCurrent
                  ? "bg-[#fff1f2] text-[#d50014]"
                  : "text-[#5c464b] hover:bg-[#fff1f2] hover:text-[#d50014]"
              }`}
            >
              <CategoryNavIcon category={category.value} />
              {category.label}
            </a>
          );
        })}
      </div>
      <CategoryPagerButton
        direction="right"
        disabled={isCategoryPage || normalizedCategoryPage >= categoryPagesCount - 1}
        onClick={() => changeCategoryPage("right")}
      />
    </div>
  );
}
