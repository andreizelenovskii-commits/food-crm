import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type {
  IncomingActSummary,
  ProductItem,
  WriteoffActSummary,
} from "@/modules/inventory/inventory.types";
import type { OrderListItem, OrderItemSummary } from "@/modules/orders/orders.types";
import { buildOrderItemCostEstimator } from "@/modules/sales/sales.costing";
import {
  buildSalesHref,
  buildSalesPeriodRange,
  isDateInRange,
  SALES_PERIOD_LABELS,
  SALES_PERIODS,
  type SalesPeriod,
} from "@/modules/sales/sales.periods";
import type { TechCardItem } from "@/modules/tech-cards/tech-cards.types";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const NUMBER_FORMATTER = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

export type SalesAnalyticsInput = {
  period?: string | null;
  date?: string | null;
  orders: OrderListItem[];
  catalogItems: CatalogItem[];
  products: ProductItem[];
  techCards: TechCardItem[];
  incomingActs: IncomingActSummary[];
  writeoffActs: WriteoffActSummary[];
};

export type SalesMetric = {
  label: string;
  value: string;
  hint: string;
  href?: string;
  tone?: "good" | "warning" | "danger";
};

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

function formatNumber(value: number) {
  return NUMBER_FORMATTER.format(value);
}

function formatPercent(part: number, total: number) {
  return total ? `${NUMBER_FORMATTER.format((part / total) * 100)}%` : "0%";
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

function groupBy<T>(
  items: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => number,
) {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) ?? 0) + getValue(item));
  });
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function getActDate(act: IncomingActSummary | WriteoffActSummary) {
  return act.completedAt ?? act.createdAt;
}

function flattenOrderItems(orders: OrderListItem[]) {
  return orders.flatMap((order) => order.items);
}

function buildMenuPerformance(items: OrderItemSummary[], estimateCost: (item: OrderItemSummary) => number) {
  const map = new Map<string, { quantity: number; revenueCents: number; costCents: number }>();

  items.forEach((item) => {
    const current = map.get(item.itemName) ?? { quantity: 0, revenueCents: 0, costCents: 0 };
    current.quantity += item.quantity;
    current.revenueCents += item.totalPriceCents;
    current.costCents += estimateCost(item);
    map.set(item.itemName, current);
  });

  return [...map.entries()]
    .map(([label, value]) => ({
      label,
      marginCents: value.revenueCents - value.costCents,
      value: formatMoney(value.revenueCents - value.costCents),
      hint: `${formatNumber(value.quantity)} шт · выручка ${formatMoney(value.revenueCents)} · cost ${formatPercent(value.costCents, value.revenueCents)}`,
    }))
    .sort((left, right) => right.marginCents - left.marginCents)
    .map((item) => ({
      label: item.label,
      value: item.value,
      hint: item.hint,
    }))
    .slice(0, 8);
}

function buildPeriodOptions(period: SalesPeriod, date: string) {
  return SALES_PERIODS.map((item) => ({
    label: SALES_PERIOD_LABELS[item],
    href: buildSalesHref(item, date),
    isActive: item === period,
  }));
}

