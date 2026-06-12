/* eslint-disable max-lines */
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import type {
  IncomingActSummary,
  ProductItem,
  WriteoffActSummary,
} from "@/modules/inventory/inventory.types";
import type { LoyaltySnapshot } from "@/modules/loyalty/loyalty.types";
import type { OrderItemSummary, OrderListItem } from "@/modules/orders/orders.types";
import { buildOrderItemCostEstimator } from "@/modules/sales/sales.costing";
import {
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

export type ReportsInput = {
  period?: string | null;
  date?: string | null;
  month?: string | null;
  orders: OrderListItem[];
  catalogItems: CatalogItem[];
  products: ProductItem[];
  techCards: TechCardItem[];
  incomingActs: IncomingActSummary[];
  writeoffActs: WriteoffActSummary[];
  employees: Employee[];
  clients: Client[];
  loyalty: LoyaltySnapshot | null;
};

export type ReportMetric = {
  label: string;
  value: string;
  hint: string;
  tone?: "good" | "warning" | "danger";
};

export type ReportRow = {
  label: string;
  value: string;
  hint: string;
  tone?: "good" | "warning" | "danger";
};

export type ReportDetail = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  formula: string;
  result: string;
  resultHint: string;
  metrics: ReportMetric[];
  rows: ReportRow[];
  risks: ReportRow[];
};

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(Math.round(cents) / 100);
}

function formatNumber(value: number) {
  return NUMBER_FORMATTER.format(value);
}

