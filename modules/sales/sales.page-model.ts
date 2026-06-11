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
const HOLIDAY_DATES = new Set(["01-01", "01-02", "01-03", "01-07", "02-23", "03-08", "05-01", "05-09", "06-12", "11-04", "12-31"]);

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getCalendarDays(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

function isBetween(dateValue: string, start: Date, end: Date) {
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime()) && date >= start && date < end;
}

function countMonthDays(start: Date) {
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  let weekends = 0;
  let holidays = 0;

  for (let date = new Date(start); date < end; date = addDays(date, 1)) {
    const day = date.getDay();
    const holidayKey = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    weekends += day === 0 || day === 6 ? 1 : 0;
    holidays += HOLIDAY_DATES.has(holidayKey) ? 1 : 0;
  }

  return { days: getCalendarDays(start, end), weekends, holidays };
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

function buildDateParts(date: Date) {
  const currentYear = new Date().getFullYear();
  const selectedYear = date.getFullYear();
  const startYear = Math.min(currentYear - 5, selectedYear - 2);
  const endYear = Math.max(currentYear + 2, selectedYear + 2);

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(selectedYear),
    days: Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")),
    months: Array.from({ length: 12 }, (_, index) => {
      const value = String(index + 1).padStart(2, "0");
      const label = new Date(2026, index, 1).toLocaleDateString("ru-RU", { month: "long" });
      return { value, label };
    }),
    years: Array.from({ length: endYear - startYear + 1 }, (_, index) => String(startYear + index)),
  };
}

function buildSalesForecast(orders: OrderListItem[], range: ReturnType<typeof buildSalesPeriodRange>) {
  const completedOrders = orders.filter((order) => order.status === "DELIVERED_PAID");
  const cancelledOrders = orders.filter((order) => order.status === "CANCELLED");
  const nextMonthStart = new Date(range.start.getFullYear(), range.start.getMonth() + 1, 1);
  const last30Start = addDays(range.end, -30);
  const previous30Start = addDays(range.end, -60);
  const last30Orders = completedOrders.filter((order) => isBetween(order.createdAt, last30Start, range.end));
  const previous30Orders = completedOrders.filter((order) => isBetween(order.createdAt, previous30Start, last30Start));
  const periodOrders = completedOrders.filter((order) => isDateInRange(order.createdAt, range));
  const last30Revenue = sumBy(last30Orders, (order) => order.totalCents);
  const previous30Revenue = sumBy(previous30Orders, (order) => order.totalCents);
  const periodRevenue = sumBy(periodOrders, (order) => order.totalCents);
  const averageCheckCents = completedOrders.length ? sumBy(completedOrders, (order) => order.totalCents) / completedOrders.length : 0;
  const last30DailyCents = last30Revenue / 30;
  const periodDailyCents = periodRevenue / getCalendarDays(range.start, range.end);
  const baseDailyCents = last30DailyCents || periodDailyCents;
  const trend = previous30Revenue ? clamp(last30Revenue / previous30Revenue, 0.72, 1.35) : 1;
  const monthShape = countMonthDays(nextMonthStart);
  const cancellationRate = orders.length ? cancelledOrders.length / orders.length : 0;
  const discountCents = sumBy(completedOrders, (order) => Math.max(order.subtotalCents - order.totalCents, 0));
  const subtotalCents = sumBy(completedOrders, (order) => order.subtotalCents);
  const discountRate = subtotalCents ? discountCents / subtotalCents : 0;
  const calendarFactor = 1 + (monthShape.weekends / monthShape.days) * 0.08 + monthShape.holidays * 0.12;
  const riskFactor = clamp(1 - cancellationRate * 0.16 - discountRate * 0.05, 0.82, 1.04);
  const forecastRevenueCents = Math.round(baseDailyCents * monthShape.days * trend * calendarFactor * riskFactor);
  const forecastOrders = averageCheckCents ? Math.round(forecastRevenueCents / averageCheckCents) : 0;
  const confidence = last30Orders.length >= 80 ? "Высокая" : last30Orders.length >= 25 ? "Средняя" : "Низкая";
  const label = nextMonthStart.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return {
    label,
    metrics: [
      { label: "Прогноз выручки", value: formatMoney(forecastRevenueCents), hint: `На ${label}` },
      { label: "Прогноз заказов", value: formatNumber(forecastOrders), hint: `Средний чек ${formatMoney(Math.round(averageCheckCents))}` },
      { label: "Средний день", value: formatMoney(Math.round(baseDailyCents * trend * calendarFactor * riskFactor)), hint: "С учетом тренда и календаря" },
      { label: "Уверенность", value: confidence, hint: `${last30Orders.length} заказов за последние 30 дней` },
    ],
    factors: [
      { label: "Тренд продаж", value: formatPercent(Math.round((trend - 1) * 100), 100), hint: "Последние 30 дней к предыдущим 30" },
      { label: "Выходные", value: String(monthShape.weekends), hint: "Дней с повышенным спросом" },
      { label: "Праздники", value: String(monthShape.holidays), hint: "Фиксированные праздничные даты месяца" },
      { label: "Риск отмен", value: formatPercent(cancelledOrders.length, orders.length), hint: "Учитывается как понижающий фактор" },
    ],
  };
}

export function buildSalesAnalyticsViewModel(input: SalesAnalyticsInput) {
  const range = buildSalesPeriodRange(input.period, input.date);
  const selectedDate = new Date(range.selectedDate);
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
    periodOptions: buildPeriodOptions(range.period, range.selectedDate),
    previousHref: buildSalesHref(range.period, range.previousDate),
    nextHref: buildSalesHref(range.period, range.nextDate),
    dateParts: buildDateParts(selectedDate),
    kpis,
    orderFlow,
    salesForecast: buildSalesForecast(input.orders, range),
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
