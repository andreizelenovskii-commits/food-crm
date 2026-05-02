import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type {
  IncomingActSummary,
  ProductItem,
  WriteoffActSummary,
} from "@/modules/inventory/inventory.types";
import type { OrderListItem } from "@/modules/orders/orders.types";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

export type SalesAnalyticsInput = {
  orders: OrderListItem[];
  catalogItems: CatalogItem[];
  products: ProductItem[];
  incomingActs: IncomingActSummary[];
  writeoffActs: WriteoffActSummary[];
};

type RankedItem = {
  label: string;
  value: string;
  hint: string;
};

type CategoryInsight = {
  label: string;
  value: string;
  hint: string;
};

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

function formatPercent(value: number) {
  return `${NUMBER_FORMATTER.format(value)}%`;
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

function groupByCategory<T>(
  items: T[],
  getCategory: (item: T) => string | null,
  getValue: (item: T) => number,
) {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const category = getCategory(item) || "Без категории";
    map.set(category, (map.get(category) ?? 0) + getValue(item));
  });

  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function buildRankedProducts(products: ProductItem[], direction: "top" | "silent") {
  return [...products]
    .sort((a, b) =>
      direction === "top"
        ? b.orderItemsCount - a.orderItemsCount
        : a.orderItemsCount - b.orderItemsCount,
    )
    .slice(0, 6)
    .map((product): RankedItem => ({
      label: product.name,
      value: `${product.orderItemsCount}`,
      hint: `${product.category ?? "Без категории"} · ${formatMoney(product.priceCents)}`,
    }));
}

