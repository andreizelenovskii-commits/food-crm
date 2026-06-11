export const SALES_PERIODS = ["day", "week", "month", "year"] as const;

export type SalesPeriod = (typeof SALES_PERIODS)[number];

export const SALES_PERIOD_LABELS: Record<SalesPeriod, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
  year: "Год",
};

export type SalesPeriodRange = {
  period: SalesPeriod;
  date: string;
  selectedDate: string;
  start: Date;
  end: Date;
  label: string;
  previousDate: string;
  nextDate: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatMonthInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function parseDateInput(value: string | undefined, fallback = new Date()) {
  if (!value) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }

  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value);
  if (!match) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }

  const year = Number(match[1]);
  const month = Number(match[2] ?? "01") - 1;
  const day = Number(match[3] ?? "01");
  const parsed = new Date(year, month, day);

  return Number.isNaN(parsed.getTime())
    ? new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate())
    : parsed;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function addYears(date: Date, years: number) {
  return new Date(date.getFullYear() + years, 0, 1);
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

function formatRangeLabel(start: Date, end: Date, period: SalesPeriod) {
  if (period === "day") {
    return start.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  }

  if (period === "month") {
    return start.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  }

  if (period === "year") {
    return start.toLocaleDateString("ru-RU", { year: "numeric" });
  }

  const lastDay = addDays(end, -1);
  return `${start.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} - ${lastDay.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function normalizeSalesPeriod(period?: string | null): SalesPeriod {
  return SALES_PERIODS.includes(period as SalesPeriod) ? (period as SalesPeriod) : "month";
}

export function buildSalesPeriodRange(periodInput?: string | null, dateInput?: string | null): SalesPeriodRange {
  const period = normalizeSalesPeriod(periodInput);
  const base = parseDateInput(dateInput ?? undefined);
  const selectedDate = formatDateInput(base);
  let start: Date;
  let end: Date;
  let previousDate: string;
  let nextDate: string;
  let date: string;

  if (period === "day") {
    start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    end = addDays(start, 1);
    previousDate = formatDateInput(addDays(start, -1));
    nextDate = formatDateInput(addDays(start, 1));
    date = formatDateInput(start);
  } else if (period === "week") {
    start = startOfWeek(base);
    end = addDays(start, 7);
    previousDate = formatDateInput(addDays(start, -7));
    nextDate = formatDateInput(addDays(start, 7));
    date = formatDateInput(start);
  } else if (period === "year") {
    start = new Date(base.getFullYear(), 0, 1);
    end = addYears(start, 1);
    previousDate = String(start.getFullYear() - 1);
    nextDate = String(start.getFullYear() + 1);
    date = String(start.getFullYear());
  } else {
    start = new Date(base.getFullYear(), base.getMonth(), 1);
    end = addMonths(start, 1);
    previousDate = formatMonthInput(addMonths(start, -1));
    nextDate = formatMonthInput(addMonths(start, 1));
    date = formatMonthInput(start);
  }

  return {
    period,
    date,
    selectedDate,
    start,
    end,
    label: formatRangeLabel(start, end, period),
    previousDate,
    nextDate,
  };
}

export function isDateInRange(value: string | null | undefined, range: SalesPeriodRange) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= range.start && date < range.end;
}

export function buildSalesHref(period: SalesPeriod, date: string) {
  return `/dashboard/sales?period=${period}&date=${encodeURIComponent(date)}`;
}
