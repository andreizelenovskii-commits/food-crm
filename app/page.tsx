import type { Metadata } from "next";
import { fetchCurrentClient } from "@/modules/clients/clients.api";
import { PublicAccountSection } from "@/modules/catalog/components/public-account-section";
import {
  PublicHomeCategoryLinks,
  PublicHomeContacts,
  PublicHomeFeatureStrip,
  PublicHomeHero,
  PublicHomeReviews,
  PublicHomeUpdatePanel,
} from "@/modules/catalog/components/public-home-sections";
import { PublicMenuSection } from "@/modules/catalog/components/public-menu-section";
import { PublicSiteHeader } from "@/modules/catalog/components/public-site-header";
import { fetchPublicCatalogItems } from "@/modules/catalog/catalog.api";
import { PUBLIC_MENU_CATEGORY_LINKS, type CatalogItem } from "@/modules/catalog/catalog.types";
import { matchesMenuCategory } from "@/modules/catalog/components/public-menu-category-utils";

export const metadata: Metadata = {
  title: "FoodLike | Доставка еды",
  description:
    "FoodLike: доставка пиццы, роллов и горячих блюд. Меню, условия доставки и контакты.",
};

function scoreFeaturedItem(item: CatalogItem, seed: number) {
  const source = `${item.id}:${item.name}:${seed}`;
  return Array.from(source).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
}

function getFeaturedMenuItems(items: CatalogItem[]) {
  const daySeed = Math.floor(Date.now() / 86_400_000);
  return [...items]
    .sort((left, right) => scoreFeaturedItem(left, daySeed) - scoreFeaturedItem(right, daySeed))
    .slice(0, 6);
}

export default async function Home() {
  const [menuItems, currentClient] = await Promise.all([
    fetchPublicCatalogItems().catch(() => []),
    fetchCurrentClient(),
  ]);
  const headerCategories = PUBLIC_MENU_CATEGORY_LINKS.filter((category) =>
    menuItems.some((item) => matchesMenuCategory(item.category, category)),
  );
  const featuredItems = getFeaturedMenuItems(menuItems);
  const heroItems = featuredItems.slice(0, 3);
  const categoryPreview = headerCategories.slice(0, 7);

  return (
    <>
      <PublicSiteHeader
        categories={headerCategories}
        currentClient={currentClient}
        searchableItems={menuItems}
      />
      <main className="min-h-screen bg-[#fff9f4] text-[#211316]">
        <PublicHomeHero heroItems={heroItems} menuItemsCount={menuItems.length} />
        <PublicAccountSection currentClient={currentClient} />
        <PublicHomeFeatureStrip />
        <PublicHomeCategoryLinks categories={categoryPreview} />
        <PublicHomeUpdatePanel />
        <PublicMenuSection
          currentClient={currentClient}
          description="Живой выбор из каталога: откройте блюдо, выберите вариант, исключите лишние ингредиенты и отправьте заказ в корзину."
          featuredItems={featuredItems}
          items={menuItems}
          title="Хиты и новые поводы заказать"
        />
        <PublicHomeReviews />
        <PublicHomeContacts />
      </main>
    </>
  );
}
