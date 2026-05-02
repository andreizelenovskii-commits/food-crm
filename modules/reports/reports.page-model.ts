import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { Employee } from "@/modules/employees/employees.types";
import type {
  IncomingActSummary,
  ProductItem,
  WriteoffActSummary,
} from "@/modules/inventory/inventory.types";
import type { LoyaltySnapshot } from "@/modules/loyalty/loyalty.types";
import type { OrderListItem } from "@/modules/orders/orders.types";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("ru-RU");

export type ReportsInput = {
  month: string;
  orders: OrderListItem[];
  catalogItems: CatalogItem[];
  products: ProductItem[];
  incomingActs: IncomingActSummary[];
  writeoffActs: WriteoffActSummary[];
  employees: Employee[];
  loyalty: LoyaltySnapshot | null;
};

export type ReportMetric = {
  label: string;
  value: string;
  hint: string;
};

export type ReportSection = {
  title: string;
  description: string;
  metrics: ReportMetric[];
};

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

function formatNumber(value: number) {
  return NUMBER_FORMATTER.format(value);
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function normalizeReportMonth(month?: string | null) {
  return month && /^\d{4}-\d{2}$/.test(month) ? month : getCurrentMonthKey();
}

function isInMonth(dateValue: string | null | undefined, month: string) {
  if (!dateValue) {
    return false;
  }

  return dateValue.slice(0, 7) === month;
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

function percent(part: number, total: number) {
  return total ? `${Math.round((part / total) * 100)}%` : "0%";
}

export function buildReportsViewModel({
  month,
  orders,
  catalogItems,
  products,
  incomingActs,
  writeoffActs,
  employees,
  loyalty,
}: ReportsInput) {
  const selectedMonth = normalizeReportMonth(month);
  const monthOrders = orders.filter((order) => isInMonth(order.createdAt, selectedMonth));
  const completedOrders = monthOrders.filter((order) => order.status === "DELIVERED_PAID");
  const cancelledOrders = monthOrders.filter((order) => order.status === "CANCELLED");
  const monthIncomingActs = incomingActs.filter((act) =>
    isInMonth(act.completedAt ?? act.createdAt, selectedMonth),
  );
  const completedIncomingActs = monthIncomingActs.filter((act) => act.isCompleted);
  const monthWriteoffActs = writeoffActs.filter((act) =>
    isInMonth(act.completedAt ?? act.createdAt, selectedMonth),
  );
  const completedWriteoffActs = monthWriteoffActs.filter((act) => act.isCompleted);
  const hiredThisMonth = employees.filter((employee) =>
    isInMonth(employee.hireDate ?? employee.createdAt, selectedMonth),
  );

  const revenueCents = sumBy(completedOrders, (order) => order.totalCents);
  const averageCheckCents = completedOrders.length
    ? Math.round(revenueCents / completedOrders.length)
    : 0;
  const purchasesCents = sumBy(completedIncomingActs, (act) => act.totalCents);
  const writeoffsCents = sumBy(completedWriteoffActs, (act) => act.totalCents);
  const stockValueCents = sumBy(
    products,
    (product) => product.stockQuantity * product.priceCents,
  );
  const grossEstimateCents = revenueCents - purchasesCents - writeoffsCents;
  const totalEmployeeHours = sumBy(employees, (employee) => employee.monthlyHours ?? 0);
  const ordersByEmployees = sumBy(employees, (employee) => employee.ordersCount);
  const photoReadyCatalogItems = catalogItems.filter((item) => item.imageUrl).length;
  const linkedCatalogItems = catalogItems.filter((item) => item.technologicalCardId > 0).length;

  const sections: ReportSection[] = [
    {
      title: "Отчет по продажам",
      description: "Выручка, средний чек, закрытые и отмененные заказы за выбранный месяц.",
      metrics: [
        { label: "Выручка", value: formatMoney(revenueCents), hint: "Доставленные и оплаченные заказы" },
        { label: "Заказы", value: formatNumber(monthOrders.length), hint: `${completedOrders.length} закрытых · ${cancelledOrders.length} отмененных` },
        { label: "Средний чек", value: formatMoney(averageCheckCents), hint: "По закрытым заказам" },
        { label: "Отмены", value: percent(cancelledOrders.length, monthOrders.length), hint: "Доля отмененных заказов" },
      ],
    },
    {
      title: "Отчет по закупкам",
      description: "Завершенные приходы, сумма закупок и закупочная нагрузка месяца.",
      metrics: [
        { label: "Сумма закупок", value: formatMoney(purchasesCents), hint: `${completedIncomingActs.length} завершенных актов` },
        { label: "Позиций", value: formatNumber(sumBy(completedIncomingActs, (act) => act.itemsCount)), hint: "Строки в актах прихода" },
        { label: "Количество", value: formatNumber(sumBy(completedIncomingActs, (act) => act.totalQuantity)), hint: "Суммарное количество" },
        { label: "К выручке", value: percent(purchasesCents, revenueCents), hint: "Закупки относительно продаж" },
      ],
    },
    {
      title: "Отчет по списаниям",
      description: "Контроль брака, порчи, просрочки и внутреннего расхода.",
      metrics: [
        { label: "Сумма списаний", value: formatMoney(writeoffsCents), hint: `${completedWriteoffActs.length} завершенных актов` },
        { label: "Позиций", value: formatNumber(sumBy(completedWriteoffActs, (act) => act.itemsCount)), hint: "Строки в актах списания" },
        { label: "Количество", value: formatNumber(sumBy(completedWriteoffActs, (act) => act.totalQuantity)), hint: "Суммарное количество" },
        { label: "К выручке", value: percent(writeoffsCents, revenueCents), hint: "Списания относительно продаж" },
      ],
    },
    {
      title: "Отчет по маркетингу",
      description: "Готовность витрины, база лояльности и качество клиентского прайса.",
      metrics: [
        { label: "Лояльность", value: formatNumber(loyalty?.participantsCount ?? 0), hint: "Клиенты в программе" },
        { label: "Новые участники", value: formatNumber(loyalty?.monthlyParticipantsCount ?? 0), hint: "Показатель текущего месяца из API" },
        { label: "Фото в каталоге", value: `${photoReadyCatalogItems}/${catalogItems.length}`, hint: "Готовность визуальной витрины" },
        { label: "Техкарты", value: `${linkedCatalogItems}/${catalogItems.length}`, hint: "Связка прайса с производством" },
      ],
    },
    {
      title: "Отчет по сотрудникам",
      description: "Команда, часы, нагрузка и новые сотрудники за выбранный месяц.",
      metrics: [
        { label: "Сотрудники", value: formatNumber(employees.length), hint: "Активные профили команды" },
        { label: "Часы", value: formatNumber(totalEmployeeHours), hint: "Плановые часы из профилей" },
        { label: "Заказы", value: formatNumber(ordersByEmployees), hint: "Нагрузка по сотрудникам" },
        { label: "Новые", value: formatNumber(hiredThisMonth.length), hint: "Наняты или созданы в выбранном месяце" },
      ],
    },
  ];

  const popularReports = [
    {
      title: "Flash report",
      description: "Короткий еженедельный отчет: продажи, закупки, списания, маржа, проблемные зоны.",
    },
    {
      title: "COGS / food cost",
      description: "Себестоимость проданных товаров: начальный остаток + закупки - конечный остаток.",
    },
    {
      title: "Prime cost",
      description: "Ключевой ресторанный отчет: food cost + labor cost относительно выручки.",
    },
    {
      title: "Menu performance",
      description: "Популярные, непопулярные и высокомаржинальные позиции меню.",
    },
    {
      title: "Waste report",
      description: "Списания по причинам, категориям, сотрудникам и динамике потерь.",
    },
    {
      title: "Price change analysis",
      description: "Изменение цен прайса и закупок относительно себестоимости и маржи.",
    },
    {
      title: "Labor productivity",
      description: "Выручка и количество заказов на сотрудника или рабочий час.",
    },
    {
      title: "Customer retention",
      description: "Повторные клиенты, уровни лояльности, частота заказов и средний чек.",
    },
  ];

  const summary = [
    { label: "Продажи", value: formatMoney(revenueCents), hint: selectedMonth },
    { label: "Закупки", value: formatMoney(purchasesCents), hint: "Завершенные приходы" },
    { label: "Списания", value: formatMoney(writeoffsCents), hint: "Завершенные акты" },
    { label: "Оценка маржи", value: formatMoney(grossEstimateCents), hint: `Склад: ${formatMoney(stockValueCents)}` },
  ];

  return {
    selectedMonth,
    summary,
    sections,
    popularReports,
  };
}
