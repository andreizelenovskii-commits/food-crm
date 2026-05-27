import { PUBLIC_MENU_CATEGORY_LINKS } from "@/modules/catalog/catalog.types";

export type PublicMenuCategoryLike = {
  readonly value: string;
  readonly label: string;
  readonly subcategories?: readonly PublicMenuCategoryLike[];
};

export function slugifyMenuCategory(value: string) {
  return encodeURIComponent(value.toLowerCase().replaceAll(" ", "-"));
}

export function findMenuCategoryBySlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const normalized = decoded.toLowerCase();
  const normalizedWithSpaces = normalized.replaceAll("-", " ");

  return getPublicMenuLinks().find(
    (category) => {
      const value = category.value.toLowerCase();
      const label = category.label.toLowerCase();

      return value === normalized || label === normalized || value === normalizedWithSpaces || label === normalizedWithSpaces;
    },
  ) ?? null;
}

export function getMenuCategoryHref(value: string) {
  return `/menu/${slugifyMenuCategory(value)}`;
}

export function getPublicMenuLinks() {
  const categories: readonly PublicMenuCategoryLike[] = PUBLIC_MENU_CATEGORY_LINKS;

  return categories.flatMap((category) => [
    category,
    ...(category.subcategories ?? []),
  ]);
}

export function getMenuCategorySubcategories(category: PublicMenuCategoryLike | null) {
  return category?.subcategories ?? [];
}

export function matchesMenuCategory(itemCategory: string | null, category: PublicMenuCategoryLike) {
  if (!itemCategory) {
    return false;
  }

  if (itemCategory === category.value) {
    return true;
  }

  return category.subcategories?.some((subcategory) => subcategory.value === itemCategory) ?? false;
}