export function buildSalesAnalyticsViewModel({
  orders,
  catalogItems,
  products,
  incomingActs,
  writeoffActs,
}: SalesAnalyticsInput) {
  const completedOrders = orders.filter((order) => order.status === "DELIVERED_PAID");
  const activeOrders = orders.filter((order) =>
    ["SENT_TO_KITCHEN", "READY", "PACKED"].includes(order.status),
  );
  const cancelledOrders = orders.filter((order) => order.status === "CANCELLED");
  const externalCompletedOrders = completedOrders.filter((order) => !order.isInternal);
  const internalCompletedOrders = completedOrders.filter((order) => order.isInternal);

  const grossRevenueCents = sumBy(completedOrders, (order) => order.totalCents);
  const externalRevenueCents = sumBy(externalCompletedOrders, (order) => order.totalCents);
  const internalRevenueCents = sumBy(internalCompletedOrders, (order) => order.totalCents);
  const activePipelineCents = sumBy(activeOrders, (order) => order.totalCents);
  const discountCents = sumBy(
    completedOrders,
    (order) => Math.max(order.subtotalCents - order.totalCents, 0),
  );
  const averageCheckCents = completedOrders.length
    ? Math.round(grossRevenueCents / completedOrders.length)
    : 0;

  const completedIncomingActs = incomingActs.filter((act) => act.isCompleted);
  const completedWriteoffActs = writeoffActs.filter((act) => act.isCompleted);
  const purchaseCostCents = sumBy(completedIncomingActs, (act) => act.totalCents);
  const writeoffCostCents = sumBy(completedWriteoffActs, (act) => act.totalCents);
  const stockValueCents = sumBy(
    products,
    (product) => product.stockQuantity * product.priceCents,
  );
  const operatingMarginCents = grossRevenueCents - purchaseCostCents - writeoffCostCents;
  const operatingMarginPercent = grossRevenueCents
    ? (operatingMarginCents / grossRevenueCents) * 100
    : 0;

  const clientPriceItems = catalogItems.filter((item) => item.priceListType === "CLIENT");
  const internalPriceItems = catalogItems.filter((item) => item.priceListType === "INTERNAL");
  const linkedCatalogItems = catalogItems.filter((item) => item.technologicalCardId > 0);
  const averageClientPriceCents = clientPriceItems.length
    ? Math.round(sumBy(clientPriceItems, (item) => item.priceCents) / clientPriceItems.length)
    : 0;
  const averageInternalPriceCents = internalPriceItems.length
    ? Math.round(sumBy(internalPriceItems, (item) => item.priceCents) / internalPriceItems.length)
    : 0;

  const inventoryCategories = groupByCategory(
    products,
    (product) => product.category,
    (product) => product.stockQuantity * product.priceCents,
  );
  const catalogCategories = groupByCategory(
    catalogItems,
    (item) => item.category,
    (item) => item.priceCents,
  );
  const writeoffCategories = groupByCategory(
    completedWriteoffActs.flatMap((act) => act.items),
    (item) => item.productCategory,
    (item) => item.totalCents,
  );
  const purchaseCategories = groupByCategory(
    completedIncomingActs.flatMap((act) => act.items),
    (item) => item.productCategory,
    (item) => item.totalCents,
  );

  const kpis = [
    {
      label: "Выручка",
      value: formatMoney(grossRevenueCents),
      hint: `${completedOrders.length} закрытых заказов`,
    },
    {
      label: "Средний чек",
      value: formatMoney(averageCheckCents),
      hint: "По доставленным и оплаченным заказам",
    },
    {
      label: "Опер. маржа",
      value: formatMoney(operatingMarginCents),
      hint: `${formatPercent(operatingMarginPercent)} после закупок и списаний`,
    },
    {
      label: "Себестоимость склада",
      value: formatMoney(stockValueCents),
      hint: `${products.length} складских позиций`,
    },
  ];

  const orderFlow = [
    {
      label: "В работе",
      value: String(activeOrders.length),
      hint: formatMoney(activePipelineCents),
    },
    {
      label: "Закрытые",
      value: String(completedOrders.length),
      hint: formatMoney(grossRevenueCents),
    },
    {
      label: "Отмененные",
      value: String(cancelledOrders.length),
      hint: "Не попадают в выручку",
    },
  ];

  const moneyFlow = [
    {
      label: "Клиентская выручка",
      value: formatMoney(externalRevenueCents),
      hint: `${externalCompletedOrders.length} внешних заказов`,
    },
    {
      label: "Внутренний прайс",
      value: formatMoney(internalRevenueCents),
      hint: `${internalCompletedOrders.length} внутренних заказов`,
    },
    {
      label: "Скидки",
      value: formatMoney(discountCents),
      hint: "Разница между суммой и итогом",
    },
    {
      label: "Закупки",
      value: formatMoney(purchaseCostCents),
      hint: `${completedIncomingActs.length} завершенных приходов`,
    },
    {
      label: "Списания",
      value: formatMoney(writeoffCostCents),
      hint: `${completedWriteoffActs.length} завершенных актов`,
    },
  ];

  const categoryInsights: CategoryInsight[] = [
    {
      label: "Лучшая категория склада",
      value: inventoryCategories[0]?.label ?? "Нет данных",
      hint: inventoryCategories[0] ? formatMoney(inventoryCategories[0].value) : "Нужно заполнить склад",
    },
    {
      label: "Категория с максимальными списаниями",
      value: writeoffCategories[0]?.label ?? "Нет списаний",
      hint: writeoffCategories[0] ? formatMoney(writeoffCategories[0].value) : "Списания пока не закрывались",
    },
    {
      label: "Крупнейшая категория закупок",
      value: purchaseCategories[0]?.label ?? "Нет закупок",
      hint: purchaseCategories[0] ? formatMoney(purchaseCategories[0].value) : "Приходы пока не закрывались",
    },
    {
      label: "Самая дорогая категория прайса",
      value: catalogCategories[0]?.label ?? "Нет прайса",
      hint: catalogCategories[0] ? formatMoney(catalogCategories[0].value) : "Добавьте позиции каталога",
    },
  ];

  const priceAnalytics = [
    {
      label: "Клиентский прайс",
      value: String(clientPriceItems.length),
      hint: `Средняя цена ${formatMoney(averageClientPriceCents)}`,
    },
    {
      label: "Внутренний прайс",
      value: String(internalPriceItems.length),
      hint: `Средняя цена ${formatMoney(averageInternalPriceCents)}`,
    },
    {
      label: "Связано с техкартами",
      value: `${linkedCatalogItems.length}/${catalogItems.length}`,
      hint: "База для будущей точной себестоимости блюд",
    },
  ];

  return {
    kpis,
    orderFlow,
    moneyFlow,
    categoryInsights,
    priceAnalytics,
    topProducts: buildRankedProducts(products, "top"),
    silentProducts: buildRankedProducts(products, "silent"),
    inventoryCategories: inventoryCategories.slice(0, 6).map((item) => ({
      label: item.label,
      value: formatMoney(item.value),
      hint: "Оценка по текущему остатку",
    })),
    purchaseCategories: purchaseCategories.slice(0, 6).map((item) => ({
      label: item.label,
      value: formatMoney(item.value),
      hint: "Завершенные приходы",
    })),
    writeoffCategories: writeoffCategories.slice(0, 6).map((item) => ({
      label: item.label,
      value: formatMoney(item.value),
      hint: "Завершенные списания",
    })),
  };
}
