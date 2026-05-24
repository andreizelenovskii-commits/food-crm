import { PUBLIC_MENU_CATEGORY_LINKS } from "@/modules/catalog/catalog.types";

export function slugifyMenuCategory(value: string) {
  return encodeURIComponent(value.toLowerCase().replaceAll(" ", "-"));
}

export function findMenuCategoryBySlug(slug: string) {
  const decoded = decodeURIComponent(slug).replaceAll("-", " ");

  return PUBLIC_MENU_CATEGORY_LINKS.find(
    (category) => category.value.toLowerCase() === decoded || category.label.toLowerCase() === decoded,
  ) ?? null;
}

export function getMenuCategoryHref(value: string) {
  return `/menu/${slugifyMenuCategory(value)}`;
}
