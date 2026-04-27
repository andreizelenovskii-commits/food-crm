import { hasPermission } from "@/modules/auth/authz";
import { USER_ROLE_LABELS, type SessionUser } from "@/modules/auth/auth.types";
import type {
  DashboardSnapshot,
  EmployeeDashboardSnapshot,
} from "@/modules/dashboard/dashboard.types";

const NUMBER_FORMATTER = new Intl.NumberFormat("ru-RU");
const STAFF_ROLES = new Set(["Повар", "Курьер", "Диспетчер"]);

export type DashboardPageSearchParams = {
  month?: string | string[];
};

export type DashboardPageProps = {
  user: SessionUser;
  dashboard: DashboardSnapshot;
  employeeDashboard: EmployeeDashboardSnapshot;
};

function formatMonthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export function resolveDashboardSelectedMonth(searchParams?: DashboardPageSearchParams) {
  const selectedMonthParam = Array.isArray(searchParams?.month)
    ? searchParams.month[0]
    : searchParams?.month;

  return selectedMonthParam?.trim() ?? "";
}

export function buildDashboardPageViewModel({
  user,
  dashboard,
  employeeDashboard,
}: DashboardPageProps) {
  const isStaffRole = STAFF_ROLES.has(user.role);
  const activeMonthDate =
    employeeDashboard && /^\d{4}-\d{2}$/.test(employeeDashboard.monthKey)
      ? new Date(
          Number(employeeDashboard.monthKey.slice(0, 4)),
          Number(employeeDashboard.monthKey.slice(5, 7)) - 1,
          1,
        )
      : new Date();
  const previousMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() - 1, 1);
  const nextMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 1);
  const monthNavigation = employeeDashboard
    ? {
        previousHref: `/dashboard?month=${formatMonthKey(previousMonth)}`,
        nextHref: `/dashboard?month=${formatMonthKey(nextMonth)}`,
      }
    : null;

  const moduleCards = [
    {
      href: "/dashboard/orders",
      label: "Заказы",
      value: dashboard.entityCounts.orders,
      description: "Список заказов",
      visible: hasPermission(user, "view_orders"),
    },
    {
      href: "/dashboard/clients",
      label: "Клиенты",
      value: dashboard.entityCounts.clients,
      description: "Список и создание",
      visible: hasPermission(user, "view_clients"),
    },
    {
      href: "/dashboard/inventory",
      label: "Склад",
      value: dashboard.entityCounts.products,
      description: "Товары и остатки",
      visible: hasPermission(user, "view_inventory"),
    },
    {
      href: "/dashboard/catalog",
      label: "Каталог",
      value: "Site",
      description: "Прайс и позиции сайта",
      visible: hasPermission(user, "view_catalog"),
    },
    {
      href: "/dashboard/website",
      label: "Наш сайт",
      value: "Web",
      description: "Ссылка и быстрый переход",
      visible: true,
    },
    {
      href: "/dashboard/reviews",
      label: "Отзывы",
      value: "New",
      description: "Оценки и комментарии",
      visible: true,
    },
    {
      href: "/dashboard/loyalty",
      label: "Система лояльности",
      value: "CRM",
      description: "Баллы, скидки, уровни",
      visible: true,
    },
    {
      href: "/dashboard/settings",
      label: "Настройки",
      value: "Core",
      description: "ОФД, кассы, интеграции",
      visible: hasPermission(user, "view_settings"),
    },
    {
      href: "/dashboard/employees",
      label: "Сотрудники",
      value: dashboard.entityCounts.employees,
      description: "Профили",
      visible: hasPermission(user, "view_employees"),
    },
    {
      href: "/dashboard/profile",
      label: "Мой профиль",
      value: USER_ROLE_LABELS[user.role],
      description: "Аккаунт и роль в системе",
      visible: true,
    },
  ];

  const visibleStatistics = [
    hasPermission(user, "view_orders")
      ? {
          label: "Всего заказов",
          value: NUMBER_FORMATTER.format(dashboard.entityCounts.orders),
          hint: "Все заказы, доступные для просмотра",
        }
      : null,
    hasPermission(user, "view_clients")
      ? {
          label: "Клиентская база",
          value: NUMBER_FORMATTER.format(dashboard.entityCounts.clients),
          hint: "Клиенты и организации в базе",
        }
      : null,
    hasPermission(user, "view_inventory")
      ? {
          label: "Складские позиции",
          value: NUMBER_FORMATTER.format(dashboard.entityCounts.products),
          hint: "Товары, доступные для продажи",
        }
      : null,
    hasPermission(user, "view_employees")
      ? {
          label: "Команда",
          value: NUMBER_FORMATTER.format(dashboard.entityCounts.employees),
          hint: "Сотрудники с заведёнными профилями",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    isStaffRole,
    monthNavigation,
    showSalesSection: hasPermission(user, "view_orders") && !isStaffRole,
    visibleModuleCards: moduleCards.filter((card) => card.visible),
    visibleStatistics,
  };
}
