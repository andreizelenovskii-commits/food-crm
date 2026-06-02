import { notFound } from "next/navigation";
import { fetchCurrentClient } from "@/modules/clients/clients.api";
import { fetchPublicCatalogItems } from "@/modules/catalog/catalog.api";
import { PUBLIC_MENU_CATEGORY_LINKS } from "@/modules/catalog/catalog.types";
import { PublicMenuSection } from "@/modules/catalog/components/public-menu-section";
import { PublicSiteHeader } from "@/modules/catalog/components/public-site-header";
import {
  findMenuCategoryBySlug,
  getMenuCategorySubcategories,
  matchesMenuCategory,
} from "@/modules/catalog/components/public-menu-category-utils";

export default async function PublicMenuCategoryPage(props: {
  params: Promise<{ category: string }>;
}) {
  const params = await props.params;
  const category = findMenuCategoryBySlug(params.category);

  if (!category) {
    notFound();
  }

  const [menuItems, currentClient] = await Promise.all([
    fetchPublicCatalogItems().catch(() => []),
    fetchCurrentClient(),
  ]);
  const headerCategories = PUBLIC_MENU_CATEGORY_LINKS.filter((item) =>
    menuItems.some((menuItem) => matchesMenuCategory(menuItem.category, item)),
  );
  const categoryItems = menuItems.filter((item) => matchesMenuCategory(item.category, category));
  const subcategories = getMenuCategorySubcategories(category);
  const categorySections = subcategories
    .map((subcategory) => ({
      ...subcategory,
      items: menuItems.filter((item) => item.category === subcategory.value),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <PublicSiteHeader categories={headerCategories} currentClient={currentClient} searchableItems={menuItems} />
      <main className="min-h-screen bg-white pt-28 text-[#211316]">
        <PublicMenuSection
          categoryLinks={subcategories}
          categorySections={categorySections}
          currentClient={currentClient}
          description={`Все позиции категории «${category.label}», которые сейчас опубликованы на сайте.`}
          featuredItems={categoryItems}
          items={menuItems}
          title={category.label}
        />
      </main>
    </>
  );
}