function formatPercent(part: number, total: number) {
  return total ? `${NUMBER_FORMATTER.format((part / total) * 100)}%` : "0%";
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function normalizeReportMonth(month?: string | null) {
  return month && /^\d{4}-\d{2}$/.test(month) ? month : getCurrentMonthKey();
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

function groupBy<T>(items: T[], getKey: (item: T) => string, getValue: (item: T) => number) {
  const map = new Map<string, number>();
  items.forEach((item) => map.set(getKey(item), (map.get(getKey(item)) ?? 0) + getValue(item)));
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function getActDate(act: IncomingActSummary | WriteoffActSummary) {
  return act.completedAt ?? act.createdAt;
}

function addMonths(month: string, offset: number) {
  const [year, monthPart] = month.split("-").map(Number);
  const date = new Date(year, monthPart - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildReportsHref(period: SalesPeriod, date: string) {
  return `/dashboard/reports?period=${period}&date=${encodeURIComponent(date)}`;
}

function resolveLegacyDate(input: ReportsInput) {
  if (input.date) {
    return input.date;
  }
  if (input.month) {
    return normalizeReportMonth(input.month);
  }
  return null;
}

function buildPeriodOptions(period: SalesPeriod, date: string) {
  return SALES_PERIODS.map((item) => ({
    label: SALES_PERIOD_LABELS[item],
    href: buildReportsHref(item, date),
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

function getMonthBounds(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  return {
    start: new Date(year, monthPart - 1, 1),
    end: new Date(year, monthPart, 1),
  };
}

function isBetween(dateValue: string, start: Date, end: Date) {
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime()) && date >= start && date < end;
}

function flattenOrderItems(orders: OrderListItem[]) {
  return orders.flatMap((order) => order.items);
}

function getStockValueCents(products: ProductItem[]) {
  return sumBy(products, (product) => product.stockQuantity * product.priceCents);
}

function buildRowsFromGroups(groups: Array<{ label: string; value: number }>, total: number, valueKind: "money" | "number" = "money") {
  return groups.slice(0, 6).map((item) => ({
    label: item.label,
    value: valueKind === "money" ? formatMoney(item.value) : formatNumber(item.value),
    hint: `${formatPercent(item.value, total)} от итога`,
  }));
}

function getOrderCostCents(orders: OrderListItem[], estimateCost: (item: OrderItemSummary) => number) {
  return sumBy(flattenOrderItems(orders), estimateCost);
}

function countHolidays(month: string) {
  const { start, end } = getMonthBounds(month);
  let holidays = 0;
  let weekends = 0;
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    holidays += HOLIDAY_DATES.has(key) ? 1 : 0;
    weekends += [0, 6].includes(date.getDay()) ? 1 : 0;
  }
  return { holidays, weekends };
}

function buildMenuRows(items: OrderItemSummary[], estimateCost: (item: OrderItemSummary) => number) {
  const map = new Map<string, { quantity: number; revenueCents: number; costCents: number }>();
  items.forEach((item) => {
    const current = map.get(item.itemName) ?? { quantity: 0, revenueCents: 0, costCents: 0 };
    current.quantity += item.quantity;
    current.revenueCents += item.totalPriceCents;
    current.costCents += estimateCost(item);
    map.set(item.itemName, current);
  });

  return [...map.entries()]
    .map(([label, value]) => {
      const marginCents = value.revenueCents - value.costCents;
      return {
        label,
        value: formatMoney(marginCents),
        hint: `${formatNumber(value.quantity)} шт · выручка ${formatMoney(value.revenueCents)} · food cost ${formatPercent(value.costCents, value.revenueCents)}`,
        sort: marginCents,
        tone: marginCents < 0 ? "danger" as const : marginCents < value.revenueCents * 0.35 ? "warning" as const : "good" as const,
      };
    })
    .sort((a, b) => b.sort - a.sort);
}

function buildClientStats(orders: OrderListItem[]) {
  const map = new Map<number, { orders: number; revenueCents: number }>();
  orders.forEach((order) => {
    if (!order.clientId || order.status !== "DELIVERED_PAID") {
      return;
    }
    const current = map.get(order.clientId) ?? { orders: 0, revenueCents: 0 };
    current.orders += 1;
    current.revenueCents += order.totalCents;
    map.set(order.clientId, current);
  });
  return map;
}

export function buildReportsViewModel(input: ReportsInput) {
  const range = buildSalesPeriodRange(input.period ?? (input.month ? "month" : null), resolveLegacyDate(input));
  const selectedDate = new Date(range.selectedDate);
  const selectedMonth = range.selectedDate.slice(0, 7);
  const previousMonth = addMonths(selectedMonth, -1);
  const nextMonth = addMonths(selectedMonth, 1);
  const weekStart = new Date(range.end);
  weekStart.setDate(weekStart.getDate() - 7);

  const estimateCost = buildOrderItemCostEstimator(input);
  const periodOrders = input.orders.filter((order) => isDateInRange(order.createdAt, range));
  const weekOrders = input.orders.filter((order) => isBetween(order.createdAt, weekStart, range.end));
  const completedOrders = periodOrders.filter((order) => order.status === "DELIVERED_PAID");
  const completedWeekOrders = weekOrders.filter((order) => order.status === "DELIVERED_PAID");
  const cancelledOrders = periodOrders.filter((order) => order.status === "CANCELLED");
  const incomingActs = input.incomingActs.filter((act) => act.isCompleted && isDateInRange(getActDate(act), range));
  const previousIncomingActs = input.incomingActs.filter((act) => act.isCompleted && getActDate(act)?.startsWith(previousMonth));
  const writeoffActs = input.writeoffActs.filter((act) => act.isCompleted && isDateInRange(getActDate(act), range));
  const previousWriteoffActs = input.writeoffActs.filter((act) => act.isCompleted && getActDate(act)?.startsWith(previousMonth));
  const newClients = input.clients.filter((client) => isDateInRange(client.createdAt, range));
  const soldItems = flattenOrderItems(completedOrders);
  const revenueCents = sumBy(completedOrders, (order) => order.totalCents);
  const weekRevenueCents = sumBy(completedWeekOrders, (order) => order.totalCents);
  const subtotalCents = sumBy(completedOrders, (order) => order.subtotalCents);
  const discountCents = Math.max(subtotalCents - revenueCents, 0);
  const purchaseCents = sumBy(incomingActs, (act) => act.totalCents);
  const writeoffCents = sumBy(writeoffActs, (act) => act.totalCents);
  const previousPurchaseCents = sumBy(previousIncomingActs, (act) => act.totalCents);
  const previousWriteoffCents = sumBy(previousWriteoffActs, (act) => act.totalCents);
  const endingStockCents = getStockValueCents(input.products);
  const startingStockCents = Math.max(0, endingStockCents - purchaseCents + previousPurchaseCents + writeoffCents - previousWriteoffCents);
  const cogsCents = getOrderCostCents(completedOrders, estimateCost) || Math.max(0, startingStockCents + purchaseCents - endingStockCents);
  const weekCogsCents = getOrderCostCents(completedWeekOrders, estimateCost);
  const grossMarginCents = revenueCents - cogsCents;
  const operatingMarginCents = revenueCents - cogsCents - writeoffCents - discountCents;
  const laborCostCents = sumBy(input.employees, (employee) => (employee.monthlyHours ?? 0) * 35000);
  const primeCostCents = cogsCents + laborCostCents;
  const averageCheckCents = completedOrders.length ? revenueCents / completedOrders.length : 0;
  const clientStats = buildClientStats(input.orders);
  const repeatClients = [...clientStats.values()].filter((stat) => stat.orders > 1).length;
  const periodClientIds = new Set(completedOrders.map((order) => order.clientId).filter(Boolean));
  const menuRows = buildMenuRows(soldItems, estimateCost);
  const lowMenuRows = [...menuRows].reverse().slice(0, 5);
  const { holidays, weekends } = countHolidays(nextMonth);

  const reports: ReportDetail[] = [
    {
      id: "sales",
      title: "Отчет по продажам",
      shortTitle: "Продажи",
      description: "Выручка, средний чек, статусы заказов, категории меню и динамика продаж за выбранный период.",
      formula: "Выручка = сумма оплаченных заказов. Средний чек = выручка / количество оплаченных заказов.",
      result: formatMoney(revenueCents),
      resultHint: `${completedOrders.length} оплаченных заказов за период ${range.label}`,
      metrics: [
        { label: "Выручка", value: formatMoney(revenueCents), hint: "Доставленные и оплаченные заказы" },
        { label: "Средний чек", value: formatMoney(averageCheckCents), hint: "Выручка / оплаченные заказы" },
        { label: "Заказы", value: formatNumber(periodOrders.length), hint: `${completedOrders.length} закрытых · ${cancelledOrders.length} отмененных` },
        { label: "Скидки", value: formatMoney(discountCents), hint: formatPercent(discountCents, subtotalCents), tone: discountCents > subtotalCents * 0.12 ? "warning" : "good" },
      ],
      rows: buildRowsFromGroups(groupBy(soldItems, (item) => item.catalogCategory ?? "Без категории", (item) => item.totalPriceCents), revenueCents),
      risks: [
        { label: "Отмены", value: formatPercent(cancelledOrders.length, periodOrders.length), hint: "Доля отмененных заказов", tone: cancelledOrders.length > periodOrders.length * 0.08 ? "danger" : "good" },
        { label: "Внутренние заказы", value: formatNumber(periodOrders.filter((order) => order.isInternal).length), hint: "Не должны искажать коммерческую выручку", tone: periodOrders.some((order) => order.isInternal) ? "warning" : "good" },
      ],
    },
    {
      id: "purchases",
      title: "Отчет по закупкам",
      shortTitle: "Закупки",
      description: "Поставщики, суммы закупок, дорогие позиции, количество актов и закупочная нагрузка.",
      formula: "Закупки периода = сумма завершенных актов прихода. Доля поставщика = закупки поставщика / закупки периода.",
      result: formatMoney(purchaseCents),
      resultHint: `${incomingActs.length} завершенных актов за период ${range.label}`,
      metrics: [
        { label: "Сумма закупок", value: formatMoney(purchaseCents), hint: "Только завершенные приходы" },
        { label: "Поставщики", value: formatNumber(new Set(incomingActs.map((act) => act.supplierName ?? "Без поставщика")).size), hint: "Уникальные поставщики периода" },
        { label: "Позиций", value: formatNumber(sumBy(incomingActs, (act) => act.itemsCount)), hint: "Строки в актах прихода" },
        { label: "К выручке", value: formatPercent(purchaseCents, revenueCents), hint: "Закупочная нагрузка", tone: purchaseCents > revenueCents * 0.45 ? "warning" : "good" },
      ],
      rows: buildRowsFromGroups(groupBy(incomingActs, (act) => act.supplierName ?? "Без поставщика", (act) => act.totalCents), purchaseCents),
      risks: incomingActs
        .flatMap((act) => act.items.map((item) => ({ ...item, supplierName: act.supplierName ?? "Без поставщика" })))
        .sort((a, b) => b.totalCents - a.totalCents)
        .slice(0, 8)
        .map((item) => ({ label: item.productName, value: formatMoney(item.totalCents), hint: `${item.supplierName} · ${formatNumber(item.quantity)} ${item.productUnit}` })),
    },
    {
      id: "new-clients",
      title: "Новые клиенты",
      shortTitle: "Новые клиенты",
      description: "Количество новых пользователей, первые покупки, стартовая выручка и качество привлечения.",
      formula: "Конверсия новых = новые клиенты с заказами / все новые клиенты периода.",
      result: formatNumber(newClients.length),
      resultHint: `Новых клиентов за период ${range.label}`,
      metrics: [
        { label: "Новые клиенты", value: formatNumber(newClients.length), hint: "По дате создания карточки клиента" },
        { label: "С покупками", value: formatNumber(newClients.filter((client) => client.ordersCount > 0).length), hint: "Уже сделали хотя бы один заказ" },
        { label: "Выручка новых", value: formatMoney(sumBy(newClients, (client) => client.totalSpentCents)), hint: "Суммарно по карточкам клиентов" },
        { label: "Конверсия", value: formatPercent(newClients.filter((client) => client.ordersCount > 0).length, newClients.length), hint: "Новые клиенты с заказами" },
      ],
      rows: newClients
        .slice()
        .sort((a, b) => b.totalSpentCents - a.totalSpentCents)
        .slice(0, 8)
        .map((client) => ({ label: client.name, value: formatMoney(client.totalSpentCents), hint: `${client.ordersCount} заказов · ${client.phone}` })),
      risks: [
        { label: "Без первого заказа", value: formatNumber(newClients.filter((client) => client.ordersCount === 0).length), hint: "Стоит вернуть приветственным предложением", tone: newClients.some((client) => client.ordersCount === 0) ? "warning" : "good" },
      ],
    },
    {
      id: "sales-channels",
      title: "Каналы продаж",
      shortTitle: "Каналы",
      description: "Сравнение сайта, телефона и ручных заказов: выручка, средний чек и доля канала.",
      formula: "Доля канала = выручка канала / общая выручка. Средний чек канала = выручка канала / заказы канала.",
      result: buildRowsFromGroups(groupBy(completedOrders, (order) => order.source, (order) => order.totalCents), revenueCents)[0]?.label ?? "Нет продаж",
      resultHint: "Канал с максимальной выручкой за выбранный период",
      metrics: [
        { label: "Сайт", value: formatMoney(sumBy(completedOrders.filter((order) => order.source === "SITE"), (order) => order.totalCents)), hint: "Заказы с публичного сайта" },
        { label: "Телефон", value: formatMoney(sumBy(completedOrders.filter((order) => order.source === "PHONE"), (order) => order.totalCents)), hint: "Ручные телефонные заказы" },
        { label: "Админ", value: formatMoney(sumBy(completedOrders.filter((order) => order.source === "ADMIN"), (order) => order.totalCents)), hint: "Заказы из CRM" },
        { label: "Клиентов", value: formatNumber(periodClientIds.size), hint: "Уникальные покупатели периода" },
      ],
      rows: buildRowsFromGroups(groupBy(completedOrders, (order) => order.source, (order) => order.totalCents), revenueCents),
      risks: buildRowsFromGroups(groupBy(cancelledOrders, (order) => order.source, () => 1), cancelledOrders.length, "number"),
    },
    {
      id: "flash",
      title: "Короткий недельный отчет",
      shortTitle: "Недельный flash",
      description: "Короткий еженедельный отчет: продажи, закупки, списания, маржа и проблемные зоны.",
      formula: "Опер. маржа = выручка недели - себестоимость блюд - списания периода - скидки",
      result: formatMoney(weekRevenueCents - weekCogsCents - writeoffCents - discountCents),
      resultHint: `Последние 7 дней до конца периода ${range.label}`,
      metrics: [
        { label: "Выручка недели", value: formatMoney(weekRevenueCents), hint: `${completedWeekOrders.length} оплаченных заказов` },
        { label: "Food cost недели", value: formatPercent(weekCogsCents, weekRevenueCents), hint: formatMoney(weekCogsCents), tone: weekCogsCents > weekRevenueCents * 0.38 ? "warning" : "good" },
        { label: "Списания периода", value: formatMoney(writeoffCents), hint: `${writeoffActs.length} актов` },
        { label: "Отмены", value: formatPercent(cancelledOrders.length, periodOrders.length), hint: `${cancelledOrders.length} из ${periodOrders.length} заказов`, tone: cancelledOrders.length > periodOrders.length * 0.08 ? "danger" : "good" },
      ],
      rows: buildRowsFromGroups(groupBy(completedWeekOrders, (order) => order.source, (order) => order.totalCents), weekRevenueCents),
      risks: [
        { label: "Скидочная нагрузка", value: formatPercent(discountCents, subtotalCents), hint: formatMoney(discountCents), tone: discountCents > subtotalCents * 0.12 ? "warning" : "good" },
        { label: "Проблема отмен", value: formatPercent(cancelledOrders.length, periodOrders.length), hint: "Контроль причин отмен заказов", tone: cancelledOrders.length ? "warning" : "good" },
      ],
    },
    {
      id: "cogs",
      title: "Себестоимость продаж",
      shortTitle: "Себестоимость",
      description: "Себестоимость проданных товаров: начальный остаток + закупки - конечный остаток.",
      formula: "Себестоимость = начальный остаток + закупки - конечный остаток. Если есть техкарты, берется точная себестоимость проданных блюд.",
      result: formatPercent(cogsCents, revenueCents),
      resultHint: `${formatMoney(cogsCents)} себестоимость проданных блюд`,
      metrics: [
        { label: "Начальный остаток", value: formatMoney(startingStockCents), hint: "Оценка на начало периода" },
        { label: "Закупки", value: formatMoney(purchaseCents), hint: `${incomingActs.length} завершенных актов` },
        { label: "Конечный остаток", value: formatMoney(endingStockCents), hint: `${input.products.length} продуктов на складе` },
        { label: "Валовая маржа", value: formatMoney(grossMarginCents), hint: formatPercent(grossMarginCents, revenueCents), tone: grossMarginCents < 0 ? "danger" : "good" },
      ],
      rows: buildRowsFromGroups(groupBy(soldItems, (item) => item.catalogCategory ?? "Без категории", (item) => estimateCost(item)), cogsCents),
      risks: input.catalogItems
        .filter((item) => !item.technologicalCardId && !item.variants.some((variant) => variant.technologicalCardId))
        .slice(0, 5)
        .map((item) => ({ label: item.name, value: "Нет техкарты", hint: "Себестоимость позиции может быть занижена", tone: "warning" as const })),
    },
    {
      id: "prime-cost",
      title: "Основная себестоимость",
      shortTitle: "Себестоимость",
      description: "Ключевой ресторанный отчет: food cost + labor cost относительно выручки.",
      formula: "Основная себестоимость = себестоимость блюд + фонд труда. Норма для ресторана обычно держится ниже 60-65% выручки.",
      result: formatPercent(primeCostCents, revenueCents),
      resultHint: `${formatMoney(primeCostCents)} из ${formatMoney(revenueCents)} выручки`,
      metrics: [
        { label: "Себестоимость блюд", value: formatMoney(cogsCents), hint: formatPercent(cogsCents, revenueCents) },
        { label: "Фонд труда", value: formatMoney(laborCostCents), hint: "Плановые часы * 350 ₽" },
        { label: "Заказы / час", value: formatNumber(completedOrders.length / Math.max(1, sumBy(input.employees, (employee) => employee.monthlyHours ?? 0))), hint: "Производительность команды" },
        { label: "Опер. маржа", value: formatMoney(operatingMarginCents), hint: formatPercent(operatingMarginCents, revenueCents), tone: operatingMarginCents < 0 ? "danger" : "good" },
      ],
      rows: input.employees.slice(0, 6).map((employee) => ({
        label: employee.name,
        value: formatMoney((employee.monthlyHours ?? 0) * 35000),
        hint: `${employee.role} · ${formatNumber(employee.monthlyHours ?? 0)} ч`,
      })),
      risks: [
        { label: "Prime cost", value: formatPercent(primeCostCents, revenueCents), hint: "Выше 65% требует разбора цен, закупок и смен", tone: primeCostCents > revenueCents * 0.65 ? "danger" : "good" },
      ],
    },
    {
      id: "menu-performance",
      title: "Эффективность меню",
      shortTitle: "Меню",
      description: "Популярные, непопулярные и высокомаржинальные позиции меню.",
      formula: "Маржа позиции = выручка позиции - себестоимость по техкарте. Популярность = количество проданных порций.",
      result: menuRows[0]?.label ?? "Нет продаж",
      resultHint: menuRows[0] ? `Лидер по марже: ${menuRows[0].value}` : "За выбранный период продаж нет",
      metrics: [
        { label: "Позиций продано", value: formatNumber(new Set(soldItems.map((item) => item.itemName)).size), hint: `${formatNumber(sumBy(soldItems, (item) => item.quantity))} порций` },
        { label: "Высокая маржа", value: formatNumber(menuRows.filter((row) => row.tone === "good").length), hint: "Маржа выше 35%" },
        { label: "Низкая маржа", value: formatNumber(menuRows.filter((row) => row.tone !== "good").length), hint: "Нужна проверка цены или техкарты" },
        { label: "Связка техкарт", value: `${input.catalogItems.length - input.catalogItems.filter((item) => !item.technologicalCardId).length}/${input.catalogItems.length}`, hint: "Готовность расчетов" },
      ],
      rows: menuRows.slice(0, 8),
      risks: lowMenuRows.map((row) => ({ ...row, hint: `Низкая эффективность: ${row.hint}` })),
    },
    {
      id: "waste",
      title: "Отчет по списаниям",
      shortTitle: "Списания",
      description: "Списания по причинам, категориям, сотрудникам и динамике потерь.",
      formula: "Доля списаний = списания / выручка. Дополнительно считаем причины, категории и ответственных.",
      result: formatPercent(writeoffCents, revenueCents),
      resultHint: `${formatMoney(writeoffCents)} списано за период ${range.label}`,
      metrics: [
        { label: "Сумма", value: formatMoney(writeoffCents), hint: `${writeoffActs.length} актов` },
        { label: "Позиций", value: formatNumber(sumBy(writeoffActs, (act) => act.itemsCount)), hint: "Строки в актах" },
        { label: "Количество", value: formatNumber(sumBy(writeoffActs, (act) => act.totalQuantity)), hint: "Единицы списания" },
        { label: "Динамика", value: formatMoney(writeoffCents - previousWriteoffCents), hint: "К прошлому месяцу", tone: writeoffCents > previousWriteoffCents ? "warning" : "good" },
      ],
      rows: buildRowsFromGroups(groupBy(writeoffActs, (act) => act.reason, (act) => act.totalCents), writeoffCents),
      risks: buildRowsFromGroups(groupBy(writeoffActs, (act) => act.responsibleEmployeeName, (act) => act.totalCents), writeoffCents),
    },
    {
      id: "price-change",
      title: "Анализ изменения цен",
      shortTitle: "Цены",
      description: "Изменение цен прайса и закупок относительно себестоимости и маржи.",
      formula: "Ценовой запас = цена меню - расчетная себестоимость. Закупочный риск = товары с высокой ценой и остатком.",
      result: formatPercent(grossMarginCents, revenueCents),
      resultHint: "Валовая маржа после себестоимости блюд",
      metrics: [
        { label: "Средний чек", value: formatMoney(averageCheckCents), hint: "После скидок" },
        { label: "Скидки", value: formatMoney(discountCents), hint: formatPercent(discountCents, subtotalCents), tone: discountCents > subtotalCents * 0.12 ? "warning" : "good" },
        { label: "Закупки", value: formatMoney(purchaseCents), hint: formatPercent(purchaseCents, revenueCents) },
        { label: "Прайс", value: formatNumber(input.catalogItems.length), hint: "Позиций каталога" },
      ],
      rows: input.catalogItems
        .slice()
        .sort((a, b) => b.priceCents - a.priceCents)
        .slice(0, 8)
        .map((item) => ({ label: item.name, value: formatMoney(item.priceCents), hint: item.category ?? "Без категории" })),
      risks: input.products
        .slice()
        .sort((a, b) => b.priceCents * b.stockQuantity - a.priceCents * a.stockQuantity)
        .slice(0, 6)
        .map((item) => ({ label: item.name, value: formatMoney(item.priceCents), hint: `${formatNumber(item.stockQuantity)} ${item.unit} на складе` })),
    },
    {
      id: "labor",
      title: "Производительность труда",
      shortTitle: "Персонал",
      description: "Выручка и количество заказов на сотрудника или рабочий час.",
      formula: "Выручка / час = выручка периода / плановые часы. Заказы / сотрудника = закрытые заказы / команда.",
      result: formatMoney(revenueCents / Math.max(1, sumBy(input.employees, (employee) => employee.monthlyHours ?? 0))),
      resultHint: "Выручка на один плановый час",
      metrics: [
        { label: "Команда", value: formatNumber(input.employees.length), hint: "Активные профили" },
        { label: "Плановые часы", value: formatNumber(sumBy(input.employees, (employee) => employee.monthlyHours ?? 0)), hint: "Из карточек сотрудников" },
        { label: "Заказов / сотрудника", value: formatNumber(completedOrders.length / Math.max(1, input.employees.length)), hint: `${completedOrders.length} закрытых заказов` },
        { label: "Выручка / сотрудника", value: formatMoney(revenueCents / Math.max(1, input.employees.length)), hint: "Средняя нагрузка" },
      ],
      rows: buildRowsFromGroups(groupBy(completedOrders, (order) => order.employeeName, (order) => order.totalCents), revenueCents),
      risks: input.employees
        .filter((employee) => !employee.monthlyHours)
        .slice(0, 5)
        .map((employee) => ({ label: employee.name, value: "Нет часов", hint: "Заполни график для точного labor cost", tone: "warning" as const })),
    },
    {
      id: "retention",
      title: "Удержание клиентов",
      shortTitle: "Клиенты",
      description: "Повторные клиенты, уровни лояльности, частота заказов и средний чек.",
      formula: "Удержание = клиенты с 2+ заказами / вся клиентская база. Частота = закрытые заказы / активные клиенты периода.",
      result: formatPercent(repeatClients, input.clients.length),
      resultHint: `${repeatClients} повторных клиентов из ${input.clients.length}`,
      metrics: [
        { label: "Активные клиенты", value: formatNumber(periodClientIds.size), hint: "Покупали в выбранном периоде" },
        { label: "Участники лояльности", value: formatNumber(input.loyalty?.participantsCount ?? 0), hint: "По данным loyalty API" },
        { label: "Частота", value: formatNumber(completedOrders.length / Math.max(1, periodClientIds.size)), hint: "Заказов на активного клиента" },
        { label: "Средний чек", value: formatMoney(averageCheckCents), hint: "По закрытым заказам" },
      ],
      rows: input.clients
        .slice()
        .sort((a, b) => b.totalSpentCents - a.totalSpentCents)
        .slice(0, 8)
        .map((client) => ({ label: client.name, value: formatMoney(client.totalSpentCents), hint: `${client.ordersCount} заказов · ${client.loyaltyLevel ?? "без уровня"}` })),
      risks: [
        { label: "Следующий месяц", value: `${holidays + weekends} дней`, hint: "Выходные и праздники усиливают спрос, учитывай в CRM-кампаниях" },
        { label: "Без повторов", value: formatNumber(Math.max(0, input.clients.length - repeatClients)), hint: "Клиенты, которых стоит вернуть рассылкой", tone: "warning" },
      ],
    },
  ];

  const summary: ReportMetric[] = [
    { label: "Продажи", value: formatMoney(revenueCents), hint: `${completedOrders.length} оплаченных заказов` },
    { label: "Себестоимость", value: formatPercent(cogsCents, revenueCents), hint: formatMoney(cogsCents), tone: cogsCents > revenueCents * 0.38 ? "warning" : "good" },
    { label: "Основная себест.", value: formatPercent(primeCostCents, revenueCents), hint: formatMoney(primeCostCents), tone: primeCostCents > revenueCents * 0.65 ? "danger" : "good" },
    { label: "Опер. маржа", value: formatMoney(operatingMarginCents), hint: formatPercent(operatingMarginCents, revenueCents), tone: operatingMarginCents < 0 ? "danger" : "good" },
  ];

  return {
    range,
    selectedPeriodLabel: range.label,
    periodOptions: buildPeriodOptions(range.period, range.selectedDate),
    previousHref: buildReportsHref(range.period, range.previousDate),
    nextHref: buildReportsHref(range.period, range.nextDate),
    dateParts: buildDateParts(selectedDate),
    summary,
    reports,
  };
}
