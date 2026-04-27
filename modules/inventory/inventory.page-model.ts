import type { SessionUser } from "@/modules/auth/auth.types";
import type { Employee } from "@/modules/employees/employees.types";
import {
  PRODUCT_CATEGORIES,
  type IncomingActSummary,
  type InventoryResponsibleOption,
  type InventorySessionSummary,
  type ProductCategory,
  type ProductItem,
  type WriteoffActSummary,
} from "@/modules/inventory/inventory.types";
import {
  TECH_CARD_CATEGORIES,
  type TechCardCategory,
  type TechCardItem,
  type TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export const INVENTORY_TABS = [
  { key: "products", label: "Товары" },
  { key: "incoming", label: "Поступление товара" },
  { key: "writeoff", label: "Списание товара" },
  { key: "audit", label: "Инвентаризация" },
  { key: "recipes", label: "Технологические карты" },
] as const;

export type InventoryTab = (typeof INVENTORY_TABS)[number]["key"];

export type InventoryPageSearchParams = {
  q?: string;
  tab?: string;
  category?: string;
  recipeCategory?: string;
  draft?: string;
};

export type InventoryPageProps = {
  user: SessionUser;
  canManageInventory: boolean;
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
  incomingActs: IncomingActSummary[];
  inventorySessions: InventorySessionSummary[];
  writeoffActs: WriteoffActSummary[];
  employees: Employee[];
  techCards: TechCardItem[];
  techCardProducts: TechCardProductOption[];
  searchParams?: InventoryPageSearchParams;
};

type CategorySummary<TCategory extends string> = {
  category: TCategory;
  count: number;
};

function resolveActiveTab(rawTab?: string): InventoryTab {
  const normalizedTab = rawTab?.trim() ?? "products";
  return INVENTORY_TABS.some((tab) => tab.key === normalizedTab)
    ? (normalizedTab as InventoryTab)
    : "products";
}

function buildCategorySummaries<TCategory extends string, TItem extends { category: TCategory | null }>(
  categories: readonly TCategory[],
  items: TItem[],
): CategorySummary<TCategory>[] {
  return categories
    .map((category) => ({
      category,
      count: items.filter((item) => item.category === category).length,
    }))
    .filter((item) => item.count > 0);
}

export function buildInventoryPageViewModel({
  products,
  techCards,
  searchParams,
}: Pick<InventoryPageProps, "products" | "techCards" | "searchParams">) {
  const rawQuery = searchParams?.q?.trim() ?? "";
  const normalizedQuery = rawQuery.toLowerCase();
  const selectedCategory = searchParams?.category?.trim() ?? "";
  const selectedRecipeCategory = searchParams?.recipeCategory?.trim() ?? "";
  const activeTab = resolveActiveTab(searchParams?.tab);
  const totalStock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
  const totalValueCents = products.reduce(
    (sum, product) => sum + product.stockQuantity * product.priceCents,
    0,
  );
  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.sku?.toLowerCase().includes(normalizedQuery) ||
      product.category?.toLowerCase().includes(normalizedQuery)
    );
  });
  const categorySummaries = buildCategorySummaries<ProductCategory, ProductItem>(
    PRODUCT_CATEGORIES,
    products,
  );
  const lowStockProducts = filteredProducts
    .filter((product) => product.stockQuantity <= 5)
    .sort((left, right) => left.stockQuantity - right.stockQuantity);
  const lowStockCount = lowStockProducts.length;
  const zeroStockCount = products.filter((product) => product.stockQuantity === 0).length;
  const filteredTechCards = techCards.filter(
    (card) => !selectedRecipeCategory || card.category === selectedRecipeCategory,
  );
  const recipeCategorySummaries = buildCategorySummaries<TechCardCategory, TechCardItem>(
    TECH_CARD_CATEGORIES,
    techCards,
  );

  return {
    activeTab,
    rawQuery,
    selectedCategory,
    selectedRecipeCategory,
    totalStock,
    totalValueCents,
    filteredProducts,
    categorySummaries,
    lowStockProducts,
    lowStockCount,
    zeroStockCount,
    filteredTechCards,
    recipeCategorySummaries,
    clearRecipeDraft: searchParams?.draft?.trim() === "cleared",
  };
}