export function buildSalesAnalyticsViewModel(input: SalesAnalyticsInput) {
  const range = buildSalesPeriodRange(input.period, input.date);
  const periodOrders = input.orders.filter((order) => isDateInRange(order.createdAt, range));
  const completedOrders = periodOrders.filter((order) => order.status === "DELIVERED_PAID");
  const activeOrders = periodOrders.filter((order) => ["SENT_TO_KITCHEN", "READY", "PACKED"].includes(order.status));
  const cancelledOrders = periodOrders.filter((order) => order.status === "CANCELLED");
  const incomingActs = input.incomingActs.filter((act) => act.isCompleted && isDateInRange(getActDate(act), range));
  const writeoffActs = input.writeoffActs.filter((act) => act.isCompleted && isDateInRange(getActDate(act), range));
  const estimateCost = buildOrderItemCostEstimator(input);
  const soldItems = flattenOrderItems(completedOrders);

  const revenueCents = sumBy(completedOrders, (order) => order.totalCents);
  const subtotalCents = sumBy(completedOrders, (order) => order.subtotalCents);
  const discountCents = Math.max(subtotalCents - revenueCents, 0);
  const averageCheckCents = completedOrders.length ? Math.round(revenueCents / completedOrders.length) : 0;
  const estimatedCogsCents = sumBy(soldItems, estimateCost);
  const purchaseCents = sumBy(incomingActs, (act) => act.totalCents);
  const writeoffCents = sumBy(writeoffActs, (act) => act.totalCents);
  const productMarginCents = revenueCents - estimatedCogsCents;
  const operatingMarginCents = revenueCents - purchaseCents - writeoffCents;
  const activePipelineCents = sumBy(activeOrders, (order) => order.totalCents);

  const kpis: SalesMetric[] = [
    { label: "Выручка", value: formatMoney(revenueCents), hint: `${completedOrders.length} оплаченных заказов`, href: "/dashboard/orders" },
    { label: "Средний чек", value: formatMoney(averageCheckCents), hint: "Итог заказа после скидок", href: "/dashboard/orders" },
    { label: "Маржа по блюдам", value: formatMoney(productMarginCents), hint: `${formatPercent(productMarginCents, revenueCents)} после техкарт`, href: "/dashboard/inventory", tone: productMarginCents < 0 ? "danger" : "good" },
    { label: "Опер. маржа", value: formatMoney(operatingMarginCents), hint: `${formatPercent(operatingMarginCents, revenueCents)} после закупок и списаний`, href: `/dashboard/reports?month=${range.date.slice(0, 7)}`, tone: operatingMarginCents < 0 ? "danger" : "good" },
  ];

  const profitability: SalesMetric[] = [
    { label: "Себестоимость проданных блюд", value: formatMoney(estimatedCogsCents), hint: `${formatPercent(estimatedCogsCents, revenueCents)} от выручки` },
    { label: "Закупки периода", value: formatMoney(purchaseCents), hint: `${incomingActs.length} завершенных актов`, href: "/dashboard/inventory" },
    { label: "Списания периода", value: formatMoney(writeoffCents), hint: `${writeoffActs.length} завершенных актов`, href: "/dashboard/inventory" },
    { label: "Скидки", value: formatMoney(discountCents), hint: `${formatPercent(discountCents, subtotalCents)} от суммы до скидки` },
  ];

  const orderFlow: SalesMetric[] = [
    { label: "В работе", value: String(activeOrders.length), hint: formatMoney(activePipelineCents), href: "/dashboard/orders/dispatcher" },
    { label: "Закрытые", value: String(completedOrders.length), hint: formatMoney(revenueCents), href: "/dashboard/orders" },
    { label: "Отмененные", value: String(cancelledOrders.length), hint: `${formatPercent(cancelledOrders.length, periodOrders.length)} от заказов`, href: "/dashboard/orders", tone: cancelledOrders.length ? "warning" : "good" },
  ];

  const revenueByCategory = groupBy(soldItems, (item) => item.catalogCategory ?? "Без категории", (item) => item.totalPriceCents)
    .slice(0, 8)
    .map((item) => ({ label: item.label, value: formatMoney(item.value), hint: `${formatPercent(item.value, revenueCents)} от выручки` }));
  const sourceFlow = groupBy(completedOrders, (order) => order.source, (order) => order.totalCents)
    .map((item) => ({ label: item.label, value: formatMoney(item.value), hint: `${formatPercent(item.value, revenueCents)} от выручки` }));
  const stockValueCents = sumBy(input.products, (product) => product.stockQuantity * product.priceCents);
  const linkedCatalogItems = input.catalogItems.filter((item) => item.technologicalCardId > 0 || item.variants.some((variant) => variant.technologicalCardId > 0)).length;

  return {
    range,
    periodOptions: buildPeriodOptions(range.period, range.date),
    previousHref: buildSalesHref(range.period, range.previousDate),
    nextHref: buildSalesHref(range.period, range.nextDate),
    dateInputType: range.period === "year" ? "number" : range.period === "month" ? "month" : "date",
    kpis,
    orderFlow,
    profitability,
    revenueByCategory,
    sourceFlow,
    menuPerformance: buildMenuPerformance(soldItems, estimateCost),
    readiness: [
      { label: "Техкарты", value: `${input.techCards.length}`, hint: "База для себестоимости блюд", href: "/dashboard/inventory" },
      { label: "Связка прайса", value: `${linkedCatalogItems}/${input.catalogItems.length}`, hint: "Позиции каталога с техкартами", href: "/dashboard/catalog" },
      { label: "Склад", value: formatMoney(stockValueCents), hint: `${input.products.length} продуктов`, href: "/dashboard/inventory" },
    ] satisfies SalesMetric[],
    reportActions: [
      { label: "Заказы", href: "/dashboard/orders", hint: "Открыть список заказов" },
      { label: "Месячный отчет", href: `/dashboard/reports?month=${range.date.slice(0, 7)}`, hint: "Сводка по отчетам" },
      { label: "Склад", href: "/dashboard/inventory", hint: "Закупки и списания" },
      { label: "Каталог", href: "/dashboard/catalog", hint: "Прайс и техкарты" },
    ],
  };
}
